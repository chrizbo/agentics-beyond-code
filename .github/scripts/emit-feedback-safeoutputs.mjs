#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const EVENTS_PATH = "feedback-events/normalized-feedback-events.json";
const PROJECT_URL = "https://github.com/users/chrizbo/projects/3";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");

function run(command, commandArgs, options = {}) {
  const stdio = options.stdio ?? (options.input === undefined ? ["ignore", "pipe", "pipe"] : ["pipe", "pipe", "pipe"]);
  const result = spawnSync(command, commandArgs, {
    encoding: "utf8",
    stdio,
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

function matchingIssueFor(event) {
  const key = event?.ingestion?.idempotency_key;
  const sourceUrl = event?.source_url;
  const title = event?.intake?.title;
  return existingIssues.find((issue) => {
    const body = typeof issue.body === "string" ? issue.body : "";
    const hasKey = typeof key === "string" && body.includes(key);
    const hasSourceUrl = typeof sourceUrl === "string" && body.includes(sourceUrl);
    const hasTitle = typeof title === "string" && issue.title === title;
    return hasKey || hasSourceUrl || hasTitle;
  });
}

const eventMatches = events.map((event) => ({
  event,
  issue: matchingIssueFor(event),
}));

const missingEvents = eventMatches.filter((match) => !match.issue).map((match) => match.event);
const existingEventMatches = eventMatches.filter((match) => match.issue);

for (const { event, issue } of existingEventMatches) {
  const fields = event.intake.project_fields ?? {};

  safeOutput("update_project", {
    project: PROJECT_URL,
    content_type: "issue",
    issue_number: issue.number,
    fields,
  });
}

if (missingEvents.length === 0) {
  safeOutput("noop", {
    message:
      "No new customer feedback intake issues found; refreshed project fields for existing feedback issues.",
  });
  console.log(
    `Prepared project refreshes for ${existingEventMatches.length} existing feedback issue(s) from ${events.length} normalized event(s).`,
  );
  process.exit(0);
}

for (const [index, event] of missingEvents.entries()) {
  const id = temporaryId(index);
  const fields = event.intake.project_fields ?? {};

  safeOutput("create_issue", {
    temporary_id: id,
    title: event.intake.title,
    body: event.intake.body,
  });

  const sourceLabels = (event.intake.labels ?? []).filter((label) => label.startsWith("from-"));
  if (sourceLabels.length > 0) {
    safeOutput("add_labels", {
      issue_number: id,
      labels: sourceLabels,
    });
  }

  safeOutput("update_project", {
    project: PROJECT_URL,
    content_type: "issue",
    content_number: id,
    fields,
  });
}

console.log(
  `Prepared ${missingEvents.length} feedback intake issue(s), ${missingEvents.length} project update(s), and ${existingEventMatches.length} project refresh(es) from ${events.length} normalized event(s).`,
);
