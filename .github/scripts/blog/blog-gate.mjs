#!/usr/bin/env node
// Applies a release blog gate command from an issue comment.
// Env: GH_TOKEN, GH_REPO, ISSUE_NUMBER, COMMENT_BODY, ACTOR, BLOG_APPROVERS (optional, comma-separated)
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decideGate } from "./gate.mjs";

function gh(args, { allowFailure = false } = {}) {
  const result = spawnSync("gh", args, { encoding: "utf8" });
  if (result.status !== 0 && !allowFailure) throw new Error(`gh ${args.join(" ")} failed\n${result.stderr}`);
  return result.status === 0 ? result.stdout : "";
}

const { GH_REPO: repo, ISSUE_NUMBER: issue, COMMENT_BODY: body, ACTOR: actor } = process.env;
const allowlist = (process.env.BLOG_APPROVERS ?? "").split(",").map((login) => login.trim()).filter(Boolean);
const labels = JSON.parse(gh(["issue", "view", issue, "--repo", repo, "--json", "labels"])).labels.map((label) => label.name);
const permission = allowlist.length
  ? null
  : gh(["api", `repos/${repo}/collaborators/${actor}/permission`, "--jq", ".permission"], { allowFailure: true }).trim();

const decision = decideGate({ body, labels, actor, permission, allowlist });
console.log(JSON.stringify(decision));

if (decision.action === "reject") {
  gh(["issue", "comment", issue, "--repo", repo, "--body", `⛔ \`${decision.command}\` not applied: ${decision.reason}.`]);
} else if (decision.action === "approve") {
  gh(["issue", "edit", issue, "--repo", repo, "--remove-label", decision.removeLabel, "--add-label", decision.addLabel]);
  gh(["issue", "comment", issue, "--repo", repo, "--body", `✅ ${decision.receipt} Approved by @${actor} via \`${decision.command}\`.`]);
  const board = spawnSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), "content-board.mjs"), issue, decision.nextStatus], {
    encoding: "utf8",
    stdio: "inherit",
  });
  // The label change is the gate; a board failure is reported, not fatal.
  if (board.status !== 0) console.error("::warning::Content Pipeline board was not updated");
}
