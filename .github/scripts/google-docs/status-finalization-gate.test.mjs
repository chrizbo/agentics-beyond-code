import assert from "node:assert/strict";
import test from "node:test";
import {
  FINALIZATION_GATE_ANCHOR_TEXT,
  finalizationGateContent,
  finalizationGateHeading,
  finalizationGateMarker,
  findFinalizationGate,
  lifecycleKeyFromFinalizationGate,
} from "./status-finalization-gate.mjs";

test("builds a lifecycle-scoped finalization gate comment", () => {
  assert.equal(
    finalizationGateMarker("weekly-status:2026-06-08"),
    "[agentics-finalization-gate:weekly-status:2026-06-08]",
  );
  assert.equal(
    finalizationGateHeading("weekly-status:2026-06-08"),
    "Weekly Status — Week of 2026-06-08",
  );
  assert.match(
    finalizationGateContent(
      "weekly-status:2026-06-08",
      "https://github.com/example/repo/discussions/1",
    ),
    /Target heading: "Weekly Status — Week of 2026-06-08"/,
  );
});

test("finds one gate and rejects duplicates", () => {
  const lifecycle = "weekly-status:2026-06-08";
  const gate = { id: "1", content: finalizationGateMarker(lifecycle), resolved: false };
  assert.deepEqual(findFinalizationGate([gate], lifecycle), gate);
  assert.throws(
    () => findFinalizationGate([gate, { ...gate, id: "2" }], lifecycle),
    /Multiple finalization gate comments/,
  );
});

test("anchor text mentions the comments panel and the date label", () => {
  assert.match(FINALIZATION_GATE_ANCHOR_TEXT, /Comments panel/);
  assert.match(FINALIZATION_GATE_ANCHOR_TEXT, /finalization gate comment/);
  assert.match(FINALIZATION_GATE_ANCHOR_TEXT, /\/finalize-status/);
});

test("extracts lifecycle identity from a gate comment", () => {
  assert.equal(
    lifecycleKeyFromFinalizationGate({
      content: "[agentics-finalization-gate:weekly-status:2026-06-08]",
    }),
    "weekly-status:2026-06-08",
  );
});
