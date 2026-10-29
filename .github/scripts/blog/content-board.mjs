#!/usr/bin/env node
// Moves an issue's card on the Content Pipeline board and resets
// "Waiting since". Gate dispatches and the Pages deploy use this so the
// board follows the gate labels.
//
// Usage: node content-board.mjs <issue-number> <status> [published-url]
// Env:   GH_TOKEN (project scope), GH_REPO, CONTENT_PROJECT_OWNER, CONTENT_PROJECT_NUMBER
import { spawnSync } from "node:child_process";

function gh(args) {
  const result = spawnSync("gh", args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`gh ${args.join(" ")} failed\n${result.stderr}`);
  return result.stdout;
}
const ghJson = (args) => JSON.parse(gh(args));

const [issueArg, status, publishedUrl] = process.argv.slice(2);
if (!issueArg || !status) {
  console.error("Usage: content-board.mjs <issue-number> <status> [published-url]");
  process.exit(2);
}

const owner = process.env.CONTENT_PROJECT_OWNER || "chrizbo";
const number = process.env.CONTENT_PROJECT_NUMBER || "4";
const repo = process.env.GH_REPO || ghJson(["repo", "view", "--json", "nameWithOwner"]).nameWithOwner;
const issueUrl = `https://github.com/${repo}/issues/${issueArg}`;

const project = ghJson(["project", "view", number, "--owner", owner, "--format", "json"]);
const fields = ghJson(["project", "field-list", number, "--owner", owner, "--format", "json"]).fields;
const field = (name) => {
  const found = fields.find((item) => item.name === name);
  if (!found) throw new Error(`Content Pipeline board has no "${name}" field`);
  return found;
};
const statusField = field("Status");
const option = statusField.options.find((item) => item.name === status);
if (!option) throw new Error(`Unknown status "${status}". Options: ${statusField.options.map((item) => item.name).join(", ")}`);

const item = ghJson(["project", "item-add", number, "--owner", owner, "--url", issueUrl, "--format", "json"]);
const edit = (fieldId, ...value) => gh(["project", "item-edit", "--id", item.id, "--project-id", project.id, "--field-id", fieldId, ...value]);

edit(statusField.id, "--single-select-option-id", option.id);
edit(field("Waiting since").id, "--date", new Date().toISOString().slice(0, 10));
if (publishedUrl) edit(field("Published URL").id, "--text", publishedUrl);

console.log(`#${issueArg} → ${status}`);
