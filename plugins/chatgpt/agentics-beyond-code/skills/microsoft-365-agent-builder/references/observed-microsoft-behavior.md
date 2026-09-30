# Microsoft field observations

No live tenant deployment has been performed for this builder. The initial
routing and event-trigger guidance was checked against Microsoft Learn on
2026-09-29. Static reviews do not establish license availability, UI behavior,
connector permissions, or runtime reliability.

After an authorized field test, record date, surface, relevant entitlement,
operation, expected/observed outcome, and limitations. Omit secrets, private
content, and tenant identifiers. Separate one-tenant observations from documented
product behavior.

## User-provided local plugin smoke test — 2026-09-29

The user supplied a response and generated weekly-status draft from a new chat
after installing release 0.5.2. The request specified GitHub Issues, Teams,
Business Standard, unknown Copilot licenses, and draft-only scope. This is
output evidence; the chat's skill-loading trace and tenant state were not
inspected.

The draft kept records and automation in GitHub, chose deterministic collection
with human synthesis, separated Copilot and Power Automate entitlements, and
identified tenant assumptions. It preserved source provenance, explicitly
labeled simplifications, kept schedules off, and distinguished webhook receipt
from confirmed delivery. No live execution was claimed.

Review found three usability/validation gaps: it wrote into the source repo
without a requested document destination; it asked the reviewer to supply a
SHA-256 digest; and its walkthrough table described outcomes without showing
concrete input/output artifacts. Rejection and timeout handling also needed an
explicit triggering mechanism. The skill now addresses these points. The
revised guidance has not yet been rerun in a fresh chat. The generated draft
was removed at the user's request. No Microsoft runtime behavior is verified.
