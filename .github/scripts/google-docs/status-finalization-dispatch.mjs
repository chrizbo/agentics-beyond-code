#!/usr/bin/env node

import fs from "node:fs/promises";
import { documentToStatusMarkdown } from "./status-finalization-convert.mjs";
import { findFinalizationGate } from "./status-finalization-gate.mjs";
import { lifecycleSearchQuery } from "./status-draft-write.mjs";

const REQUIRED_ENV = [
  "GH_REPO",
  "GH_TOKEN",
  "DISCUSSION_URL",
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "GOOGLE_OAUTH_REFRESH_TOKEN",
  "GOOGLE_DOCS_SCOPE_TYPE",
  "GOOGLE_DOCS_SCOPE_ROOT_ID",
  "GOOGLE_DOCS_DRAFTS_FOLDER_ID",
];

function requireEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(`Missing required environment values: ${missing.join(", ")}`);
  }
  if (process.env.GOOGLE_DOCS_SCOPE_TYPE !== "folder") {
    throw new Error("The staged MVP currently supports GOOGLE_DOCS_SCOPE_TYPE=folder.");
  }
  if (process.env.TRIGGER_KIND === "discussion_comment") {
    if (process.env.TRIGGER_COMMAND?.trim() !== "/finalize-status") {
      throw new Error("Discussion comment trigger must be exactly /finalize-status.");
    }
    const allowed = (process.env.GOOGLE_DOCS_FINALIZER_LOGINS || "")
      .split(",")
      .map((login) => login.trim())
      .filter(Boolean);
    if (!allowed.length || !allowed.includes(process.env.TRIGGER_ACTOR)) {
      throw new Error(`GitHub actor ${process.env.TRIGGER_ACTOR} is not allowed to finalize status.`);
    }
  }
}

async function githubGraphql(query, variables) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${process.env.GH_TOKEN}`,
      "content-type": "application/json",
      "user-agent": "agentics-google-docs-status-finalization",
    },
    body: JSON.stringify({ query, variables }),
  });
  const result = await response.json();
  if (!response.ok || result.errors?.length) {
    throw new Error(`GitHub GraphQL request failed: ${JSON.stringify(result.errors || result)}`);
  }
  return result.data;
}

async function discussionFromUrl(url) {
  const match = url.match(/\/discussions\/(\d+)(?:$|[?#])/);
  if (!match) {
    throw new Error("DISCUSSION_URL must be a discussion URL for the current repository.");
  }
  const [owner, name] = process.env.GH_REPO.split("/");
  const data = await githubGraphql(
    `query($owner:String!,$name:String!,$number:Int!){
      repository(owner:$owner,name:$name){
        discussion(number:$number){number title body url}
      }
    }`,
    { owner, name, number: Number(match[1]) },
  );
  if (!data.repository?.discussion || data.repository.discussion.url !== url) {
    throw new Error("Source Discussion was not found in the current repository.");
  }
  return data.repository.discussion;
}

function lifecycleFromDiscussion(discussion) {
  const week = `${discussion.title}\n${discussion.body}`.match(
    /Week of\s+(\d{4}-\d{2}-\d{2})/i,
  )?.[1];
  if (!week) {
    throw new Error("Discussion title or body must contain 'Week of YYYY-MM-DD'.");
  }
  return `weekly-status:${week}`;
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

async function driveMetadata(token, id) {
  return googleRequest(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,parents,webViewLink,appProperties,modifiedTime`,
    token,
  );
}

async function verifyDescendant(token, id, rootId) {
  let current = await driveMetadata(token, id);
  const visited = new Set();
  while (current.id !== rootId) {
    if (visited.has(current.id) || !current.parents?.length) {
      throw new Error(`${id} is not inside configured root ${rootId}.`);
    }
    visited.add(current.id);
    current = await driveMetadata(token, current.parents[0]);
  }
}

