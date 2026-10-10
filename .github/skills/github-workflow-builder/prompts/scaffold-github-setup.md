---
description: Scaffold an Agentics Beyond Code workflow setup in a GitHub repo from a finished workflow design.
disable-model-invocation: true
---

# GitHub Setup Scaffolder

Use this prompt after the `github-workflow-builder` skill triggers.

Your job is to turn a workflow design into a working GitHub repo setup: the
folders, living documents, templates, labels, project boards, and gh-aw
workflow files the selected workflows need. The design itself (intake, which
workflows solve which problems, and rollout order) comes from
`../agentic-workflow-planner/references/design.md`. Steal aggressively from
this repo's existing patterns, but remove fictional sample content before
placing artifacts in a real team repo.

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

### Output location and narrow requests

When the user asks for only specific artifacts, create only those artifacts;
the full scaffolding procedure applies to requests for a repo setup. Resolve
blank templates from this skill's `assets/blank-repo/`, not the demo docs.

Use the user's selected writable workspace. If no folder is connected, prepare
the requested files as downloadable artifacts when supported and explain that
saving to the requested local folder remains pending. Ask for folder access only
when needed to finish that step. Do not substitute a connected external service
as the destination without the user's direction. Never write deliverables into
the installed plugin or claim an attachment was saved in the user's folder.

For an unchanged template request, preserve placeholders and verify the copied
files match the templates. When saving succeeds, report the actual destination
paths. Preserve existing user content when a destination file already exists.

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

The blank templates in `assets/blank-repo/docs/` already meet the living-document
requirements in `../agentic-workflow-planner/references/design.md`. Do not copy
fictional people, dates, or sample decisions from the repo's demo docs into a
user's real setup.

## Workflow Adaptation Rules

Before copying any workflow:

1. Read the source workflow.
2. Identify every file path, policy, label, project, script, and secret it
   expects.
3. Copy or create the required support files.
4. Remove dependencies that are specific to the sample repo unless the user has
   that same structure.
5. Check each dependency against the user's constraints. If a workflow needs
   something the user excluded or doesn't have (for example, it fetches GitHub
   Projects data but the user said no project boards), adapt the workflow
   before copying: drop the pre-step and read labels, issue fields, or docs
   instead. If adapting would change what the workflow is for, ask. Do not
   copy the conflicting dependency and list it as a prerequisite.
6. Keep permissions read-only. Use `safe-outputs` for PRs, comments, issues,
   discussions, and attachments.
7. Copy only the `.md` source. Never copy a `.lock.yml`: it is compiled for
   this repo and goes stale when the source changes. Generate it in the
   target with `gh aw compile --strict <workflow-id>`. If gh-aw is not
   available, say the workflow will not run until it is compiled.

For new workflows with no source in this repo, follow the gh-aw authoring
guidance described in the skill's core workflow (the `agentic-workflows` skill
when present, otherwise `github/gh-aw`'s `.github/aw/create-agentic-workflow.md`).

Common dependencies:

- every workflow's `engine:` block, carried over from this repo (it uses the
  Codex engine). Tell the user which engine the copied workflow uses and which
  repository secret that engine needs, and note that gh-aw supports other
  engines (check current gh-aw engine docs for names and secrets). A new team
  may prefer the engine it already pays for.
- workflows that read project data may need `.github/scripts/fetch-launch-data.sh`
- workflows that tell the story of an initiative or launch (release posts,
  retrospectives) can use `.github/scripts/blog/fetch-initiative-evidence.mjs`
  with `initiative-evidence.mjs`; it needs no project board, but PRs must
  close or reference tasks in the tree to count as evidence
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

## Rollout

Follow the rollout order from the design. If none was given, use the default
order in `../agentic-workflow-planner/references/design.md`.

## Final Response

Keep the final response concrete:

- what was created or recommended
- whether project boards, labels, and issue templates were included
- which source workflows were reused
- what the team owner needs to fill in before production use
- any validation run and its result
