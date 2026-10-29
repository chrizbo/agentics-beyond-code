import assert from "node:assert/strict";
import test from "node:test";
import { decideGate, parseCommand } from "./gate.mjs";

const waiting = ["blog-brief", "ai:needs:brief-approval"];

test("recognizes only the leading gate command", () => {
  assert.equal(parseCommand("/approve-brief looks good"), "/approve-brief");
  assert.equal(parseCommand("  /APPROVE-BRIEF"), "/approve-brief");
  assert.equal(parseCommand("please /approve-brief"), null);
});

test("approves a waiting brief for a writer", () => {
  assert.deepEqual(decideGate({ body: "/approve-brief", labels: waiting, actor: "pm", permission: "write" }), {
    action: "approve",
    command: "/approve-brief",
    removeLabel: "ai:needs:brief-approval",
    addLabel: "approved:brief",
    nextStatus: "Drafting",
    receipt: "Brief approved. Drafting starts next.",
  });
});

test("rejects readers and non-allowlisted users", () => {
  assert.equal(decideGate({ body: "/approve-brief", labels: waiting, actor: "x", permission: "read" }).action, "reject");
  assert.equal(
    decideGate({ body: "/approve-brief", labels: waiting, actor: "x", permission: "admin", allowlist: ["@marketer"] }).action,
    "reject",
  );
  assert.equal(
    decideGate({ body: "/approve-brief", labels: waiting, actor: "Marketer", permission: null, allowlist: ["@marketer"] }).action,
    "approve",
  );
});

test("rejects briefs not waiting at the gate and ignores repeats and chatter", () => {
  assert.equal(decideGate({ body: "/approve-brief", labels: ["blog-brief"], actor: "pm", permission: "write" }).action, "reject");
  assert.equal(
    decideGate({ body: "/approve-brief", labels: [...waiting, "approved:brief"], actor: "pm", permission: "write" }).action,
    "ignore",
  );
  assert.equal(decideGate({ body: "nice work", labels: waiting, actor: "pm", permission: "write" }).action, "ignore");
});
