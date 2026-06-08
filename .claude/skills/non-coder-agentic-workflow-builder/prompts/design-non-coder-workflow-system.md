---
description: Design and scaffold a non-coder-facing Agentics Beyond Code workflow system from team problems, process gaps, and desired operating artifacts.
disable-model-invocation: true
---

# Non-Coder Agentic Workflow System Designer

Use this prompt after the `non-coder-agentic-workflow-builder` skill triggers.

Your job is to convert a non-coder's description of team or process problems
into a small, operable set of agentic workflows and the repo structure those
workflows need. Steal aggressively from this repo's existing patterns, but
remove fictional sample content before placing artifacts in a real team repo.

## Intake

If the user has already described the problem, proceed. Ask at most two focused
questions only when necessary.

Useful inputs:

- team type: product team, platform team, compliance team, GTM team, leadership
  portfolio, product ops, design, research, support, customer success, program
  management, operations
- process pain: stale docs, launch risk, slow triage, missing decisions,
  compliance churn, unclear strategy, meeting follow-up, stakeholder reporting,
  team feels stuck or too comfortable, same voices dominating decisions, groupthink,
  rituals running on autopilot
- source of truth: GitHub Issues, Projects, Discussions, transcripts, policy
  docs, release docs
- external systems: Slack, Jira, Confluence, Microsoft 365, Google Workspace,
  Salesforce, ServiceNow, Notion, Asana, Linear, or other team tools
- desired output: report discussion, issue comment, new issue, PR updating docs,
  decision record, checklist, leadership brief
- work tracking setup: GitHub Projects board, labels, issue templates, issue
  hierarchy, or none
- automation posture: observe only, suggest changes, or create issues/PRs

## Pain Point To Workflow Map

Use existing workflows first:

| Non-coder problem | Recommended workflow(s) | Required docs/folders |
|---|---|---|
| Strategy is vague or work drifts from priorities | `strategy-alignment.md`, optionally `adversarial-pm.md` | `docs/strategy.md`, `decisions/` |
| Decisions are lost in comments or meetings | `decision-log.md`, `transcript-processor.md` | `decisions/`, `transcripts/` |
| Team process docs are stale | `process-analyzer.md` | `docs/how-we-work.md`, `transcripts/` |
| Launch status is hard to see | `launch-readiness.md`, `weekly-status.md` | launch issue template, launch project board, launch readiness policy |
| Compliance reviews are slow or inconsistent | `compliance-review.md`, `compliance-team-reports.md` | security/privacy/accessibility/responsible AI policies |
| GTM work is forgotten late in launch | `gtm-content.md`, `gtm-team-reports.md` | voice and tone policy, launch issue structure |
| Incoming requests are messy | `intake-triage.md` | intake issue template, strategy doc |
| Standups are unfocused | `daily-standup-prep.md` | `docs/how-we-work.md`, issue/project data |
| Leaders need different views of the same work | `leadership-brief.md`, `weekly-status.md` | leadership brief policies, weekly status policy |
| Workflow reliability and costs need monitoring | `workflow-health.md` | `.github/aw/logs/`, workflow files |
| Slack contains important decisions, blockers, commitments, or intake requests | Slack Context Processor, Slack Reaction Intake | `docs/slack-integration-plan.md`, Slack app config, allowed channel map |
| Team feels stuck, keeps making the same decisions, same voices dominate, or process rituals run on autopilot | `chaos-monkey.md` | `decisions/`, `transcripts/`, `docs/strategy.md`, `docs/how-we-work.md` |

For new workflow ideas, read `docs/workflow-ideas.md` and then route through
the `agentic-workflows` skill.

## Scaffolding Procedure

When asked to create the setup, build the minimum viable repo substrate before
adding workflows.

Create these folders if absent:

```text
docs/
decisions/
transcripts/
.github/workflows/
.github/policies/
.github/ISSUE_TEMPLATE/
```

Create blank docs from the templates in `assets/blank-repo/`:

- `docs/strategy.md`
- `docs/how-we-work.md`

Also create `.gitkeep` files for empty folders when needed:

- `decisions/.gitkeep`
- `transcripts/.gitkeep`

Then copy/adapt only the workflow and policy files needed by the selected
workflow set. Avoid copying all workflows by default.

## Optional Project and Issue Setup

Offer this module when the user wants GitHub to be the team's operating surface
or when selected workflows need issue/project metadata.

### Issue hierarchy

Use this default hierarchy unless the user has a better one:

```text
Initiative -> Launch/Bet/Project -> Workstream/Epic -> Task
```

Adapt names to the domain:

