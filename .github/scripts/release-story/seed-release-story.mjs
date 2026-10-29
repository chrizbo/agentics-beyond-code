#!/usr/bin/env node
// Seeds a release story (initiative → launch → epics → tasks, merged PRs,
// scope changes, decision records) one stage at a time so the history
// accrues over real weeks. Dry run by default; pass --apply to write.
//
// Usage:
//   node seed-release-story.mjs <story.json> <stage|all|status> [--apply]
//
// Env: GH_TOKEN (issues, PRs, contents, and project write), GH_REPO (owner/name),
//      RELEASE_STORY_DATE (YYYY-MM-DD, defaults to today UTC),
//      RELEASE_STORY_ADMIN_MERGE=true to merge past branch protection.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { planStage, renderTemplate } from "./release-story-plan.mjs";

function run(command, args, { input, allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    input,
    stdio: [input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
  });
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`${command} ${args.join(" ")} failed\n${result.stderr}`);
  }
  return { ok: result.status === 0, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

const gh = (args, options) => run("gh", args, options).stdout;
const ghJson = (args, options) => JSON.parse(gh(args, options) || "null");

function repoName() {
  return process.env.GH_REPO || ghJson(["repo", "view", "--json", "nameWithOwner"]).nameWithOwner;
}

function findIssue(repo, title) {
  const results = ghJson([
    "issue", "list", "--repo", repo, "--state", "all", "--limit", "50",
    "--search", `"${title}" in:title`, "--json", "number,title,state,id,url",
  ]);
  return results.find((issue) => issue.title === title) ?? null;
}

function loadState(repo, story) {
  const issues = {};
  for (const issue of story.issues) {
    const found = findIssue(repo, issue.title);
    if (found) issues[issue.key] = found;
  }
  return { issues };
}

function issueView(repo, number, fields) {
  return ghJson(["issue", "view", String(number), "--repo", repo, "--json", fields]);
}

function setPhase(repo, story, issue, phase) {
  const { owner, number, phaseField } = story.project;
  const project = ghJson(["project", "view", String(number), "--owner", owner, "--format", "json"]);
  const field = ghJson(["project", "field-list", String(number), "--owner", owner, "--format", "json"])
    .fields.find((item) => item.name === phaseField);
  const option = field?.options?.find((item) => item.name === phase);
  if (!option) throw new Error(`Project ${owner}/${number} has no ${phaseField} option "${phase}"`);
  const item = ghJson(["project", "item-add", String(number), "--owner", owner, "--url", issue.url, "--format", "json"]);
  gh(["project", "item-edit", "--id", item.id, "--project-id", project.id, "--field-id", field.id, "--single-select-option-id", option.id]);
}

function mergePr(repo, op, ctx) {
  const prs = ghJson(["pr", "list", "--repo", repo, "--head", op.branch, "--state", "all", "--json", "number,state"]);
  let pr = prs.find((item) => item.state === "MERGED");
  if (pr) return `already merged #${pr.number}`;
  pr = prs.find((item) => item.state === "OPEN");

  if (!pr) {
    const file = renderTemplate(op.file, ctx);
    const base = gh(["api", `repos/${repo}/git/ref/heads/main`, "--jq", ".object.sha"]).trim();
    run("gh", ["api", "-X", "POST", `repos/${repo}/git/refs`, "-f", `ref=refs/heads/${op.branch}`, "-f", `sha=${base}`], { allowFailure: true });
    const existing = run("gh", ["api", `repos/${repo}/contents/${file}?ref=${op.branch}`, "--jq", ".sha"], { allowFailure: true });
    const put = [
      "api", "-X", "PUT", `repos/${repo}/contents/${file}`,
      "-f", `message=${op.title}`,
      "-f", `content=${Buffer.from(renderTemplate(op.content, ctx)).toString("base64")}`,
      "-f", `branch=${op.branch}`,
    ];
    if (existing.ok) put.push("-f", `sha=${existing.stdout.trim()}`);
    gh(put);
    const url = gh(
      ["pr", "create", "--repo", repo, "--base", "main", "--head", op.branch, "--title", op.title, "--body-file", "-"],
      { input: renderTemplate(op.body, ctx) },
    ).trim();
    pr = { number: Number(url.split("/").pop()) };
  }

  const merge = ["pr", "merge", String(pr.number), "--repo", repo, "--squash", "--delete-branch"];
  if (process.env.RELEASE_STORY_ADMIN_MERGE === "true") merge.push("--admin");
  gh(merge);
  return `merged #${pr.number}`;
}

function execute(repo, story, op, ctx) {
  const issue = ctx.issues[op.key];
  switch (op.op) {
    case "create-issue": {
      const args = ["issue", "create", "--repo", repo, "--title", op.title, "--body-file", "-"];
      for (const label of op.labels) args.push("--label", label);
      const url = gh(args, { input: renderTemplate(op.body, ctx) }).trim();
      const created = issueView(repo, url.split("/").pop(), "number,title,state,id,url");
      ctx.issues[op.key] = created;
      return `created #${created.number}`;
    }
    case "link-parent": {
      const parent = ctx.issues[op.parent];
      gh([
        "api", "graphql",
        "-f", "query=mutation($p: ID!, $c: ID!) { addSubIssue(input: {issueId: $p, subIssueId: $c}) { issue { number } } }",
        "-f", `p=${parent.id}`, "-f", `c=${issue.id}`,
      ]);
      return `#${issue.number} → parent #${parent.number}`;
    }
    case "set-phase":
      setPhase(repo, story, issue, op.phase);
      return `#${issue.number} Phase=${op.phase}`;
    case "comment": {
      const { comments } = issueView(repo, issue.number, "comments");
      if (comments.some((comment) => comment.body.includes(op.marker))) return "comment already posted";
      gh(["issue", "comment", String(issue.number), "--repo", repo, "--body-file", "-"], {
        input: `${renderTemplate(op.body, ctx)}\n\n${op.marker}`,
      });
      return `commented on #${issue.number}`;
    }
    case "edit-body": {
      const body = renderTemplate(op.body, ctx);
      if (issueView(repo, issue.number, "body").body.trim() === body.trim()) return "body already current";
      gh(["issue", "edit", String(issue.number), "--repo", repo, "--body-file", "-"], { input: body });
      return `edited body of #${issue.number}`;
    }
    case "close-issue": {
      if (issueView(repo, issue.number, "state").state === "CLOSED") return "already closed";
      const args = ["issue", "close", String(issue.number), "--repo", repo, "--reason", op.reason];
      if (op.comment) args.push("--comment", renderTemplate(op.comment, ctx));
      gh(args);
      return `closed #${issue.number} (${op.reason})`;
    }
    case "merge-pr":
      return mergePr(repo, op, ctx);
    default:
      throw new Error(`Unknown op ${op.op}`);
  }
}

function describe(op) {
  const detail = op.title ?? op.phase ?? op.parent ?? op.branch ?? op.reason ?? "";
  return `${op.op.padEnd(12)} ${op.key.padEnd(16)} ${detail}`;
}

const [storyPath, stageArg, ...flags] = process.argv.slice(2);
if (!storyPath || !stageArg) {
  console.error("Usage: seed-release-story.mjs <story.json> <stage|all|status> [--apply]");
  process.exit(2);
}

const story = JSON.parse(readFileSync(storyPath, "utf8"));
const apply = flags.includes("--apply");
const repo = repoName();
const date = process.env.RELEASE_STORY_DATE || new Date().toISOString().slice(0, 10);
const ctx = { ...loadState(repo, story), date };

if (stageArg === "status") {
  for (const issue of story.issues) {
    const found = ctx.issues[issue.key];
    console.log(`${issue.key.padEnd(16)} ${found ? `#${found.number} ${found.state}` : "—"}  ${issue.title}`);
  }
  process.exit(0);
}

const stages = stageArg === "all" ? story.stages.map((stage) => stage.name) : [stageArg];
for (const name of stages) {
  const { summary, ops } = planStage(story, name, ctx);
  console.log(`\n## ${name}: ${summary}${apply ? "" : " (dry run)"}`);
  for (const op of ops) {
    if (!apply) {
      console.log(`  ${describe(op)}`);
      // Pretend creates succeeded so later dry-run stages can plan.
      if (op.op === "create-issue") ctx.issues[op.key] = { number: `new:${op.key}` };
      continue;
    }
    console.log(`  ${describe(op)} … ${execute(repo, story, op, ctx)}`);
  }
}
