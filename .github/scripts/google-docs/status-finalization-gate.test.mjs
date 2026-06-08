import assert from "node:assert/strict";
import test from "node:test";
import {
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
    /Target heading: “Weekly Status — Week of 2026-06-08”/,
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

test("extracts lifecycle identity from a gate comment", () => {
  assert.equal(
    lifecycleKeyFromFinalizationGate({
      content: "[agentics-finalization-gate:weekly-status:2026-06-08]",
    }),
    "weekly-status:2026-06-08",
  );
});
