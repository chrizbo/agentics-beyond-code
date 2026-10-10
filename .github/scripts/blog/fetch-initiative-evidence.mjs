#!/usr/bin/env node
// Deterministic pre-step for the release blog pipeline. Walks an initiative
// or launch tree and writes evidence JSON: merged PRs, scope edits, descoped
// work, discussion on the initiative and launch, linked decision records,
// GTM drafts, and approval labels.
//
// Usage: node fetch-initiative-evidence.mjs <issue-number> [output.json]
// Env:   GH_TOKEN, GH_REPO (owner/name; defaults to the current repo)
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildInitiativeEvidence, issueKind } from "./initiative-evidence.mjs";

const MAX_DEPTH = 5;

function gh(args, input) {
  const result = spawnSync("gh", args, { encoding: "utf8", input, stdio: [input ? "pipe" : "ignore", "pipe", "pipe"] });
  if (result.status !== 0) throw new Error(`gh ${args.join(" ")} failed\n${result.stderr}`);
  return result.stdout;
}

function graphql(query, variables) {
  const response = JSON.parse(gh(["api", "graphql", "--input", "-"], JSON.stringify({ query, variables })));
  if (response.errors?.length) throw new Error(response.errors.map((error) => error.message).join("\n"));
  return response.data;
}

const PR_FIELDS = "number title url state merged mergedAt body author { login }";

const ISSUE_QUERY = `query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    issue(number: $number) {
      number title state stateReason url createdAt closedAt body
      labels(first: 30) { nodes { name } }
      parent { number }
      subIssues(first: 50) { nodes { number } }
      userContentEdits(first: 50) { nodes { editedAt diff editor { login } } }
      comments(last: 50) { nodes { createdAt body url author { login } } }
      timelineItems(first: 100, itemTypes: [CROSS_REFERENCED_EVENT, CLOSED_EVENT]) {
        nodes {
          __typename
          ... on CrossReferencedEvent { createdAt willCloseTarget source { __typename ... on PullRequest { ${PR_FIELDS} } } }
          ... on ClosedEvent { createdAt closer { __typename ... on PullRequest { ${PR_FIELDS} } } }
        }
      }
    }
  }
}`;

function normalizePr(node) {
  if (node?.__typename !== "PullRequest") return null;
  return { ...node, author: node.author?.login ?? null };
}

function fetchIssue(owner, name, number, includeNarrative) {
  const issue = graphql(ISSUE_QUERY, { owner, name, number }).repository.issue;
  if (!issue) throw new Error(`Issue #${number} not found`);
  const normalized = {
    number: issue.number,
    title: issue.title,
    state: issue.state,
    stateReason: issue.stateReason,
    url: issue.url,
    createdAt: issue.createdAt,
    closedAt: issue.closedAt,
    body: issue.body,
    labels: issue.labels.nodes.map((label) => label.name),
    parent: issue.parent?.number ?? null,
    children: issue.subIssues.nodes.map((child) => child.number),
    timeline: issue.timelineItems.nodes
      .map((event) =>
        event.__typename === "CrossReferencedEvent"
          ? { type: "cross-reference", createdAt: event.createdAt, willClose: event.willCloseTarget, pr: normalizePr(event.source) }
          : { type: "closed", createdAt: event.createdAt, closer: normalizePr(event.closer) },
      )
      .filter((event) => event.pr || event.closer),
  };
  // Edits and comments only matter on the narrative issues (initiative, launch).
  if (includeNarrative(normalized)) {
    normalized.edits = issue.userContentEdits.nodes.map((edit) => ({ editedAt: edit.editedAt, diff: edit.diff, editor: edit.editor?.login ?? null }));
    normalized.comments = issue.comments.nodes.map((comment) => ({ ...comment, author: comment.author?.login ?? null }));
  }
  return normalized;
}

function readDecisions(dir = "decisions") {
  try {
    return readdirSync(dir)
      .filter((file) => file.endsWith(".md"))
      .map((file) => ({ path: path.join(dir, file), content: readFileSync(path.join(dir, file), "utf8") }));
  } catch {
    return [];
  }
}

const [numberArg, outputPath = "initiative-evidence.json"] = process.argv.slice(2);
const rootNumber = Number(numberArg);
if (!Number.isInteger(rootNumber)) {
  console.error("Usage: fetch-initiative-evidence.mjs <issue-number> [output.json]");
  process.exit(2);
}

const repo = process.env.GH_REPO || JSON.parse(gh(["repo", "view", "--json", "nameWithOwner"])).nameWithOwner;
const [owner, name] = repo.split("/");
const narrative = (issue) => ["initiative", "launch"].includes(issueKind(issue));

const issues = new Map();
function walk(number, depth) {
  if (issues.has(number) || depth > MAX_DEPTH) return;
  const issue = fetchIssue(owner, name, number, narrative);
  issues.set(number, issue);
  for (const child of issue.children) walk(child, depth + 1);
}

walk(rootNumber, 0);
// A launch's story includes its initiative's scope edits and discussion, but not sibling launches.
const root = issues.get(rootNumber);
if (issueKind(root) === "launch" && root.parent) {
  const parent = fetchIssue(owner, name, root.parent, narrative);
  if (issueKind(parent) === "initiative") issues.set(parent.number, parent);
}

const evidence = buildInitiativeEvidence({
  repo,
  rootNumber,
  issues: [...issues.values()],
  decisions: readDecisions(),
  generatedAt: new Date().toISOString(),
});

writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
console.error(
  `Wrote ${outputPath}: ${evidence.stats.issues} issues, ${evidence.stats.mergedPullRequests} merged PRs, ` +
    `${evidence.stats.scopeEdits} scope edits, ${evidence.stats.decisions} decisions`,
);
