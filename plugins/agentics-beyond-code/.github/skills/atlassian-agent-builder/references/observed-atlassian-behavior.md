# Atlassian field observations

No field observations have been recorded yet. The deployment and trigger
guidance in this skill is derived from Atlassian documentation checked
2026-09-29. Until this file records a tested route, report every deployment as
the first observation on that site and verify each step at the point of action.

When a user authorizes recording a test, add a dated section using this table.
Omit private site URLs, IDs, names, and content.

| Area | Observation | Consequence for the builder |
|---|---|---|
| Creation path | | |
| Defaults (knowledge, tools, surfaces, sharing) | | |
| Persistence and read-back | | |
| Use Rovo agent action and agent write tools in automation | | |
| `{{agentResponse}}` formats in follow-up actions | | |
| Scheduled and event trigger timing | | |
| Work item and workflow transition invocation | | |
| Cleanup | | |

## Still unverified

- Whether custom agent write tools run inside automation flows, and under which
  admin or user settings (the documentation conflicts).
- Exact trigger, condition, and action names in the automation editor (for
  example a "label added" trigger), and label character rules such as colons.
- Prompt size limits when passing lookup results to the agent step.
- Whether lookup results include comments, and how Create page and Add comment
  actions render markdown from `{{agentResponse}}` (markdown versus ADF).
- Cross-product actions, such as creating a Confluence page from a Jira rule.
- The Confluence automation equivalent of Use Rovo agent and its labels.
- Custom skill authoring in Rovo Studio and its limits.
- Instruction length limits, sharing and visibility options, and credit costs.
- Workflow transition invocation behavior and what an invoked agent may change.
- Any MCP or API path for agent or automation administration.
