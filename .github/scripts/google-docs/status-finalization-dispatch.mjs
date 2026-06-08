#!/usr/bin/env node

import fs from "node:fs/promises";
import { documentToStatusMarkdown } from "./status-finalization-convert.mjs";
import { findFinalizationGate } from "./status-finalization-gate.mjs";
import {
  canPublishFinalization,
  finalSlackChannel,
  finalSlackMessage,
} from "./status-finalization-publish.mjs";

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
  "GOOGLE_DOCS_ARCHIVE_FOLDER_ID",
  "GOOGLE_DOCS_FINALIZATION_ENABLED",
];

function requireEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(`Missing required environment values: ${missing.join(", ")}`);
  }
  if (process.env.GOOGLE_DOCS_SCOPE_TYPE !== "folder") {
    throw new Error("The staged MVP currently supports GOOGLE_DOCS_SCOPE_TYPE=folder.");
  }
  if (!["true", "false"].includes(process.env.GOOGLE_DOCS_FINALIZATION_ENABLED)) {
    throw new Error("GOOGLE_DOCS_FINALIZATION_ENABLED must be exactly true or false.");
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
        discussion(number:$number){id number title body url}
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

async function googleRequest(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...options.headers,
    },
  });
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

async function findLifecycleDocument(token, lifecycleKey) {
  const params = new URLSearchParams({
    q: `trashed = false and appProperties has { key='agenticsLifecycleKey' and value='${lifecycleKey}' }`,
    fields: "files(id,name,mimeType,parents,webViewLink,appProperties,modifiedTime)",
    pageSize: "10",
  });
  const result = await googleRequest(`https://www.googleapis.com/drive/v3/files?${params}`, token);
  if (result.files.length !== 1) {
    throw new Error(`Expected exactly one document for lifecycle key ${lifecycleKey}.`);
  }
  return result.files[0];
}

async function updateDiscussion(discussion, title, body) {
  await githubGraphql(
    `mutation($id:ID!,$title:String!,$body:String!){
      updateDiscussion(input:{discussionId:$id,title:$title,body:$body}){discussion{id url title body}}
    }`,
    { id: discussion.id, title, body },
  );
}

async function patchDriveFile(token, draft, body) {
  return googleRequest(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(draft.id)}?fields=id,parents,appProperties`,
    token,
    { method: "PATCH", body: JSON.stringify(body) },
  );
}

async function markProperty(token, draft, key, value = "true") {
  return patchDriveFile(token, draft, {
    appProperties: { ...(draft.appProperties || {}), [key]: value },
  });
}

async function postFinalSlack(discussion, proposedBody) {
  if (!process.env.SLACK_BOT_TOKEN) {
    throw new Error("SLACK_BOT_TOKEN is required for live finalization.");
  }
  const channel = finalSlackChannel(
    process.env.SLACK_ARTIFACT_CHANNEL_MAP,
    process.env.SLACK_ALLOWED_CHANNEL_IDS,
  );
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      channel,
      text: finalSlackMessage({
        discussionTitle: discussion.title,
        discussionUrl: discussion.url,
        discussionBody: proposedBody,
      }),
      unfurl_links: false,
      unfurl_media: false,
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(`Final Slack notification failed: ${result.error || response.statusText}`);
  }
}

async function finalizeDocStatus(token, draft) {
  await googleRequest(
    `https://docs.googleapis.com/v1/documents/${encodeURIComponent(draft.id)}:batchUpdate`,
    token,
    {
      method: "POST",
      body: JSON.stringify({
        requests: [
          {
            replaceAllText: {
              containsText: {
                text: "Status: Needs team shaping",
                matchCase: true,
              },
              replaceText: "Status: Finalized",
            },
          },
        ],
      }),
    },
  );
}

