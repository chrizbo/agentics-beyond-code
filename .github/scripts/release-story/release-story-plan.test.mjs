import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { commentMarker, planStage, renderTemplate } from "./release-story-plan.mjs";

const story = JSON.parse(
  readFileSync(new URL("../../../release-story-fixtures/usage-insights.json", import.meta.url), "utf8"),
);

const existing = (keys) => Object.fromEntries(keys.map((key, index) => [key, { number: 500 + index }]));

test("structure stage creates referenced issues before the issues that mention them", () => {
  const { ops } = planStage(story, "1-structure");
  const creates = ops.filter((op) => op.op === "create-issue").map((op) => op.key);
  assert.ok(creates.indexOf("launch") < creates.indexOf("initiative"), "launch must exist before initiative body renders");
  const firstLink = ops.findIndex((op) => op.op === "link-parent");
  assert.ok(firstLink > ops.findLastIndex((op) => op.op === "create-issue"), "links come after every create");
  assert.deepEqual(ops.at(-1), { op: "set-phase", key: "launch", phase: "Team" });
});

test("rerunning structure skips issues that already exist", () => {
  const keys = story.stages[0].actions[0].keys;
  const { ops } = planStage(story, "1-structure", { issues: existing(keys) });
  assert.deepEqual(ops.map((op) => op.op), ["set-phase"]);
});

test("later stages refuse to run before their issues exist", () => {
  assert.throws(() => planStage(story, "3-scope-change", { issues: existing(["launch"]) }), /Run earlier stages first/);
});

test("scope change stage creates the replacement task and records a decision PR", () => {
  const keys = story.stages[0].actions[0].keys;
  const { ops } = planStage(story, "3-scope-change", { issues: existing(keys) });
  assert.deepEqual(
    ops.map((op) => op.op),
    ["comment", "edit-body", "create-issue", "link-parent", "close-issue", "merge-pr"],
  );
  const pr = ops.find((op) => op.op === "merge-pr");
  assert.equal(pr.branch, "release-story/usage-insights/pr-decision");
  assert.match(pr.file, /^decisions\/\{\{date\}\}-/);
  assert.equal(ops[0].marker, commentMarker("usage-insights", "3-scope-change", 0));
});

test("every stage plans cleanly in order", () => {
  const issues = {};
  for (const stage of story.stages) {
    const { ops } = planStage(story, stage.name, { issues });
    for (const op of ops) if (op.op === "create-issue") issues[op.key] = { number: 900 + Object.keys(issues).length };
  }
  assert.equal(Object.keys(issues).length, story.issues.length);
});

test("renderTemplate resolves issue references and dates, and rejects unknown refs", () => {
  assert.equal(renderTemplate("Closes {{issue:a}} on {{date}}", { issues: { a: { number: 7 } }, date: "2026-10-06" }), "Closes #7 on 2026-10-06");
  assert.throws(() => renderTemplate("{{issue:b}}", { issues: {}, date: "x" }), /Unresolved/);
});

test("unknown stage names list the valid stages", () => {
  assert.throws(() => planStage(story, "nope"), /1-structure/);
});