- Product/GTM: `Initiative -> Launch -> Epic -> Task`
- Compliance/Ops: `Program -> Review -> Finding -> Action`
- Research/Design: `Research Program -> Study -> Insight -> Follow-up`
- Support/Customer Success: `Theme -> Customer Issue -> Action`

### Issue templates

When useful, copy generic templates from
`assets/blank-repo/.github/ISSUE_TEMPLATE/`:

- `initiative.yml` for strategic goals, programs, or themes
- `launch.yml` for shippable milestones, bets, projects, reviews, or studies
- `intake.yml` for requests, bugs, feedback, or work intake

Rename titles, labels, and fields to match the user's domain. Keep templates
short enough that non-coders will actually fill them out.

### Labels

Recommend a small label taxonomy before creating many labels:

- Type: `initiative`, `launch`, `epic`, `task`, `intake`
- State: `blocked`, `at-risk`, `ready-for-review`, `needs-more-info`
- Automation-managed: `ai:meeting-discussed`, `ai:process-update`,
  `ai:automation-candidate`, `ai:needs:<domain>`
- Domain sign-off: `approved:<domain>`
- Triage: `triage-needed`, `triaged`, `duplicate`, `rice:high`,
  `rice:medium`, `rice:low`

Only create labels used by selected workflows or issue templates.

### Project boards

If project boards are in scope, propose one or both:

| Board | Purpose | Useful fields |
|---|---|---|
| Delivery / Launch Tracker | Track initiatives, launches, reviews, bets, or programs through delivery | `Status`, `Phase`, `Target Date`, `Owner`, `Risk Level`, `Launch Type` or domain equivalent |
| Intake Triage | Track new requests through triage and prioritization | `Status`, `Request Type`, `RICE Score`, `RICE Level`, `Kano Category`, `Decision` |

Default statuses:

- Delivery / Launch Tracker: `Backlog`, `Planning`, `In Progress`,
  `Review`, `Blocked`, `Done`
- Intake Triage: `Needs Triage`, `Needs More Info`, `Triaged`,
  `Duplicate`, `Accepted`, `Deferred`

If the user asks to set boards up directly, use `gh project` commands when
available. Verify auth has project scopes (`read:project` and `project`) before
creating or editing project fields. If CLI support is missing or ambiguous,
produce a board setup checklist instead of pretending it was created.

## Blank Document Requirements

`docs/strategy.md` must invite the team owner to define strategic tradeoffs in the
"X, even over Y" format and include empty alignment evidence sections that
`strategy-alignment.md` can update.

`docs/how-we-work.md` must include blank sections for:

- team
- meeting cadence
- ritual cadence table
- issue triage
- decision-making
- PR or review process
- communication norms
- automation and tooling
- manual processes that are candidates for automation

Do not copy fictional people, dates, or sample decisions from the repo's demo
docs into a user's real setup.

## Workflow Adaptation Rules

Before copying any workflow:

1. Read the source workflow.
2. Identify every file path, policy, label, project, script, and secret it
   expects.
3. Copy or create the required support files.
4. Remove dependencies that are specific to the sample repo unless the user has
   that same structure.
5. Keep permissions read-only. Use `safe-outputs` for PRs, comments, issues,
   discussions, and attachments.
6. Compile with `gh aw compile --strict <workflow-id>` when available.

Common dependencies:

- workflows that read project data may need `.github/scripts/fetch-launch-data.sh`
- launch/compliance/GTM workflows need issue templates and policies
- project-aware workflows need a project board with fields matching the
  workflow's assumptions, or the workflow prompt must be adapted to use labels
  and issue body fields instead
- transcript workflows need `transcripts/`
- decision workflows need `decisions/`
- process and strategy workflows need blank docs under `docs/`
- Slack workflows need allowed channel IDs, standard reaction semantics, Slack
  app credentials, and configurable emoji names matching
  `docs/slack-integration-plan.md`

## Recommended Rollout

Unless the user has a stronger priority, suggest this order:

1. Foundation: `docs/strategy.md`, `docs/how-we-work.md`, folder structure.
2. Operating surface: issue templates, labels, and project boards if wanted.
3. Memory: `decision-log.md` and `transcript-processor.md`.
4. Alignment: `strategy-alignment.md` and `process-analyzer.md`.
5. Work intake/status: `intake-triage.md`, `weekly-status.md`, or
   `launch-readiness.md`.
6. Specialized domain workflows: compliance, GTM, leadership briefs, workflow
   health.

## Final Response

Keep the final response concrete:

- what was created or recommended
- whether project boards, labels, and issue templates were included
- which source workflows were reused
- what the team owner needs to fill in before production use
- any validation run and its result
