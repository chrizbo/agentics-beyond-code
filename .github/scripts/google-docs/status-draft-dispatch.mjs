#!/usr/bin/env node

import fs from "node:fs/promises";
import { buildStatusDraftPlan } from "./status-draft-plan.mjs";
import {
  lifecycleSearchQuery,
  markdownLinkRequests,
  placeholderRequests,
  verifyFilledDocument,
} from "./status-draft-write.mjs";

const REQUIRED_ENV = [
  "GH_REPO",
  "GH_TOKEN",
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "GOOGLE_OAUTH_REFRESH_TOKEN",
  "GOOGLE_DOCS_ENABLED",
  "GOOGLE_DOCS_SCOPE_TYPE",
  "GOOGLE_DOCS_SCOPE_ROOT_ID",
  "GOOGLE_DOCS_DRAFTS_FOLDER_ID",
  "GOOGLE_DOCS_ARCHIVE_FOLDER_ID",
  "GOOGLE_DOCS_DRAFT_TEMPLATE_ID",
  "GOOGLE_DOCS_DRAFT_TITLE_PREFIX",
];

function requireEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(`Missing required environment values: ${missing.join(", ")}`);
  }
  if (process.env.GOOGLE_DOCS_SCOPE_TYPE !== "folder") {
    throw new Error("The staged MVP currently supports GOOGLE_DOCS_SCOPE_TYPE=folder.");
  }
}

async function githubGraphql(query, variables) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${process.env.GH_TOKEN}`,
      "content-type": "application/json",
      "user-agent": "agentics-google-docs-status-dispatch",
    },
    body: JSON.stringify({ query, variables }),
  });
  const result = await response.json();
  if (!response.ok || result.errors?.length) {
    throw new Error(`GitHub GraphQL request failed: ${JSON.stringify(result.errors || result)}`);
  }
  return result.data;
}

async function discussionFromNumber(number) {
  const [owner, name] = process.env.GH_REPO.split("/");
  const data = await githubGraphql(
    `query($owner:String!,$name:String!,$number:Int!){
      repository(owner:$owner,name:$name){
        discussion(number:$number){number title body url}
      }
    }`,
    { owner, name, number },
  );
  if (!data.repository?.discussion) {
    throw new Error(`Discussion #${number} was not found.`);
  }
  return data.repository.discussion;
}

async function discussionFromArtifact(path) {
  const content = await fs.readFile(path, "utf8");
  for (const line of content.split(/\r?\n/).filter(Boolean)) {
    const item = JSON.parse(line);
    if (item.type === "create_discussion" && item.number) {
      return discussionFromNumber(Number(item.number));
    }
  }
  throw new Error("No create_discussion item was found in the safe-output artifact.");
}

