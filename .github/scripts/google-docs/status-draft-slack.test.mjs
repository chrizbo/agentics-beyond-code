import assert from "node:assert/strict";
import test from "node:test";
import {
  draftSlackMessage,
  slackDraftChannel,
} from "./status-draft-slack.mjs";

test("builds an explicit draft invitation with Doc and Discussion links", () => {
  const text = draftSlackMessage({
    discussionTitle: "[Weekly Status] Week of 2026-06-08",
    discussionUrl: "https://github.com/example/repo/discussions/1",
    documentUrl: "https://docs.google.com/document/d/doc-id/edit",
  });

  assert.match(text, /^\*DRAFT:/);
  assert.match(text, /not the final report/);
  assert.match(text, /https:\/\/docs\.google\.com\/document\/d\/doc-id\/edit/);
  assert.match(text, /https:\/\/github\.com\/example\/repo\/discussions\/1/);
});

test("resolves only an allowlisted Weekly Status Slack channel", () => {
  const map = JSON.stringify({ "Weekly Leadership Status Update": "C123" });
  assert.equal(slackDraftChannel("", map, "C123,C456"), "C123");
  assert.equal(slackDraftChannel("C456", map, "C123,C456"), "C456");
  assert.throws(() => slackDraftChannel("C789", map, "C456"), /not allowlisted/);
  assert.equal(slackDraftChannel("", "{}", "C123"), undefined);
});
