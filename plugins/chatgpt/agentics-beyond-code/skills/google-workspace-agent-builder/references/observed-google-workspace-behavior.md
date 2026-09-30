# Google Workspace field observations

No field observations have been recorded yet. The deployment and trigger
guidance in this skill is derived from Google documentation checked
2026-09-29. Until this file records a tested route, report every deployment as
the first observation on that domain and verify each step at the point of
action.

When a user authorizes recording a test, add a dated section using this table.
Record the edition and release track. Omit private domains, IDs, names, and
content.

| Area | Observation | Consequence for the builder |
|---|---|---|
| Edition, add-ons, release track | | |
| Creation path (skill, flow, generated flow) | | |
| Defaults (scope, sharing, steps) | | |
| Persistence and read-back | | |
| Account the flow runs as | | |
| Ask Gemini output passed to later steps | | |
| Markdown rendering in Docs, Gmail, and Chat | | |
| Approvals page behavior | | |
| Scheduled and event starter timing | | |
| Quota consumption and daily cap | | |
| Cleanup | | |

## Still unverified

- Which account a flow runs as when shared, and what a shared flow's users can
  change.
- The daily run cap for each edition, and monthly quotas for Enterprise and
  Education editions.
- Exact starter, step, and condition names in the editor, and the variable
  syntax for passing earlier step output into Ask Gemini and later steps.
- Whether Ask Gemini can return structured fields that later steps read
  individually.
- How Doc, Gmail, and Chat steps render markdown from the Ask Gemini response.
- Which actions route through the Approvals page, and what happens to a run
  waiting for approval.
- Custom starter, custom step, integration, and webhook availability on a given
  domain after the September 2026 rollout.
- Whether Gemini Enterprise agent and NotebookLM steps need licenses beyond the
  Workspace edition.
- Skill instruction length limits and skill sharing options.
- Any MCP or API path for Studio flow or skill administration.