async function discussionFromUrl(url) {
  const match = url.match(/\/discussions\/(\d+)(?:$|[?#])/);
  if (!match) {
    throw new Error("DISCUSSION_URL must be a discussion URL for the current repository.");
  }
  return discussionFromNumber(Number(match[1]));
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

async function driveMetadata(token, id) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,parents`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!response.ok) {
    throw new Error(`Drive metadata read failed for ${id}: HTTP ${response.status}`);
  }
  return response.json();
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
    throw new Error(
      `Google API request failed: HTTP ${response.status} ${JSON.stringify(result)}`,
    );
  }
  return result;
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

async function docsDocument(token, id) {
  const response = await fetch(
    `https://docs.googleapis.com/v1/documents/${encodeURIComponent(id)}?includeTabsContent=true`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!response.ok) {
    throw new Error(`Docs read failed for ${id}: HTTP ${response.status}`);
  }
  return response.json();
}

async function verifyGoogleScope(replacements) {
  const token = await accessToken();
  const rootId = process.env.GOOGLE_DOCS_SCOPE_ROOT_ID;
  const root = await driveMetadata(token, rootId);

  if (root.mimeType !== "application/vnd.google-apps.folder") {
    throw new Error("GOOGLE_DOCS_SCOPE_ROOT_ID must identify a folder.");
  }

  const targets = [
    process.env.GOOGLE_DOCS_DRAFTS_FOLDER_ID,
    process.env.GOOGLE_DOCS_ARCHIVE_FOLDER_ID,
    process.env.GOOGLE_DOCS_DRAFT_TEMPLATE_ID,
  ];
  for (const id of targets) {
    await verifyDescendant(token, id, rootId);
  }

  const template = await driveMetadata(token, process.env.GOOGLE_DOCS_DRAFT_TEMPLATE_ID);
  if (template.mimeType !== "application/vnd.google-apps.document") {
    throw new Error("GOOGLE_DOCS_DRAFT_TEMPLATE_ID must identify a Google Doc.");
  }

  const document = await docsDocument(token, template.id);
  const serializedDocument = JSON.stringify(document);
  const missingPlaceholders = Object.keys(replacements).filter(
    (placeholder) => !serializedDocument.includes(placeholder),
  );
  if (missingPlaceholders.length) {
    throw new Error(
      `Live template is missing placeholders: ${missingPlaceholders.join(", ")}`,
    );
  }

  return {
    token,
    root,
    template,
    verifiedPlaceholderCount: Object.keys(replacements).length,
  };
}

async function findLifecycleDraft(token, lifecycleKey) {
  const query = lifecycleSearchQuery(
    process.env.GOOGLE_DOCS_DRAFTS_FOLDER_ID,
    lifecycleKey,
  );
  const params = new URLSearchParams({
    q: query,
    fields: "files(id,name,mimeType,parents,webViewLink,appProperties)",
    pageSize: "10",
  });
  const result = await googleRequest(
    `https://www.googleapis.com/drive/v3/files?${params}`,
    token,
  );
  if (result.files.length > 1) {
    throw new Error(`Multiple drafts found for lifecycle key ${lifecycleKey}.`);
  }
  return result.files[0];
}

async function copyTemplate(token, plan) {
  return googleRequest(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(process.env.GOOGLE_DOCS_DRAFT_TEMPLATE_ID)}/copy?supportsAllDrives=true`,
    token,
    {
      method: "POST",
      body: JSON.stringify({
        name: plan.proposed_title,
        parents: [process.env.GOOGLE_DOCS_DRAFTS_FOLDER_ID],
        appProperties: {
          agenticsLifecycleKey: plan.lifecycle_key,
          agenticsSourceType: "github-discussion",
        },
      }),
    },
  );
}

async function fillDraft(token, draft, plan) {
  let current = await docsDocument(token, draft.id);
  const serialized = JSON.stringify(current);
  const placeholdersPresent = Object.keys(plan.replacements).filter((placeholder) =>
    serialized.includes(placeholder),
  );

  if (placeholdersPresent.length) {
    await googleRequest(
      `https://docs.googleapis.com/v1/documents/${encodeURIComponent(draft.id)}:batchUpdate`,
      token,
      {
        method: "POST",
        body: JSON.stringify({
          requests: placeholderRequests(plan.replacements),
          writeControl: { requiredRevisionId: current.revisionId },
        }),
      },
    );
    current = await docsDocument(token, draft.id);
  }

  const linkRequests = markdownLinkRequests(current);
  if (linkRequests.length) {
    await googleRequest(
      `https://docs.googleapis.com/v1/documents/${encodeURIComponent(draft.id)}:batchUpdate`,
      token,
      {
        method: "POST",
        body: JSON.stringify({
          requests: linkRequests,
          writeControl: { requiredRevisionId: current.revisionId },
        }),
      },
    );
  }

  const after = await docsDocument(token, draft.id);
  verifyFilledDocument(after, plan);
  return {
    draft: await driveMetadata(token, draft.id),
    result: placeholdersPresent.length
      ? "created_and_filled"
      : linkRequests.length
        ? "formatted"
        : "reused",
  };
}