async function findLifecycleDraft(token, lifecycleKey) {
  const params = new URLSearchParams({
    q: lifecycleSearchQuery(process.env.GOOGLE_DOCS_DRAFTS_FOLDER_ID, lifecycleKey),
    fields: "files(id,name,mimeType,parents,webViewLink,appProperties,modifiedTime)",
    pageSize: "10",
  });
  const result = await googleRequest(`https://www.googleapis.com/drive/v3/files?${params}`, token);
  if (result.files.length !== 1) {
    throw new Error(`Expected exactly one draft for lifecycle key ${lifecycleKey}.`);
  }
  return result.files[0];
}

async function docsDocument(token, id) {
  return googleRequest(
    `https://docs.googleapis.com/v1/documents/${encodeURIComponent(id)}?includeTabsContent=true`,
    token,
  );
}

async function driveComments(token, id) {
  const params = new URLSearchParams({
    fields: "comments(id,content,resolved,createdTime,modifiedTime),nextPageToken",
    pageSize: "100",
  });
  const result = await googleRequest(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}/comments?${params}`,
    token,
  );
  if (result.nextPageToken) {
    throw new Error("Draft has more than 100 comments; refusing incomplete gate validation.");
  }
  return result.comments || [];
}

function summary(plan) {
  return [
    "## Staged Google Docs Status Finalization",
    "",
    "- Validation: passed",
    "- GitHub writes: disabled",
    "- Google writes: disabled",
    `- Trigger: \`${plan.trigger_kind}\``,
    `- Lifecycle key: \`${plan.lifecycle_key}\``,
    `- Source Discussion: ${plan.github_source_url}`,
    `- Draft document: ${plan.document_url}`,
    `- Finalization gate: \`${plan.finalization_gate_status}\``,
    `- Proposed title: ${plan.proposed_title}`,
    "",
    "The exact proposed Discussion body is available in the uploaded artifact.",
    "",
  ].join("\n");
}

async function main() {
  requireEnv();
  const discussion = await discussionFromUrl(process.env.DISCUSSION_URL);
  const expectedPrefix = process.env.DISCUSSION_TITLE_PREFIX || "[Weekly Status] ";
  if (!discussion.title.startsWith(expectedPrefix)) {
    throw new Error(`Discussion title must start with ${expectedPrefix}`);
  }

  const lifecycleKey = lifecycleFromDiscussion(discussion);
  const token = await accessToken();
  const draft = await findLifecycleDraft(token, lifecycleKey);
  await verifyDescendant(token, draft.id, process.env.GOOGLE_DOCS_SCOPE_ROOT_ID);
  const document = await docsDocument(token, draft.id);
  const serialized = JSON.stringify(document);
  if (!serialized.includes(lifecycleKey) || !serialized.includes(discussion.url)) {
    throw new Error("Draft readback is missing its lifecycle key or source Discussion URL.");
  }
  const finalizationGate = findFinalizationGate(
    await driveComments(token, draft.id),
    lifecycleKey,
  );
  if (!finalizationGate) {
    throw new Error("Draft is missing its automation-owned finalization gate comment.");
  }

  const proposedBody = documentToStatusMarkdown(document);
  const plan = {
    operation: "google_docs_stage_status_finalization",
    staged: true,
    trigger_kind: process.env.TRIGGER_KIND || "workflow_dispatch",
    trigger_actor: process.env.TRIGGER_ACTOR || process.env.GITHUB_ACTOR,
    lifecycle_key: lifecycleKey,
    github_source_url: discussion.url,
    document_id: draft.id,
    document_url: `https://docs.google.com/document/d/${draft.id}/edit`,
    document_modified_time: draft.modifiedTime,
    finalization_gate_comment_id: finalizationGate.id,
    finalization_gate_status: finalizationGate.resolved ? "resolved" : "open",
    proposed_title: discussion.title,
    proposed_body: proposedBody,
  };

  const outputDir = process.env.OUTPUT_DIR || "/tmp/google-docs-status-finalization";
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(`${outputDir}/plan.json`, `${JSON.stringify(plan, null, 2)}\n`);
  await fs.writeFile(`${outputDir}/proposed-discussion.md`, proposedBody);
  const markdown = summary(plan);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
  }
  console.log(markdown);
}

await main();
