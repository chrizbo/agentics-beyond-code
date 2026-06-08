import assert from "node:assert/strict";
import test from "node:test";
import {
  canPublishFinalization,
  finalSlackChannel,
  finalSlackMessage,
} from "./status-finalization-publish.mjs";

test("publishes only for an enabled human-controlled trigger", () => {
  assert.equal(
    canPublishFinalization({
      enabled: true,
      triggerKind: "discussion_comment",
      gateResolved: false,
    }),
    true,
  );
  assert.equal(
    canPublishFinalization({
      enabled: true,
      triggerKind: "google_doc_comment_resolved",
      gateResolved: true,
    }),
    true,
  );
  assert.equal(
    canPublishFinalization({
      enabled: true,
      triggerKind: "workflow_dispatch",
      gateResolved: false,
    }),
    false,
  );
  assert.equal(
    canPublishFinalization({
      enabled: false,
      triggerKind: "discussion_comment",
      gateResolved: true,
    }),
    false,
  );
});

test("resolves an allowlisted final report channel", () => {
  const map = JSON.stringify({ "Weekly Leadership Status Update": "CLEADERS" });
  assert.equal(finalSlackChannel(map, "CTEAM,CLEADERS"), "CLEADERS");
  assert.throws(() => finalSlackChannel(map, "CTEAM"), /not allowlisted/);
});

test("builds a concise final report message", () => {
  const text = finalSlackMessage({
    discussionTitle: "[Weekly Status] Week of 2026-06-08",
    discussionUrl: "https://github.com/example/repo/discussions/1",
    discussionBody:
      "# Weekly Status\n\n**1 initiatives** · **2 active launches** · **3 items shipped** · **0 items needing attention**",
  });
  assert.match(text, /^\*FINAL:/);
  assert.match(text, /1 initiatives · 2 active launches/);
  assert.match(text, /https:\/\/github\.com\/example\/repo\/discussions\/1/);
});
