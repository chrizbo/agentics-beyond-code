#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { readFileSync } from "node:fs";

const EVENTS_PATH = "feedback-events/normalized-feedback-events.json";
const SOURCE_LABELS = ["from-open-source-repo", "from-discord", "from-slack", "from-feedback-fixture"];
const PROJECT_OWNER = process.env.FEEDBACK_PROJECT_OWNER || "@me";
const PROJECT_NUMBER = process.env.FEEDBACK_PROJECT_NUMBER || "3";
const REPO = process.env.GITHUB_REPOSITORY || "chrizbo/agentics-beyond-code";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
let dryRunIssueNumber = -1;

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    encoding: "utf8",
    input: options.input,
    stdio: options.input === undefined ? ["ignore", "pipe", "pipe"] : ["pipe", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    const stderr = result.stderr ? `\n${result.stderr}` : "";
    throw new Error(`${command} ${commandArgs.join(" ")} failed${stderr}`);
  }

  return result.stdout ?? "";
}

function gh(commandArgs, options = {}) {
  if (dryRun && options.write) {
    console.log(`[dry-run] gh ${commandArgs.join(" ")}`);
    return options.dryRunOutput ?? "";
  }
  return run("gh", commandArgs, options);
}

function parseJson(output, fallback) {
  const clean = String(output || "").trim();
  return clean ? JSON.parse(clean) : fallback;
}

function tempFile(prefix, contents) {
  const dir = mkdtempSync(path.join(tmpdir(), "feedback-intake-"));
  const file = path.join(dir, prefix);
  writeFileSync(file, contents);
  return file;
}

function loadEvents() {
  const normalized = JSON.parse(readFileSync(EVENTS_PATH, "utf8"));
  return Array.isArray(normalized.events) ? normalized.events : [];
}

function loadIssues() {
  return parseJson(
    gh([
      "issue",
      "list",
      "--repo",
      REPO,
      "--state",
      "all",
      "--limit",
      "500",
      "--json",
      "number,title,state,url,body,labels",
    ]),
    [],
  );
}

function matchingIssueFor(event, issues) {
  const key = event?.ingestion?.idempotency_key;
  const sourceUrl = event?.source_url;
  const title = event?.intake?.title;

  return issues.find((issue) => {
    const body = typeof issue.body === "string" ? issue.body : "";
    const hasKey = typeof key === "string" && body.includes(key);
    const hasSourceUrl = typeof sourceUrl === "string" && body.includes(sourceUrl);
    const hasTitle = typeof title === "string" && issue.title === title;
    return hasKey || hasSourceUrl || hasTitle;
  });
}

function issueLabels(issue) {
  return new Set((issue.labels ?? []).map((label) => label.name).filter(Boolean));
}

function createIssue(event) {
  const labels = event.intake.labels ?? [];
  const bodyFile = tempFile("body.md", event.intake.body);
  const labelArgs = labels.flatMap((label) => ["--label", label]);
  const output = gh(
    [
      "issue",
      "create",
      "--repo",
      REPO,
      "--title",
      event.intake.title,
      "--body-file",
      bodyFile,
      ...labelArgs,
    ],
    {
      write: true,
      dryRunOutput: "https://github.com/chrizbo/agentics-beyond-code/issues/0\n",
    },
  );
  const url = String(output).trim();
  const number = dryRun ? dryRunIssueNumber-- : Number(url.split("/").pop());
  return { number, title: event.intake.title, url, body: event.intake.body, labels: labels.map((name) => ({ name })) };
}

function syncLabels(issue, event) {
  const desired = new Set(event.intake.labels ?? []);
  const current = issueLabels(issue);
  const missing = [...desired].filter((label) => !current.has(label));
  const wrongSourceLabels = SOURCE_LABELS.filter((label) => current.has(label) && !desired.has(label));

  if (missing.length > 0) {
    gh(["issue", "edit", String(issue.number), "--repo", REPO, "--add-label", missing.join(",")], { write: true });
  }

  if (wrongSourceLabels.length > 0) {
    gh(["issue", "edit", String(issue.number), "--repo", REPO, "--remove-label", wrongSourceLabels.join(",")], {
      write: true,
    });
  }

  return { added: missing.length, removed: wrongSourceLabels.length };
}

function shouldRefreshGeneratedBody(issue) {
  const body = typeof issue.body === "string" ? issue.body : "";
  return body.includes("<!-- gh-aw-agentic-workflow: Customer Feedback Intake") || body.includes("Firewall blocked");
}