async function publish(token, discussion, draft, proposedBody) {
  let current = draft;
  const results = [];

  if (current.appProperties?.agenticsDiscussionPublished !== "true") {
    await updateDiscussion(discussion, discussion.title, proposedBody);
    current = await markProperty(token, current, "agenticsDiscussionPublished");
    results.push("discussion_published");
  }
  if (current.appProperties?.agenticsSlackFinalNotified !== "true") {
    await postFinalSlack(discussion, proposedBody);
    current = await markProperty(token, current, "agenticsSlackFinalNotified");
    results.push("slack_notified");
  }
  if (current.appProperties?.agenticsDocFinalized !== "true") {
    await finalizeDocStatus(token, current);
    const finalizedDocument = await docsDocument(token, current.id);
    if (!JSON.stringify(finalizedDocument).includes("Status: Finalized")) {
      throw new Error("Google Doc readback did not confirm finalized status.");
    }
    current = await markProperty(token, current, "agenticsDocFinalized");
    results.push("doc_finalized");
  }
  if (current.appProperties?.agenticsFinalized !== "true") {
    current = await markProperty(token, current, "agenticsFinalized");
    results.push("finalized");
  }
  if (!current.parents?.includes(process.env.GOOGLE_DOCS_ARCHIVE_FOLDER_ID)) {
    current = await googleRequest(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(current.id)}?addParents=${encodeURIComponent(process.env.GOOGLE_DOCS_ARCHIVE_FOLDER_ID)}&removeParents=${encodeURIComponent(process.env.GOOGLE_DOCS_DRAFTS_FOLDER_ID)}&fields=id,parents,appProperties`,
      token,
      { method: "PATCH", body: "{}" },
    );
    results.push("archived");
  }
  return results.length ? results.join(",") : "already_finalized";
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
  const live = plan.staged === false;
  return [
    `## ${live ? "Live" : "Staged"} Google Docs Status Finalization`,
    "",
    "- Validation: passed",
    `- GitHub writes: ${live ? "enabled" : "disabled"}`,
    `- Google writes: ${live ? "enabled" : "disabled"}`,
    `- Trigger: \`${plan.trigger_kind}\``,
    `- Lifecycle key: \`${plan.lifecycle_key}\``,
    `- Source Discussion: ${plan.github_source_url}`,
    `- Draft document: ${plan.document_url}`,
    `- Finalization gate: \`${plan.finalization_gate_status}\``,
    `- Proposed title: ${plan.proposed_title}`,
    `- Result: \`${plan.result}\``,
    "",
    live
      ? "The final Discussion, Slack notification, and archived Doc state were verified."
      : "The exact proposed Discussion body is available in the uploaded artifact.",
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
  const draft = await findLifecycleDocument(token, lifecycleKey);
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
  const publishEnabled = canPublishFinalization({
    enabled: process.env.GOOGLE_DOCS_FINALIZATION_ENABLED === "true",
    triggerKind: process.env.TRIGGER_KIND || "workflow_dispatch",
    gateResolved: finalizationGate.resolved === true,
  });
  const publishResult = publishEnabled
    ? await publish(token, discussion, draft, proposedBody)
    : "staged";
  const finalDiscussion = publishEnabled
    ? await discussionFromUrl(discussion.url)
    : discussion;
  if (
    publishEnabled &&
    finalDiscussion.body.trimEnd() !== proposedBody.trimEnd()
  ) {
    throw new Error("GitHub Discussion readback did not match the shaped Google Doc.");
  }
  const finalDraft = publishEnabled ? await driveMetadata(token, draft.id) : draft;
  if (
    publishEnabled &&
    (!finalDraft.parents?.includes(process.env.GOOGLE_DOCS_ARCHIVE_FOLDER_ID) ||
      finalDraft.appProperties?.agenticsFinalized !== "true")
  ) {
    throw new Error("Drive readback did not confirm finalized archive state.");
  }
  const plan = {
    operation: publishEnabled
      ? "google_docs_publish_status_finalization"
      : "google_docs_stage_status_finalization",
    staged: !publishEnabled,
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
    result: publishResult,
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
