# Create or update a Rovo agent and automation flow

Use for authorized deployment into an Atlassian site. **This procedure is
derived from documentation checked 2026-09-29 and has not been field-tested.**
Inspect the actual page at each step; labels may differ. Record what you observe
in [field observations](observed-atlassian-behavior.md) when the user agrees.

## Prepare the deployable content

Complete the adaptation before saving: name, description, Behavior
instructions, conversation starters, knowledge scope, skills, tools, surfaces,
owner, and any automation specification. Use context already supplied to
resolve the site, projects, and spaces. If several sites or existing agents
could match, ask for the distinguishing choice rather than guessing.

Do not deploy instructions that depend on missing tools or inaccessible
knowledge. Do not enable broader knowledge ("all organizational knowledge"),
extra tools, or additional surfaces merely because the form defaults to them.
Inspect defaults before saving.

## Select a working deployment path

1. Default to the signed-in browser: Rovo Studio → Agents → Create for the
   agent, and Studio or the Jira/Confluence automation editor for flows.
2. Use an MCP or API path only when available tool schemas explicitly expose
   agent or automation administration. The Rovo MCP Server's content tools are
   not agent administration. Never guess endpoints or extract browser tokens.
3. Follow the browser tool's rules. Use observed links and labels, not
   hardcoded selectors. Reinspect after layout changes or failed clicks. If
   sign-in, a Rovo license, or admin rights are missing, ask for that specific
   user action. Do not change persistent browser permissions.
4. If no path is usable, deliver the completed configuration and the exact
   remaining manual steps. Do not describe preparation as deployment.

## Save without creating duplicates

Before creating, search Studio's agent list and the automation flow list for
the requested name. Compare purpose and owner; a matching name does not
authorize editing someone else's agent. Only the creator or an organization
admin can edit an agent. Update the user-selected existing item, create when no
match exists, or resolve ambiguity before writing. Preserve unrelated fields.

Create the agent before the flow that references it. Save automation flows
disabled unless the user authorized activation. If the editor offers to
generate instructions, compare the result with the prepared text; generated
paraphrases may drop limits.

After a timeout or ambiguous save, inspect the list before retrying. Retry only
after establishing the prior save did not take effect.

## Configure and verify

Verify the persisted agent and flow, not just the open editor. Prefer a fresh
page load in a separate session or tab without the draft. Compare name,
description, full Behavior text, knowledge, tools, surfaces, and owner, and
check for truncation. For flows, compare trigger, scope, conditions, agent
selection, prompt, follow-up actions, actor, and enabled state.

Separate creation, persistence, invocation, and timed or event execution.
Creation does not authorize a test that comments on real work items, publishes
pages, or notifies people. Use a sandbox project or space, or a manual trigger
on a test item, when authorized. Check the automation audit log for run results.

Return links for the agent and flow, whether each was created or updated, the
path used, owner, knowledge scope, enabled state, verification performed, and
any remaining blocker.
