#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const EVENTS_PATH = "feedback-events/normalized-feedback-events.json";
const PROJECT_URL = "https://github.com/users/chrizbo/projects/3";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
    input: options.input,
  });

  if (result.status !== 0) {
    const stderr = result.stderr ? `\n${result.stderr}` : "";
    throw new Error(`${command} ${commandArgs.join(" ")} failed${stderr}`);
  }

  return result.stdout ?? "";
}

function safeOutput(tool, payload) {
  const line = JSON.stringify(payload);
  if (dryRun) {
    console.log(`[dry-run] safeoutputs ${tool} ${line}`);
    return;
  }

  run("safeoutputs", [tool, "."], {
    input: `${line}\n`,
  });
}

function temporaryId(index) {
  return `aw_fb${String(index + 1).padStart(2, "0")}`;
}

const normalized = JSON.parse(readFileSync(EVENTS_PATH, "utf8"));
const events = Array.isArray(normalized.events) ? normalized.events : [];

if (events.length === 0) {
  safeOutput("noop", {
    message: "No normalized customer feedback events found.",
  });
  process.exit(0);
}

let existingIssues = [];
try {
  existingIssues = JSON.parse(
    run("gh", [
      "issue",
      "list",
      "--state",
      "all",
      "--limit",
      "500",
      "--json",
      "number,title,state,url,body",
    ]),
  );
} catch (error) {
  throw new Error(`Unable to load existing issues for idempotency check: ${error.message}`);
}

const existingBodies = existingIssues
  .map((issue) => issue.body)
  .filter((body) => typeof body === "string");

const missingEvents = events.filter((event) => {
  const key = event?.ingestion?.idempotency_key;
  return typeof key === "string" && !existingBodies.some((body) => body.includes(key));
});

if (missingEvents.length === 0) {
  safeOutput("noop", {
    message:
      "No new customer feedback intake issues found; all normalized fixture events already have issues.",
  });
  process.exit(0);
}

for (const [index, event] of missingEvents.entries()) {
  const id = temporaryId(index);
  const fields = event.intake.project_fields ?? {};

  safeOutput("create_issue", {
    temporary_id: id,
    title: event.intake.title,
    body: event.intake.body,
    labels: event.intake.labels,
  });

  safeOutput("update_project", {
    project: PROJECT_URL,
    content_type: "issue",
    content_number: id,
    fields,
  });
}

console.log(
  `Prepared ${missingEvents.length} feedback intake issue(s) and project update(s) from ${events.length} normalized event(s).`,
);
