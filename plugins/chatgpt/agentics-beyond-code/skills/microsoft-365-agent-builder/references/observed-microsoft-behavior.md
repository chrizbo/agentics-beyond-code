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
revised guidance was subsequently checked in the no-project test below. The generated draft
was removed at the user's request. No Microsoft runtime behavior is verified.

## No-project drafting and pinned-source retrieval — 2026-09-30 UTC

The user supplied two responses from a no-project chat using the refreshed local
0.5.2 plugin. The first kept the draft in chat, retained GitHub as the record
system, and recommended manual Teams delivery without Copilot. Approval used a
readable comment rather than a user-supplied hash. It included concrete synthetic
issues and distinguished design walkthroughs from execution. Source retrieval
initially failed; the response disclosed this and labeled its output a new
design rather than claiming a faithful port.

On an explicit source-reading follow-up, the response identified the package's
pinned revision `a34e86b5bcd5c65bf04b1ccfc792a4e969eabc79` and reported reading
and hashing the weekly-status workflow, weekly-status policy, launch-data fetch
script, shared freshness check, and launch-readiness policy. Review independently
compared all five Git blobs at that revision against the package index: all
SHA-256 values matched. The summary correctly described AI-generated Discussions,
the paused schedule, lack of an approval gate or Teams delivery in the source,
append-only reporting, and the limits of current-state data for historical claims.

These are successful user-observed drafting and source-reading smoke tests. The
other chat's tool trace was not inspected; independent hash checks verify the
index against Git objects, not that chat's network requests. No live GitHub or
Microsoft workflow ran, and no tenant entitlement or posting permission was
verified. A manual approval comment remains editable; automated delivery needs
a captured version/change check. The initial retrieval failure's cause is unknown.
