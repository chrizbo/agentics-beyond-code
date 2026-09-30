---
name: agentic-workflow-planner
description: >
  The platform-neutral front door to Agentics Beyond Code. Use it to assess how
  a team or organization works today and to design which agentic workflows,
  living documents, and human approval points it should adopt, before building
  on GitHub, Claude, Productboard, Atlassian, or Google Workspace. Trigger on assessment requests such as a
  pre-work or readiness assessment, current-state and gap analysis, org health
  readout, delivery or process diagnosis, bottleneck analysis, or a review of
  GitHub, Jira, Linear, project boards, incidents, discussions, and operating
  docs. Also trigger on design requests from non-coding operators (product
  managers, product ops, compliance, GTM, program owners, researchers,
  designers, support leads, team leads) such as "what agentic workflows do I
  need", "turn my process into agentic workflows", "set up workflows for my
  team", "bootstrap Agentics Beyond Code", "steal from this repo for our team",
  or "where should these workflows run".
---

# Agentic Workflow Planner

This skill covers the two platform-neutral steps of the Agentics Beyond Code
pipeline:

```text
Assess  ->  Design  ->  Build (github-workflow-builder |
                               claude-native-workflow-builder |
                               productboard-agent-builder |
                               atlassian-agent-builder |
                               google-workspace-agent-builder)
```

It diagnoses what the work signals say, designs the smallest useful workflow
set, picks where each workflow should run, and hands a finished design to a
platform builder. It does not create workflows, Routines, or Spark skills
itself.

## Installed plugin context

When installed as a plugin, resolve bundled repository paths from the package
root (three directories above this `SKILL.md`), not the user's working folder.
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

## Choose the mode

| The user wants | Mode | Read |
|---|---|---|
| To know what is happening, what is broken, or whether the team is ready | **Assess** | `references/assess.md`, then `references/assessment-signals.md` for substantive work |
| To know which workflows to adopt, or to turn a process into automation | **Design** | `references/design.md` |
| Both, or "where do we start" | Assess, then Design | both, in order |

When a design selects an existing repository workflow, read it as
`references/reading-workflow-sources.md` describes. Every platform builder uses
the same guide. It covers which parts carry the workflow's meaning, schedules
paused for this demo repository, demo scaffolding to drop, and downstream
workflows that consume the output.

If the user already names a platform and a specific workflow to port (for
example, "make the Friday trends report a Claude Routine"), skip this skill
and go straight to that platform's builder.

## Assess

Inspect the team's real systems of work and separate observations,
inferences, and recommendations. Treat missing access as a finding. Calibrate
confidence to the evidence and do not judge individuals. Before recommending
any workflow, name readiness gaps: missing systems of record, unclear
ownership or taxonomy, unreliable status data, or absent strategy,
how-we-work, decision, or intake artifacts. If the team is not ready, say so
and propose pre-work.

Follow the full procedure, evidence standards, and output pattern in
`references/assess.md`.

## Design

Turn problems into a small workflow set, preferring workflows that already
exist in this repo. Put living documents before automation, give every
workflow a readable artifact and an explicit human gate, and name an owner and
an off switch. Then choose the platform per workflow.

Follow the intake, pain-point map, principles, and platform table in
`references/design.md`.

## Hand off to a builder

When the design is complete, state the handoff contract from
`references/design.md` (problems, workflows, triggers, artifacts, gates,
prerequisites, owner, platform, rollout order), then continue with the chosen
builder:

- `github-workflow-builder` for GitHub Issues/Projects/Discussions teams using
  GitHub Agentic Workflows
- `claude-native-workflow-builder` for Claude Routines and Scheduled Tasks
- `productboard-agent-builder` for Productboard Spark skills
- `atlassian-agent-builder` for Rovo agents with Jira or Confluence automation
- `google-workspace-agent-builder` for Workspace Studio flows and skills, matched
  to the team's Workspace plan

When the user asked only for a recommendation, stop at the design and offer
the builder as the next step.

## Output standard

- Assessment: use the structure in `references/assess.md`.
- Design: problems heard, recommended workflows (port or new), documents and
  templates to create first, dependencies and policies, human gates, platform
  per workflow with a one-line reason, and rollout order.

Prefer concrete recommendations over long explanations. Keep it short enough
that a team lead can act on it the same day.
