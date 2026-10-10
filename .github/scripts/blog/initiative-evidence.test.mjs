import assert from "node:assert/strict";
import test from "node:test";
import { buildInitiativeEvidence, issueKind, issueNumbersIn } from "./initiative-evidence.mjs";

const pr = (number, mergedAt, merged = true) => ({
  number,
  title: `PR ${number}`,
  url: `https://github.com/o/r/pull/${number}`,
  merged,
  mergedAt: merged ? mergedAt : null,
  body: `Body ${number}\n\n<!-- release-story:x:y:0 -->`,
  author: "dev",
});

const issues = [
  {
    number: 10,
    title: "[Initiative] Usage Insights",
    labels: ["initiative"],
    state: "OPEN",
    createdAt: "2026-10-01T00:00:00Z",
    parent: null,
    edits: [
      { editedAt: "2026-10-01T00:00:00Z", diff: "original", editor: "pm" },
      { editedAt: "2026-10-20T00:00:00Z", diff: "~~live chart~~ daily rollups", editor: "pm" },
    ],
    comments: [],
    timeline: [{ type: "cross-reference", willClose: false, pr: pr(30, "2026-10-21T00:00:00Z") }],
  },
  {
    number: 11,
    title: "[Launch] Usage Insights Dashboard",
    labels: ["launch", "approved:security", "ai:needs:privacy"],
    state: "OPEN",
    createdAt: "2026-10-01T00:01:00Z",
    parent: 10,
    edits: [],
    comments: [{ author: "pm", createdAt: "2026-10-19T00:00:00Z", url: "u", body: "Alpha readout: nobody watched the live chart.\n\n<!-- release-story:usage-insights:3-scope-change:0 -->" }],
    timeline: [],
  },
  { number: 12, title: "Dashboard experience", labels: ["epic"], state: "OPEN", createdAt: "2026-10-01T00:02:00Z", parent: 11, timeline: [] },
  {
    number: 13,
    title: "Live per-minute chart",
    labels: [],
    state: "CLOSED",
    stateReason: "NOT_PLANNED",
    createdAt: "2026-10-01T00:03:00Z",
    closedAt: "2026-10-20T00:00:00Z",
    parent: 12,
    timeline: [{ type: "cross-reference", willClose: false, pr: pr(30, "2026-10-21T00:00:00Z") }],
  },
  {
    number: 14,
    title: "Daily rollups",
    labels: [],
    state: "CLOSED",
    stateReason: "COMPLETED",
    createdAt: "2026-10-20T00:00:00Z",
    parent: 12,
    timeline: [
      { type: "cross-reference", willClose: true, pr: pr(31, "2026-10-28T00:00:00Z") },
      { type: "closed", closer: pr(31, "2026-10-28T00:00:00Z") },
      { type: "cross-reference", willClose: false, pr: pr(32, null, false) },
    ],
  },
  { number: 15, title: "[GTM] Changelog draft — Usage Insights", labels: ["ai:gtm"], state: "OPEN", createdAt: "2026-10-22T00:00:00Z", parent: 11, body: "Draft", timeline: [] },
];

const decisions = [
  { path: "decisions/2026-10-20-daily-rollups.md", content: "# Daily Rollups\n\n| **Date** | 2026-10-20 |\n| **Status** | Accepted |\n| **Impact** | #10, #13, #14 |\n\n## Decision\n\nShip daily rollups.\n\n## Rationale\n\nCost." },
  { path: "decisions/2026-05-01-unrelated.md", content: "# Unrelated\n\nImpact #999" },
];

const evidence = buildInitiativeEvidence({ repo: "o/r", rootNumber: 10, issues, decisions, generatedAt: "now" });

test("classifies issue kinds from labels and title prefixes", () => {
  assert.deepEqual(issues.map(issueKind), ["initiative", "launch", "epic", "task", "task", "gtm"]);
});

test("deduplicates merged PRs and separates closes from references", () => {
  assert.deepEqual(
    evidence.pullRequests.map(({ number, closes, references }) => ({ number, closes, references })),
    [
      { number: 30, closes: [], references: [10, 13] },
      { number: 31, closes: [14], references: [] },
    ],
  );
  assert.equal(evidence.stats.unmergedPullRequests, 1);
  assert.doesNotMatch(evidence.pullRequests[0].summary, /release-story/);
});

test("captures scope edits after the original revision, descoped work, and narrative comments", () => {
  assert.deepEqual(evidence.scopeEdits.map((edit) => edit.diff), ["~~live chart~~ daily rollups"]);
  assert.deepEqual(evidence.descoped.map((issue) => issue.number), [13]);
  assert.equal(evidence.discussion.length, 1);
  assert.doesNotMatch(evidence.discussion[0].body, /release-story/);
});

test("links only decisions that reference the tree", () => {
  assert.deepEqual(evidence.decisions.map((decision) => [decision.path, decision.references, decision.decision]), [
    ["decisions/2026-10-20-daily-rollups.md", [10, 13, 14], "Ship daily rollups."],
  ]);
});

test("reports GTM drafts and launch approval labels", () => {
  assert.deepEqual(evidence.gtmDrafts.map((draft) => draft.number), [15]);
  assert.deepEqual(evidence.approvals, [{ launch: 11, approved: ["approved:security"], needs: ["ai:needs:privacy"] }]);
});

test("builds a nested tree and a chronological timeline", () => {
  assert.equal(evidence.tree.number, 10);
  assert.deepEqual(evidence.tree.children[0].children[0].children.map((node) => node.number), [13, 14]);
  const dates = evidence.timeline.map((entry) => entry.date);
  assert.deepEqual(dates, [...dates].sort());
  assert.ok(evidence.timeline.some((entry) => entry.kind === "scope-edit"));
  assert.ok(evidence.timeline.some((entry) => entry.kind === "decision"));
  assert.equal(evidence.stats.closedTasks, 1);
  assert.equal(evidence.stats.descopedTasks, 1);
});

test("finds issue numbers in shorthand and URLs", () => {
  assert.deepEqual([...issueNumbersIn("#3 and https://github.com/o/r/issues/44#c")], [3, 44]);
});

test("throws when the root issue was not fetched", () => {
  assert.throws(() => buildInitiativeEvidence({ repo: "o/r", rootNumber: 1, issues: [] }), /Root issue #1/);
});
