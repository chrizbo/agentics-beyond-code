# Create or update a skill directly in Productboard

Use for authorized deployment into Productboard. This is a tool-selection and
verification procedure, not a promise that every environment has the required
integration. It does not require a custom MCP server to be built or installed.

## Prepare the deployable content

Complete the source-based adaptation before saving: name, description, full
instructions, required resources, workspace, visibility, and requested trigger.
Use context already supplied to resolve the target. If multiple workspaces or
existing skills could match, ask for the distinguishing choice rather than
guessing. For a new skill with unspecified visibility, use personal visibility
if supported; preserve visibility when updating an existing skill.

Do not deploy unresolved instructions that require nonexistent tools or missing
resources. If the user explicitly wants an incomplete draft saved, mark it as
incomplete and use a verified disabled state. Do not enable broader contextual
invocation or recurring execution merely because a creation form defaults to it.
Inspect defaults before submitting; use manual invocation for an ordinary
creation request when supported and no other trigger has been requested.

## Select a working deployment path

1. Default to the signed-in Productboard browser and the observed Skills editor.
   Read [dated field observations](observed-productboard-behavior.md) for the
   tested path and its limitations. Do not spend each run searching MCP tools
   for skill management already absent from the inspected integration.
2. Revisit MCP/API deployment when new available tools explicitly expose skill
   administration, current product announcements indicate support, or the user
   requests a check. Inspect operation schemas for the exact action before use.
   Prefer a verified direct operation then; document/spec editing is not skill
   creation. Never guess endpoints or extract browser tokens for API access.
3. Follow the browser tool's rules and inspect the actual page before acting.
   Use observed links and labels, not hardcoded selectors or remembered clicks.
   Reinspect after layout changes or failed clicks before retrying. If signed-in
   access is missing, request that specific user action. Do not change persistent
   browser permissions merely to complete a capability check.
4. If no deployment path is usable, prepare a self-contained import archive
   using [the porting checklist](porting-checklist.md). Give the artifact and the
   specific remaining import step. Do not describe preparation as deployment.

## Save without creating duplicates

Before creating, search the intended workspace for the requested skill using
the available list/read operation or UI. Inspect matching records and compare
purpose and ownership; a matching name alone does not authorize overwriting
someone else's skill. Update the user-selected existing skill, create when no
match exists, or resolve an ambiguous match before writing. Preserve unrelated
fields and resources during updates.

For browser creation, inspect the current Skills page, choose the available
editor or upload flow, and fill the completed content. Use archive import when
required for scripts or resources. Check import warnings and fix missing or
skipped required content before saving. Do not claim attachment success if the
browser tool cannot upload files; use another verified path or report that step
as blocked. If using `/create-skill`, compare the resulting draft with the
prepared instructions before finalizing; generated paraphrases may drop limits.

Use existing user authorization to submit the completed skill. Do not insert
an extra confirmation solely because the action uses a browser. If login or an
account permission blocks progress, ask for that specific user action and keep
the prepared content. Do not route around permission failures.

After any timeout or ambiguous save, inspect the skill list and destination
before retrying. Retry only after establishing the prior mutation did not take
effect; stop and report an uncertain result if that cannot be established.

## Configure and verify

Verify the persisted skill, not just the current editor. A same-browser reload,
new tab, success toast, or normalized text hash may still reflect a local draft.
Prefer an independent browser session without that draft, or an available
verified server read. Confirm the same workspace and skill ID before comparing
name, description, complete instructions, required resources, visibility, and
invocation settings. Check for truncation and unexpected automatic triggers.

If a local draft differs from persisted content, compare both against the user's
requested changes; preserve unrelated edits and do not blindly overwrite either
version. Resolve genuinely unexplained differences before saving. Do not clear
browser storage to manufacture a clean verification. If independent read-back
is unavailable, report the persistence check's limitation rather than claiming
it passed. Do not submit another copy to compensate. A hash comparison is useful
only after establishing which version the compared text represents; do not
normalize away meaningful content differences.

For authorized schedules or event triggers, follow
[trigger guidance](triggers-and-schedules.md) after skill creation and verify
the trigger targets the saved skill. A browser-created skill can still need a
different verified interface for scheduling. If the skill saves but scheduling
is unavailable, retain the skill, report partial completion, and state the exact
trigger configuration still needed. Do not delete a successfully created skill
or activate an external runner merely to hide a partial result.

Choose verification proportional to the request. Configuration checks do not
require activating an automation. Separate creation, persistence, invocation,
delivery, and timed-execution results; exercise only the requested or necessary
stages. Run a scoped test when authorized and supported. Creation does not by itself
authorize a test that publishes reports, changes product records, or notifies
others. Use a verified preview/draft mode where available; otherwise report
configuration verification separately from execution testing.

Return the saved skill link or ID, whether it was created or updated, the path
used (MCP, API, or browser), visibility, actual trigger state, verification
performed, and any remaining blocker. For draft-only requests use the normal
inline output; for deployment do not replace the completion report with manual
setup instructions the agent already carried out.
