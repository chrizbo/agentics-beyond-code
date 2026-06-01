# External Integration Patterns

Future work for extending Agentics Beyond Code beyond GitHub-native artifacts.

The current system treats GitHub issues, projects, discussions, pull requests,
policy files, transcripts, and decision records as the operating surface. That
is a good default: GitHub gives the workflows durable artifacts, permissioned
history, reviewable changes, and safe outputs.

Many real teams, though, also make and change commitments in Slack, Microsoft
Teams, Jira, Confluence, Google Docs, Notion, Salesforce, ServiceNow, and other
systems. External integrations should bring those signals into the same
artifact-centered model without turning the workflows into broad, unreviewed
automation.

## Integration Principle

Use external systems as signal sources and action targets, but keep GitHub as
the durable reasoning and audit layer.

That means:

- Read external context through narrow API or MCP tools.
- Normalize that context into GitHub artifacts where possible.
- Let the agent reason over the combined context.
- Write back to external tools only through constrained, validated actions.
- Prefer links to source evidence over copied context when privacy or retention
  expectations are unclear.

## Candidate Platforms

| Platform | Why it matters | Integration fit |
|---|---|---|
| Atlassian Jira and Confluence | Structured work tracking, specs, decisions, and operational docs. | Excellent fit. Jira issues and Confluence pages map naturally to GitHub issues, decisions, and policy docs. Atlassian has an official Rovo MCP server for Jira and Confluence. |
| Slack | High-volume conversational signal for commitments, blockers, decisions, and reactions. | Excellent first integration. Official Slack MCP support exists, and Slack maps well to transcript-like context ingestion plus narrow update posts. |
| Microsoft 365 | Teams, Outlook, SharePoint, OneDrive, Planner, and enterprise documents. | High-value, higher setup cost. Microsoft Graph provides broad API coverage, but auth and tenant approval are likely heavier than Slack or Atlassian. |
| Google Workspace | Drive, Docs, Sheets, Calendar, Chat, and meeting artifacts. | Strong fit for docs, spreadsheets, calendars, and meeting context. Likely needs narrow custom tools or carefully scoped API adapters. |
| Salesforce | Customer, account, GTM, and revenue context. | Strong GTM fit. Useful for customer-impact summaries, launch risk, and customer feedback synthesis. Requires careful permissioning and PII boundaries. |
| ServiceNow | ITSM, approvals, incidents, risk, and enterprise operations. | Strong compliance and operations fit. Best for governed workflows with explicit state transitions and audit requirements. |
| Notion | Lightweight docs, roadmaps, tasks, and team operating systems. | Good fit for smaller teams and mixed docs/tasks workflows. Official MCP support makes it attractive for early experiments. |
| Asana | Cross-functional work tracking and portfolio status. | Good fit for non-engineering program workflows and roadmap/status reconciliation. |
| Linear | Product and engineering issue tracking. | Technically clean, especially for product-engineering teams, but narrower enterprise footprint than Jira or Microsoft 365. |

## Reusable Patterns

### Read-Through Context

The workflow queries an external system for context, then cites that context in
GitHub output.

Examples:

- Pull recent Slack threads related to a launch issue.
- Search Confluence for a linked launch spec.
- Fetch Salesforce customer-impact notes for a launch readiness report.
- Read a Google Doc or Sheet as policy or evidence input.

This should usually be the first pattern implemented for a new platform because
it avoids external writes.

### GitHub Mirror

External signals become GitHub issues, comments, decision records, or markdown
docs. GitHub remains the reviewable system of record.

Examples:

- Convert a Slack thread marked with an emoji into an intake issue.
- Mirror a Jira blocker into a GitHub sub-issue.
- Turn a Confluence decision page into a decision record PR.

For conversational sources such as Slack, prefer a layered record in GitHub:
a short summary, selected copied context in a collapsed details block, and
links back to source permalinks. This preserves enough context for review while
keeping the external system as the source evidence.

### External Safe Outputs

The agent proposes an external action as structured data. A deterministic
post-agent step validates the action before calling the external API.

Validation should check:

- Tool and action allowlist.
- Target channel, project, page, ticket, or record allowlist.
- Required source links back to GitHub and the external source.
- Idempotency keys or duplicate markers.
- Max actions per run.
- Message templates and blocked content rules.
- Human-review requirements for sensitive actions.

### Event Bridge

External events trigger a GitHub workflow or create a GitHub artifact.

Examples:

- Slack reaction opens or updates a GitHub issue.
- Jira transition triggers a launch readiness refresh.
- Salesforce opportunity stage change triggers customer-impact review.
- ServiceNow approval state change updates a compliance sub-issue.

### Report-Back

The workflow analyzes GitHub state, then posts a small update back to the tool
where the relevant audience works.

Examples:

- Post launch readiness summary to Slack.
- Update a Confluence weekly status page.
- Add a Salesforce account note when a launch changes customer risk.
- Comment on a Jira epic with the linked GitHub status.

## Open Design Questions

- Which systems are authoritative for each artifact type?
- Which external writes require human approval?
- How should external permissions map to GitHub workflow permissions?
- What retention and privacy boundaries apply to copied conversation context?
- Should external context be stored in GitHub, summarized in GitHub, or only
  linked from GitHub?
- How should reactions, mentions, and commands be guarded against accidental or
  malicious automation triggers?
