# Atlassian porting checklist

## Product evidence

Documentation checked 2026-09-29. No field test has been recorded yet; see
[field observations](observed-atlassian-behavior.md). Verify the relevant
current controls rather than repeating a broad product survey. Other
unverified site details, such as trigger names and smart value behavior, are
listed under "Still unverified" in the field observations. Cite that list, or
say "unverified" without a source, rather than attributing them to this
checklist.

[Create and edit Rovo agents](https://support.atlassian.com/rovo/docs/create-and-edit-agents/)
describes creation from Rovo Chat (Create agent), Studio (Agents → Create), and
the Jira assignee/agent picker. Identity fields are Name, Description, Behavior,
and Conversation starters. Advanced configuration covers subagents, skills,
tools (about five recommended), knowledge, and reasoning tier. Only the creator
or an organization admin can edit; ownership can be transferred. Agents do not
grant additional permissions.

[Knowledge sources](https://support.atlassian.com/rovo/docs/knowledge-sources-for-agents/)
are all organizational knowledge, custom knowledge (Confluence spaces, Jira
projects, JSM, Google Drive), or none, plus optional web search. Results are
filtered by the invoking user's permissions.

[Agent tools](https://support.atlassian.com/rovo/docs/agent-actions/) include
Jira Create work item, Update status, and Search with JQL; Confluence Create,
Edit, and Move page; and others. In chat, consequential tools ask for
confirmation. Bulk Jira actions are capped at 20 work items.
[Skills](https://support.atlassian.com/rovo/docs/add-skills-to-rovo-agents/)
are reusable multi-step instructions that orchestrate tools; custom skill
authoring was not documented on that page.

[Automate Rovo agents](https://support.atlassian.com/rovo/docs/agents-in-automations/)
describes adding an automation trigger from the agent's Triggers tab or adding
the Use agent action to a flow. The flow needs a selected agent, a prompt, and
a Rovo connection to automation. The agent runs with the permissions of the
user who configured the flow. Out-of-the-box agents take no actions.

**Documented conflict:** the tools page says agents in automation cannot run
their own tools and only return `{{agentResponse}}`; the automation page says
custom agents with tools write directly unless admins or users prevent it.
The conflict affects reads as well as writes: if tools do not run in
automation, an agent step cannot search with JQL. Until verified on the target
site, gather inputs with automation lookup actions (for example Lookup work
items and `{{lookupIssues}}`; verify the current name) and pass them in the
prompt, perform writes with automation actions from a structured
`{{agentResponse}}`, and do not rely on agent tools running unattended.
Accessing fields through `{{agentResponse.asObject}}` and adding a list of
labels from it are also unverified; test them before relying on them.

[Rovo agent smart values](https://support.atlassian.com/cloud-automation/docs/automation-smart-values-rovo-agents/):
`{{agentResponse}}` (markdown), `.markdown`, `.adf`, `.wiki` (legacy),
`.asObject`, `.asList`, `.asString`. The response must feed a follow-up action.

[Work item collaboration](https://support.atlassian.com/rovo/docs/collaborate-with-your-rovo-agent-on-work-items/)
(beta) enables the Work items surface, then assignee, @mention, workflow
transition, and board column invocation. Agents in Jira consume Rovo credits.

The [Atlassian Rovo MCP Server](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/supported-tools/)
serves external clients with the authenticated user's permissions. Inspect its
actual tool schemas; it is not evidence of agent or automation administration.

## Contract translation questions

| Source behavior | Decision for the adaptation |
|---|---|
| Schedule | Scheduled automation trigger with timezone, optional JQL, and Use Rovo agent. Writing a cadence in Behavior does not schedule anything. |
| Issue opened, labeled, or commented | Jira work item created, field value changed, or comment trigger, with JQL or conditions reproducing the source's eligibility and exclusions. |
| Human command | Rovo Chat, @mention on a work item, or a manual automation trigger. Name which one and who can use it. |
| Project status change | Workflow transition invocation (beta) or a transitioned trigger. Verify availability on the site. |
| Parent/child hierarchy (sub-issues, launches under initiatives) | Jira parent field and issue links. Jira Cloud replaced the Epic Link field with Parent; verify the site's hierarchy and prefer `parent in (...)` JQL over Epic Link. |
| GitHub issue, label, project field | Jira work item type, labels, components, or fields with equivalent meaning; preserve guards or mark the port incomplete. |
| Repository strategy or policy | An accessible, current Confluence page in the agent's knowledge scope. Do not adopt demo strategy as the team's strategy. |
| Script-generated input | Inspect the script's filters and joins; reproduce with JQL, lookup actions, or a supplied export. Do not pretend raw records are transformed inputs. |
| Comment, report, or item creation | Prefer an automation action (Add comment, Create work item, Publish new page, Edit work item) fed by the agent response. Verify the exact action exists in that product's automation. |
| Enforced write limits | Encode counts and allowed fields in automation actions, conditions, and branches where possible; state which remain model compliance. |
| Duplicate suppression | Use a label, field, entity property, or lookup before write. Best effort; do not claim it prevents concurrent duplicates. |
| Human approval | A named person transitions, approves, or edits. The agent may draft or recommend; it must not set the approving state itself. |
| Self-triggered loops | Keep "allow rule trigger" off unless required; exclude the automation actor; add a marker the trigger's conditions skip. |

## Review the output as a procedure

Every required input needs an accessible source or named prerequisite. Use
consistent placeholders for site, project key, space key, parent page, time
window, and destination. Preserve links rather than reconstructing them from
titles. Keep credentials out of instructions and prompts.

Walk through these outcomes before calling the configuration ready:

- Valid evidence: produce the artifact within the inherited scope.
- Empty eligible input: report no eligible evidence and stop; ensure the flow's
  follow-up actions do not publish an empty or invented report.
- Missing input or access: identify what is unavailable; do not treat a
  permission-filtered search as an empty dataset. This applies to chat agents
  too, for example a linked page the agent cannot read.
- Conflicting evidence: show sources and unresolved interpretations.
- Duplicate result: follow the source rule or an explicitly proposed policy.
- Uncertain write: inspect the destination and the automation audit log before
  retrying; report uncertainty rather than publishing twice.

Record which scenarios were reviewed and whether verification was static or
performed on a site. Repository validators prove file structure, not Rovo
runtime behavior.

## Instruction quality before deployment

- Preserve the requested name throughout settings, instructions, and flows.
- Distinguish mechanically enforced limits, source recommendations, and new
  adaptation choices.
- Give every branch one consistent outcome; stop only when missing input
  prevents meaningful analysis.
- When automation parses the response, define one exact output shape,
  including the empty case, and a fallback branch for malformed or unexpected
  responses that writes nothing and notifies the owner.
- Describe evidence as absent from the supplied material, not nonexistent.
  Preserve exact quotations. Label proposed reviewers as suggestions.
- When adapting analysis workflows such as assumption surfacing, include a
  negative case: a clearly labeled hypothesis with a validation plan should
  produce no high-risk findings. Questions about how well a stated test is
  designed, such as sample size or comparison group, are refinements rather
  than high-risk findings unless the brief shows the test cannot answer its
  question. A no-findings result should not manufacture speculative missing
  considerations. Judge grounding and restraint, not a
  predetermined finding count.
- List every source guard that was dropped, including label-based exclusions,
  not only the ones that obviously don't apply.
- Keep knowledge scope and tools as narrow as the workflow allows.
- Do not add claims the agent cannot establish, such as "nothing was changed".
