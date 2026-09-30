# Create or update a Studio skill and flow

Use for authorized deployment into a Google Workspace account. **This procedure
is derived from documentation checked 2026-09-29 and has not been
field-tested.** Inspect the actual page at each step; labels may differ.
Record what you observe in [field observations](observed-google-workspace-behavior.md)
when the user agrees.

## Prepare the deployable content

Complete the adaptation and the surface decision before saving: skill name,
description, and instructions; the flow specification; owner; sharing. Confirm
the account is on an eligible edition and the admin settings the flow needs are
on. Do not deploy a flow that depends on a disabled step, an unavailable
integration, or a quota that cannot hold it.

Do not widen scope (more mailboxes, folders, or Chat spaces), add steps, or
share the flow merely because the editor suggests it. When the editor offers
to generate a flow from a description, compare the result with the prepared
specification; generated flows may drop conditions or limits.

## Select a working deployment path

1. Default to the signed-in browser at Workspace Studio
   (studio.workspace.google.com). Create the skill before a flow that uses it.
2. Use an MCP or API path only when available tool schemas explicitly expose
   Studio flow or skill administration. The Workspace MCP server's Gmail,
   Drive, and Chat tools are not Studio administration. Never guess endpoints or
   extract browser tokens.
3. Follow the browser tool's rules. Use observed links and labels, not
   hardcoded selectors. Reinspect after layout changes or failed clicks. If
   sign-in, Gemini access, or an admin setting is missing, ask for that
   specific user or admin action. Never change Admin console settings or
   persistent browser permissions.
4. If no path is usable, deliver the completed configuration and the exact
   remaining manual steps. Do not describe preparation as deployment.

## Save without creating duplicates

Before creating, check My flows and the skills list for the requested name.
Compare purpose and owner; a matching name does not authorize editing someone
else's flow. Update the user-selected existing item, create when no match
exists, or resolve ambiguity before writing. Preserve unrelated fields. Check
the 25-flow limit before creating.

Save flows turned off unless the user authorized turning them on. After a
timeout or ambiguous save, inspect the list before retrying. Retry only after
establishing the prior save did not take effect.

## Configure and verify

Verify the persisted skill and flow, not just the open editor. Prefer a fresh
page load. Compare the skill's name, description, and full instructions, and
check for truncation. For flows, compare starter and conditions, each step and
its inputs, the Ask Gemini prompt and selected skill, the approval step,
sharing, and on/off state.

Separate creation, persistence, manual runs, and scheduled or event runs.
Creation does not authorize a test that emails real people, replies in real
threads, posts to shared Chat spaces, or writes to shared Drive folders. Use a
test label, a test Sheet, or a manual starter on a test item when authorized.
Check the Activity tab for run results and quota errors.

Return links for the skill and flow, whether each was created or updated, the
path used, owner, sharing, on/off state, verification performed, and any
remaining blocker.
