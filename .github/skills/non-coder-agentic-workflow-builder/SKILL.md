---
name: non-coder-agentic-workflow-builder
description: >
  Use this skill when a non-coding operator such as a product manager, product
  ops lead, compliance partner, GTM lead, program owner, researcher, designer,
  support lead, or team lead describes problems they want to solve for a team or
  process and wants agentic workflows, repo folders, blank operating docs,
  policies, issue templates, or a starter setup derived from Agentics Beyond
  Code. Trigger on requests like "set up workflows for my team", "what agentic
  workflows do I need", "turn my process into agentic workflows", "bootstrap
  Agentics Beyond Code", "create strategy and how-we-work docs", "set up
  project boards and issue templates", or "steal from this repo for our team".
---

# Non-Coder Agentic Workflow Builder

This skill turns a non-coder's plain-language team or process problems into an
Agentics Beyond Code repo setup: selected GitHub Agentic Workflows, supporting
documents, folder structure, policies, and adoption steps.

## Core workflow

1. Ask for, or infer from the user's message:
   - team type and operating context
   - recurring pain points
   - existing artifacts and systems of record, including external tools such as
     Slack, Jira, Confluence, Microsoft 365, Google Workspace, Salesforce,
     ServiceNow, Notion, Asana, or Linear
   - desired workflow outputs: comments, issues, PRs, discussions, reports
   - whether they want GitHub Projects, labels, and issue templates set up
   - tolerance for automation creating work items or PRs
2. Read `prompts/design-non-coder-workflow-system.md` for the full selection and
   scaffolding procedure.
3. Inspect this repo for reusable source material before creating anything:
   - `.github/workflows/*.md`
   - `.github/policies/*.md`
   - `.github/ISSUE_TEMPLATE/*.yml`
   - `docs/strategy.md`
   - `docs/how-we-work.md`
   - `docs/workflow-ideas.md`
   - `docs/how-it-works.md`
4. Create or update a concrete setup in the target repo:
   - blank `docs/strategy.md`
   - blank `docs/how-we-work.md`
   - folders for `decisions/`, `transcripts/`, `.github/policies/`,
     `.github/workflows/`, and `.github/ISSUE_TEMPLATE/`
   - optional project board plan, label taxonomy, and generic issue templates
   - copied or adapted workflow `.md` files from Agentics Beyond Code
   - copied or adapted policy and issue-template files when the workflow needs
     them
5. For workflow implementation details, route through the existing
   `agentic-workflows` skill and its creation/update prompts.
6. Validate the setup with `gh aw compile --strict` when gh-aw is available.

## Output standard

When the user asks for a recommendation only, produce a concise setup plan with:

- problems heard
- recommended workflows
- documents and folders to create
- workflow dependencies and required policies
- optional project board, labels, and issue templates
- rollout order

When the user asks to set it up, make the files. Prefer real repo artifacts over
long explanations.

## Important defaults

- Start with living documents before complex automation. Strategy and
  how-we-work docs are the substrate the workflows reason over.
- Prefer workflows already present in this repo before designing new ones.
- Keep workflows artifact-centered: report, decision record, issue, PR, comment,
  or discussion.
- Keep the agent job read-only and use `safe-outputs` for writes.
- Do not import fictional sample data from the repo into a user's real setup.
  Use the blank templates in `assets/blank-repo/` as the starting point.
- Treat GitHub Projects and issue templates as optional operating-system setup.
  Include them when the user's workflow needs structured work tracking,
  launch/intake flow, status reporting, or project-field data.
- If the user cannot name exact workflows, map pain points to the catalog in
  `docs/workflow-ideas.md` and the selection table in
  `prompts/design-non-coder-workflow-system.md`.
- When adapting Slack-related workflows, start from the standard emoji meanings
  in `docs/slack-integration-plan.md`, but expose the actual emoji names as
  configuration so each workspace can substitute its own conventions.
- Calendar workflows (`calendar-load-report.md`, `calendar-strategy-audit.md`,
  and the meeting prep step in `daily-standup-prep.md`) are fixture-first:
  they run against `google-calendar-fixtures/week-sample.json` until
  `GOOGLE_OAUTH_REFRESH_TOKEN` (with `calendar.readonly` + `calendar.events`
  scopes) is added to the `google-docs-demo` environment. When recommending
  calendar workflows, flag that a shared team calendar (not a personal
  `primary` calendar) should be used to avoid personal events appearing in
  GitHub artifacts. Set `GOOGLE_CALENDAR_ID` to the team calendar's email
  address before enabling live mode.
