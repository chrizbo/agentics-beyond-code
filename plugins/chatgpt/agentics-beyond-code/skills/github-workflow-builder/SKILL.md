---
name: github-workflow-builder
description: >
  Build an Agentics Beyond Code setup on GitHub: GitHub Agentic Workflows
  (gh-aw), repo folders, blank strategy and how-we-work docs, policies, issue
  templates, labels, and GitHub Projects boards. Use when a team whose work
  lives in GitHub Issues, Projects, or Discussions wants workflows set up or
  adapted from this repo, including requests like "set this up on GitHub",
  "create the gh-aw workflows for my team", "scaffold the repo", "create
  strategy and how-we-work docs in our repo", "set up project boards and issue
  templates", or "copy these workflows into our repo". For choosing which
  workflows to adopt or where they should run, use agentic-workflow-planner
  first.
---

# GitHub Workflow Builder

This skill implements an Agentics Beyond Code design on GitHub: selected GitHub
Agentic Workflows, supporting documents, folder structure, policies, issue
templates, labels, project boards, and adoption steps. It is the GitHub
builder alongside `claude-native-workflow-builder` and
`productboard-agent-builder`.

## Installed plugin context

When installed as a plugin, resolve bundled repository paths from the package
root (two directories above this `SKILL.md`), not the user's working folder.
Resolve `references/`, `prompts/`, and `assets/` relative to this skill folder.
The package is reference material; create deliverables in the user's selected
workspace and assess the user's artifacts, never the bundled demo data.
For an explicitly supplied source checkout, read that checkout's current
files. A checkout is the current working directory when it is this
repository, or a path the user gives. Never search the file system for one
(no `find /`, `mdfind`, or home-directory scans): that is slow and triggers
operating-system privacy prompts. Use the pinned source index instead. The directory plugin does not bundle runtime workflows, helper scripts,
or demo data. Before using a repository path outside this skill, read
`docs/source-access.md` at the package root. It explains how to locate and fetch
specific files from the recorded public source revision. If source access is
unavailable, request a checkout or the relevant files; do not invent a workflow
or say it was read. Blank templates and assessment references work offline.
Installing these skills does not connect services, install `gh`/`gh aw`, or
activate workflows or scheduled tasks. Check available tools before using them.

## Core workflow

1. Start from a design. If the user or `agentic-workflow-planner` already
   produced one, use it. If not, and the user can't name the workflows they
   want, run the planner's Design mode (`../agentic-workflow-planner/references/design.md`)
   first, keeping it short. Confirm that GitHub really is the team's home;
   if it isn't, suggest `claude-native-workflow-builder` or
   `productboard-agent-builder`.
2. Confirm the GitHub-specific choices:
   - target repo and whether it already has content
   - whether they want GitHub Projects, labels, and issue templates set up
   - tolerance for automation creating issues, comments, or PRs
   - which AI provider the org already uses. Set every copied workflow's
     `engine:` to match. If the org has GitHub Copilot, suggest the Copilot
     engine: it needs no separate API key. Keep Codex only if they use
     OpenAI. Check current gh-aw engine docs rather than assuming names.
3. Read `prompts/scaffold-github-setup.md` for the scaffolding procedure.
4. Inspect this repo for reusable source material before creating anything:
   - `.github/workflows/*.md`
   - `.github/policies/*.md`
   - `.github/ISSUE_TEMPLATE/*.yml`
   - `docs/how-it-works.md`
5. Create or update a concrete setup in the target repo:
   - blank `docs/strategy.md` and `docs/how-we-work.md`
   - folders for `decisions/`, `transcripts/`, `.github/policies/`,
     `.github/workflows/`, and `.github/ISSUE_TEMPLATE/`
   - optional project board plan, label taxonomy, and generic issue templates
   - copied or adapted workflow `.md` files from Agentics Beyond Code
   - copied or adapted policy and issue-template files when the workflow needs
     them
6. For gh-aw authoring details (frontmatter, triggers, safe outputs,
   debugging), use the `agentic-workflows` skill when it is available: it is
   present in a checkout of this repo and in repos set up with `gh aw init`.
   Otherwise, fetch the instructions it routes to directly from
   `github/gh-aw`, starting with `.github/aw/create-agentic-workflow.md`.
   The Claude plugin does not include `agentic-workflows`.
7. Validate the setup with `gh aw compile --strict` when gh-aw is available.

## Short answers preserve operating requirements

When summarizing or asked for a "short version", retain required manual steps,
blocking prerequisites, the human approval action, and the verification status
of the proposed workflow. Distinguish a drafted plan from configured or tested
execution. Compress explanations and examples first; do not imply an automated
input path when a person must forward email or supply an export. Keep these
requirements in the shortened answer itself, even if they appeared earlier.
A concise sentence can combine them: "Forward feedback manually to INTAKE;
review the draft before approving work; execution has not been tested."
Include only requirements that apply to this plan.

Preserve the planner's chosen intake, review, and work destinations. If no
contract exists, use the architecture selection guidance in
`../agentic-workflow-planner/references/design.md` before choosing them.

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
- If the user wants the same workflow on Claude or Productboard instead, hand
  off to that builder rather than forcing a GitHub setup.
- Keep workflows artifact-centered: report, decision record, issue, PR, comment,
  or discussion.
- Keep the agent job read-only and use `safe-outputs` for writes.
- Do not import fictional sample data from the repo into a user's real setup.
  Use the blank templates in `assets/blank-repo/` as the starting point.
- Treat GitHub Projects and issue templates as optional operating-system setup.
  Include them when the user's workflow needs structured work tracking,
  launch/intake flow, status reporting, or project-field data.
- If the user cannot name exact workflows, use the pain-point map in
  `../agentic-workflow-planner/references/design.md`.
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