function refreshGeneratedBody(issue, event) {
  if (!shouldRefreshGeneratedBody(issue)) return false;
  const bodyFile = tempFile("body.md", event.intake.body);
  gh(["issue", "edit", String(issue.number), "--repo", REPO, "--body-file", bodyFile], { write: true });
  return true;
}

function loadProject() {
  return parseJson(gh(["project", "view", PROJECT_NUMBER, "--owner", PROJECT_OWNER, "--format", "json"]), {});
}

function loadProjectFields() {
  const result = parseJson(gh(["project", "field-list", PROJECT_NUMBER, "--owner", PROJECT_OWNER, "--format", "json"]), {
    fields: [],
  });
  return new Map((result.fields ?? []).map((field) => [field.name, field]));
}

function loadProjectItems() {
  const result = parseJson(
    gh(["project", "item-list", PROJECT_NUMBER, "--owner", PROJECT_OWNER, "--limit", "200", "--format", "json"]),
    { items: [] },
  );
  const items = new Map();
  for (const item of result.items ?? []) {
    const number = item?.content?.number;
    if (number) items.set(Number(number), item);
  }
  return items;
}

function addProjectItem(issue) {
  const output = gh(
    ["project", "item-add", PROJECT_NUMBER, "--owner", PROJECT_OWNER, "--url", issue.url, "--format", "json"],
    {
      write: true,
      dryRunOutput: JSON.stringify({ id: `dry-run-${issue.number}` }),
    },
  );
  return parseJson(output, {});
}

function optionIdFor(field, value) {
  return (field.options ?? []).find((option) => option.name === value)?.id;
}

function setProjectField(project, fields, item, name, value) {
  if (!value) return false;
  const field = fields.get(name);
  if (!field) {
    console.log(`Skipping missing project field: ${name}`);
    return false;
  }

  const baseArgs = [
    "project",
    "item-edit",
    "--id",
    item.id,
    "--project-id",
    project.id,
    "--field-id",
    field.id,
  ];

  if (field.type === "ProjectV2SingleSelectField") {
    const optionId = optionIdFor(field, value);
    if (!optionId) {
      console.log(`Skipping ${name}: no project option named ${value}`);
      return false;
    }
    gh([...baseArgs, "--single-select-option-id", optionId], { write: true });
    return true;
  }

  gh([...baseArgs, "--text", value], { write: true });
  return true;
}

function syncProjectFields(project, fields, item, event) {
  let updated = 0;
  for (const [name, value] of Object.entries(event.intake.project_fields ?? {})) {
    if (setProjectField(project, fields, item, name, value)) updated += 1;
  }
  return updated;
}

const events = loadEvents();
if (events.length === 0) {
  console.log("No normalized customer feedback events found.");
  process.exit(0);
}

let issues = loadIssues();
const project = loadProject();
const fields = loadProjectFields();
let projectItems = loadProjectItems();

const stats = {
  created: 0,
  matched: 0,
  labelsAdded: 0,
  labelsRemoved: 0,
  bodiesRefreshed: 0,
  projectItemsAdded: 0,
  projectFieldsUpdated: 0,
};

for (const event of events) {
  let issue = matchingIssueFor(event, issues);

  if (!issue) {
    issue = createIssue(event);
    issues.push(issue);
    stats.created += 1;
  } else {
    stats.matched += 1;
    const labelStats = syncLabels(issue, event);
    stats.labelsAdded += labelStats.added;
    stats.labelsRemoved += labelStats.removed;
    if (refreshGeneratedBody(issue, event)) stats.bodiesRefreshed += 1;
  }

  let item = projectItems.get(Number(issue.number));
  if (!item) {
    item = addProjectItem(issue);
    projectItems.set(Number(issue.number), item);
    stats.projectItemsAdded += 1;
  }

  stats.projectFieldsUpdated += syncProjectFields(project, fields, item, event);
}

console.log(
  [
    `Processed ${events.length} normalized feedback event(s).`,
    `Created ${stats.created}; matched ${stats.matched}; refreshed ${stats.bodiesRefreshed} generated bod${stats.bodiesRefreshed === 1 ? "y" : "ies"}.`,
    `Added ${stats.labelsAdded} label(s); removed ${stats.labelsRemoved} stale source label(s).`,
    `Added ${stats.projectItemsAdded} project item(s); wrote ${stats.projectFieldsUpdated} project field value(s).`,
  ].join("\n"),
);
