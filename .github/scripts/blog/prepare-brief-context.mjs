#!/usr/bin/env node
// Deterministic pre-step for blog-brief-builder. Reads the brief issue,
// parses its fields, and fetches evidence for the linked initiative or launch.
//
// Usage: node prepare-brief-context.mjs <brief-issue-number> [out-dir]
// Writes <out-dir>/brief.json and <out-dir>/initiative-evidence.json.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseBrief } from "./brief.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const [issueArg, outDir = "brief-context"] = process.argv.slice(2);
const issueNumber = Number(issueArg);
if (!Number.isInteger(issueNumber)) {
  console.error("Usage: prepare-brief-context.mjs <brief-issue-number> [out-dir]");
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const repoArgs = process.env.GH_REPO ? ["--repo", process.env.GH_REPO] : [];
const view = spawnSync("gh", ["issue", "view", String(issueNumber), ...repoArgs, "--json", "number,title,body,url,labels,author,createdAt"], { encoding: "utf8" });
if (view.status !== 0) throw new Error(`Could not read brief #${issueNumber}\n${view.stderr}`);
const issue = JSON.parse(view.stdout);
const parsed = parseBrief(issue.body);

const brief = {
  number: issue.number,
  title: issue.title,
  url: issue.url,
  author: issue.author?.login ?? null,
  createdAt: issue.createdAt,
  labels: issue.labels.map((label) => label.name),
  today: new Date().toISOString().slice(0, 10),
  ...parsed,
};
writeFileSync(path.join(outDir, "brief.json"), `${JSON.stringify(brief, null, 2)}\n`);

const evidencePath = path.join(outDir, "initiative-evidence.json");
if (!parsed.targetNumber) {
  writeFileSync(evidencePath, `${JSON.stringify({ error: "Brief does not link an initiative or launch" }, null, 2)}\n`);
} else {
  const fetch = spawnSync(process.execPath, [path.join(here, "fetch-initiative-evidence.mjs"), String(parsed.targetNumber), evidencePath], {
    encoding: "utf8",
    stdio: ["ignore", "inherit", "pipe"],
  });
  process.stderr.write(fetch.stderr ?? "");
  if (fetch.status !== 0) {
    writeFileSync(evidencePath, `${JSON.stringify({ error: `Evidence fetch failed for #${parsed.targetNumber}: ${fetch.stderr?.trim().split("\n").pop()}` }, null, 2)}\n`);
  }
}

console.error(`Brief #${issueNumber}: target #${parsed.targetNumber ?? "none"}, ${parsed.problems.length} problem(s)`);
