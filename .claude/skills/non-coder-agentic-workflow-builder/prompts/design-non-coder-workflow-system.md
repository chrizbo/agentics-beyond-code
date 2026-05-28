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
  compliance churn, unclear strategy, meeting follow-up, stakeholder reporting
- source of truth: GitHub Issues, Projects, Discussions, transcripts, policy
  docs, release docs
- desired output: report discussion, issue comment, new issue, PR updating docs,
  decision record, checklist, leadership brief
- automation posture: observe only, suggest changes, or create issues/PRs

## Pain Point To Workflow Map

Use existing workflows first:

| Non-coder problem | Recommended workflow(s) | Required docs/folders |
|---|---|---|
| Strategy is vague or work drifts from priorities | `strategy-alignment.md`, optionally `adversarial-pm.md` | `docs/strategy.md`, `decisions/` |
| Decisions are lost in comments or meetings | `decision-log.md`, `transcript-processor.md` | `decisions/`, `transcripts/` |
| Team process docs are stale | `process-analyzer.md` | `docs/how-we-work.md`, `transcripts/` |
| Launch status is hard to see | `launch-readiness.md`, `weekly-status.md` | launch issue template, launch readiness policy |
| Compliance reviews are slow or inconsistent | `compliance-review.md`, `compliance-team-reports.md` | security/privacy/accessibility/responsible AI policies |
| GTM work is forgotten late in launch | `gtm-content.md`, `gtm-team-reports.md` | voice and tone policy, launch issue structure |
| Incoming requests are messy | `intake-triage.md` | intake issue template, strategy doc |
| Standups are unfocused | `daily-standup-prep.md` | `docs/how-we-work.md`, issue/project data |
| Leaders need different views of the same work | `leadership-brief.md`, `weekly-status.md` | leadership brief policies, weekly status policy |
| Workflow reliability and costs need monitoring | `workflow-health.md` | `.github/aw/logs/`, workflow files |

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
- transcript workflows need `transcripts/`
- decision workflows need `decisions/`
- process and strategy workflows need blank docs under `docs/`

## Recommended Rollout

Unless the user has a stronger priority, suggest this order:

1. Foundation: `docs/strategy.md`, `docs/how-we-work.md`, folder structure.
2. Memory: `decision-log.md` and `transcript-processor.md`.
3. Alignment: `strategy-alignment.md` and `process-analyzer.md`.
4. Work intake/status: `intake-triage.md`, `weekly-status.md`, or
   `launch-readiness.md`.
5. Specialized domain workflows: compliance, GTM, leadership briefs, workflow
   health.

## Final Response

Keep the final response concrete:

- what was created or recommended
- which source workflows were reused
- what the team owner needs to fill in before production use
- any validation run and its result
