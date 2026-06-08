#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import { lifecycleKeyFromFinalizationGate } from "./status-finalization-gate.mjs";

const REQUIRED_ENV = [
  "GH_REPO",
  "GH_TOKEN",
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "GOOGLE_OAUTH_REFRESH_TOKEN",
  "GOOGLE_DOCS_DRAFTS_FOLDER_ID",
];

function requireEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(`Missing required environment values: ${missing.join(", ")}`);
  }
}

async function accessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) {
    throw new Error(`Google token refresh failed: ${result.error_description || result.error}`);
  }
  return result.access_token;
}

async function googleRequest(url, token) {
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(`Google API request failed: HTTP ${response.status} ${JSON.stringify(result)}`);
  }
  return result;
}

async function draftDocuments(token) {
  const folderId = process.env.GOOGLE_DOCS_DRAFTS_FOLDER_ID.replaceAll("'", "\\'");
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.document'`,
    fields: "files(id,name)",
    pageSize: "100",
  });
  const result = await googleRequest(`https://www.googleapis.com/drive/v3/files?${params}`, token);
  return result.files || [];
}

async function comments(token, documentId) {
  const params = new URLSearchParams({
    fields: "comments(id,content,resolved),nextPageToken",
    pageSize: "100",
  });
  const result = await googleRequest(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(documentId)}/comments?${params}`,
    token,
  );
  if (result.nextPageToken) {
    throw new Error(`${documentId} has more than 100 comments; refusing incomplete gate scan.`);
  }
  return result.comments || [];
}

async function document(token, documentId) {
  return googleRequest(
    `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}?includeTabsContent=true`,
    token,
  );
}

function sourceDiscussion(documentValue) {
  const escapedRepo = process.env.GH_REPO.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return JSON.stringify(documentValue).match(
    new RegExp(`https://github\\.com/${escapedRepo}/discussions/\\d+`),
  )?.[0];
}

async function main() {
  requireEnv();
  const token = await accessToken();
  const resolved = [];

  for (const draft of await draftDocuments(token)) {
    for (const comment of await comments(token, draft.id)) {
      const lifecycleKey = lifecycleKeyFromFinalizationGate(comment);
      if (!lifecycleKey || comment.resolved !== true) {
        continue;
      }
      const discussionUrl = sourceDiscussion(await document(token, draft.id));
      if (!discussionUrl) {
        throw new Error(`Resolved gate ${comment.id} is missing a source Discussion URL.`);
      }
      resolved.push({
        document_id: draft.id,
        document_name: draft.name,
        comment_id: comment.id,
        lifecycle_key: lifecycleKey,
        discussion_url: discussionUrl,
      });
    }
  }

  const outputDir = process.env.OUTPUT_DIR || "/tmp/google-docs-status-finalization-resolved";
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(`${outputDir}/resolved-gates.json`, `${JSON.stringify(resolved, null, 2)}\n`);

  for (const gate of resolved) {
    const result = spawnSync(
      process.execPath,
      [new URL("./status-finalization-dispatch.mjs", import.meta.url).pathname],
      {
        env: {
          ...process.env,
          DISCUSSION_URL: gate.discussion_url,
          TRIGGER_KIND: "google_doc_comment_resolved",
          TRIGGER_ACTOR: "google-doc-collaborator",
          OUTPUT_DIR: `${outputDir}/${gate.lifecycle_key.replaceAll(":", "-")}`,
        },
        encoding: "utf8",
      },
    );
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    if (result.status !== 0) {
      throw new Error(`Staging resolved gate ${gate.comment_id} failed.`);
    }
  }

  console.log(`Resolved finalization gates staged: ${resolved.length}`);
}

await main();