async function executeLiveWrite(google, plan) {
  let draft = await findLifecycleDraft(google.token, plan.lifecycle_key);
  if (!draft) {
    draft = await copyTemplate(google.token, plan);
  }
  await verifyDescendant(
    google.token,
    draft.id,
    process.env.GOOGLE_DOCS_SCOPE_ROOT_ID,
  );
  return fillDraft(google.token, draft, plan);
}

function summary(plan, google, liveResult) {
  const writesEnabled = process.env.GOOGLE_DOCS_ENABLED === "true";
  return [
    `## ${writesEnabled ? "Live" : "Staged"} Google Docs Status Draft`,
    "",
    `- Validation: passed`,
    `- Google writes enabled: ${writesEnabled}`,
    `- Operation: \`${plan.operation}\``,
    `- Lifecycle key: \`${plan.lifecycle_key}\``,
    `- Proposed title: ${plan.proposed_title}`,
    `- Source Discussion: ${plan.github_source_url}`,
    `- Template: ${google.template.name} (\`${google.template.id}\`)`,
    `- Destination folder: \`${process.env.GOOGLE_DOCS_DRAFTS_FOLDER_ID}\``,
    `- Configured root: ${google.root.name} (\`${google.root.id}\`)`,
    `- Verified template placeholders: ${google.verifiedPlaceholderCount}`,
    ...(liveResult
      ? [
          `- Write result: \`${liveResult.result}\``,
          `- Draft document: https://docs.google.com/document/d/${liveResult.draft.id}/edit`,
        ]
      : []),
    "",
    writesEnabled
      ? "Google Doc readback verification passed. No GitHub Discussion was modified."
      : "No Google Doc or GitHub Discussion was modified.",
    "",
  ].join("\n");
}

async function main() {
  requireEnv();
  if (!["true", "false"].includes(process.env.GOOGLE_DOCS_ENABLED)) {
    throw new Error("GOOGLE_DOCS_ENABLED must be exactly true or false.");
  }

  const discussion = process.env.DISCUSSION_URL
    ? await discussionFromUrl(process.env.DISCUSSION_URL)
    : await discussionFromArtifact(
        process.env.SAFE_OUTPUT_ITEMS_PATH ||
          "/tmp/safe-outputs-items/safe-output-items.jsonl",
      );
  const expectedPrefix = process.env.DISCUSSION_TITLE_PREFIX || "[Weekly Status] ";
  if (!discussion.title.startsWith(expectedPrefix)) {
    throw new Error(`Discussion title must start with ${expectedPrefix}`);
  }

  const plan = buildStatusDraftPlan({
    discussionTitle: discussion.title,
    discussionBody: discussion.body,
    discussionUrl: discussion.url,
    owner: process.env.GITHUB_ACTOR,
    reviewDeadline: process.env.GOOGLE_DOCS_REVIEW_DEADLINE,
    titlePrefix: process.env.GOOGLE_DOCS_DRAFT_TITLE_PREFIX,
  });
  const google = await verifyGoogleScope(plan.replacements);
  const liveResult =
    process.env.GOOGLE_DOCS_ENABLED === "true"
      ? await executeLiveWrite(google, plan)
      : undefined;
  const outputPath = process.env.PLAN_OUTPUT_PATH || "/tmp/google-docs-status-draft-plan.json";

  const output = {
    ...plan,
    staged: process.env.GOOGLE_DOCS_ENABLED !== "true",
    ...(liveResult
      ? {
          result: liveResult.result,
          document_id: liveResult.draft.id,
          document_url: `https://docs.google.com/document/d/${liveResult.draft.id}/edit`,
        }
      : {}),
  };
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  const markdown = summary(output, google, liveResult);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
  }
  console.log(markdown);
  console.log(`Plan written to ${outputPath}`);
}

await main();
