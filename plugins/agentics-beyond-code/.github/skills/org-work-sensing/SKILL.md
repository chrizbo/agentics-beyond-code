---
name: org-work-sensing
description: >
  Assess what is happening inside an organization or team by inspecting systems
  of work such as GitHub, Jira, Linear, issue trackers, pull requests, project
  boards, incidents, discussions, and operating docs. Use when a user asks for
  a pre-work assessment before adopting agentic workflows, current-state and gap
  analysis, org health readout, delivery/process diagnosis, bottleneck analysis,
  team operating assessment, cross-functional work review, or recommendations
  based on evidence from messy or incomplete work artifacts.
---

# Org Work Sensing

This skill helps the assistant inspect work artifacts, infer operating patterns, and
recommend practical changes. Treat it as an assessment layer: it diagnoses what
the work signals suggest, identifies what must be fixed before automation is
useful, then routes setup or automation recommendations to other skills when
needed.


## Installed plugin context

When installed as a plugin, resolve bundled repository paths from the package
root (three directories above this `SKILL.md`), not the user's working folder.
Resolve `references/`, `prompts/`, and `assets/` relative to this skill folder.
The package is reference material; create deliverables in the user's selected
workspace and assess the user's artifacts, never the bundled demo data.
For an explicitly supplied source checkout, read that checkout's current
files. The directory plugin does not bundle runtime workflows, helper scripts,
or demo data. Before using a repository path outside this skill, read
`docs/source-access.md` at the package root. It explains how to locate and fetch
specific files from the recorded public source revision. If source access is
unavailable, request a checkout or the relevant files; do not invent a workflow
or say it was read. Blank templates and assessment references work offline.
Installing these skills does not connect services, install `gh`/`gh aw`, or
activate workflows or scheduled tasks. Check available tools before using them.

## Core Workflow

1. Clarify the assessment frame when it is not obvious:
   - organization, team, repo, project, or timeframe
   - systems of record available, such as GitHub, Jira, Linear, Notion,
     Confluence, Slack exports, incident tools, or project boards
   - access path for each system: MCP/connector, CLI, API, local repo,
     exported CSV/JSON, copied text, or representative links
   - desired output: executive readout, team retro, workflow recommendations,
     readiness gap analysis, risk review, automation candidates, or a
     prioritized action plan
2. Inventory available access before analysis. Do not assume MCPs or connectors
   are configured. If direct access is missing, request exports or representative
   artifacts and record the access gap as part of the current-state assessment.
3. Collect evidence from accessible sources. Prefer direct artifacts over
   recollection:
   - GitHub issues, PRs, discussions, milestones, labels, projects, releases,
     workflow runs, and CODEOWNERS or policy files
   - Jira or Linear issues, statuses, cycle metadata, comments, components,
     labels, epics, and blockers when available
   - operating docs such as strategy, roadmap, how-we-work, incident reviews,
     decision logs, support escalations, launch plans, and compliance notes
4. Read `references/assessment-signals.md` when doing a substantive assessment
   or when comparing evidence across tools.
5. Separate observations, inferences, and recommendations:
   - observation: directly supported by artifacts
   - inference: likely pattern or cause, with confidence and caveats
   - recommendation: concrete change, owner, expected effect, and first step
6. Produce an assessment that is useful without overclaiming. Include missing
   evidence, contradictory signals, and any access limitations.
7. Identify readiness gaps before recommending agentic workflows:
   - missing systems of record
   - unclear work taxonomy or ownership
   - sparse or unreliable status data
   - absent strategy, how-we-work, decision, or intake artifacts
   - tool topology that prevents a useful agent from seeing the work
8. If the recommendation is to create workflows, docs, issue templates, policies,
   project boards, or repo setup, route implementation through
   `non-coder-agentic-workflow-builder`. If the recommendation requires GitHub
   Agentic Workflow creation or debugging, route through `agentic-workflows`.

## Evidence Standards

- Prefer bounded time windows. Default to the last 30-90 days unless the user
  asks for a longer trend.
- Do not infer individual performance from sparse artifacts. Focus on system
  design, work flow, decision quality, ownership, and coordination patterns.
- Treat private, sensitive, or HR-adjacent information carefully. Summarize
  patterns instead of exposing unnecessary personal details.
- State data source coverage. Name which repos, projects, issue queries, docs,
  or exported files were inspected.
- Treat missing connector access as a finding, not a failure. Explain what can
  and cannot be assessed from the available artifacts.
- Use counts and examples when available, but do not let metrics replace
  qualitative evidence.
- Preserve uncertainty. Use confidence labels such as high, medium, or low when
  the evidence base is partial.

## Calibrate conclusions to the evidence

Apply uncertainty to recommendations, effort estimates, and readiness judgments
as well as the summary, readiness table, and individual findings. A few unowned items establish an ownership gap in those items, not
that the whole team lacks ownership. Missing information about an approval
policy is an unknown, not proof that no policy exists. Waiting time alone does
not establish a bottleneck without an expected turnaround or evidence of impact.
Do not rule out capacity or other causes simply because the sample cannot show
them. Use claim-specific confidence; directly observed counts and inferred
causes need not have the same confidence.

Read the inference guidance in `references/assessment-signals.md` for sparse
samples. Keep proposed response windows and pilot durations labeled as examples
to calibrate with the team, not thresholds established by the evidence.

## Output Pattern

For most assessments, use this structure:

- Scope and sources inspected
- Executive readout
- Current-state topology
- Key operating signals
- Readiness gaps
- Bottlenecks and risks
- Recommendations
- Suggested workflows or artifacts to add
- Evidence gaps and next questions

Keep recommendations practical. Prefer small operating changes before broad
reorganizations or heavy automation.

For pre-work assessments, include a readiness ladder:

1. Minimum viable visibility: what an agent or human can reliably inspect today
2. Missing substrate: docs, labels, fields, issue templates, ownership, or links
3. Cleanup sequence: the smallest fixes that make the system legible
4. Automation candidates: only the workflows that are ready enough to implement

## Recommendation Heuristics

- If work is stale or blocked, check ownership, decision paths, review queues,
  dependencies, and unclear priority before recommending more process.
- If many issues are created but few close, inspect intake quality, triage
  rituals, label hygiene, capacity mismatch, and whether work items map to
  actual decisions.
- If PRs wait a long time, inspect review ownership, CODEOWNERS, CI stability,
  batch size, review norms, and release pressure.
- If priorities drift, inspect strategy docs, roadmap links, project fields,
  milestone discipline, and repeated escalations.
- If stakeholders ask the same questions repeatedly, recommend living status
  reports, decision logs, launch readiness reviews, or leadership briefs.
- If the team lacks usable source material, recommend starting with strategy and
  how-we-work docs before adding automation.
- If the topology is messy, map the current systems first: where work is
  requested, prioritized, executed, reviewed, released, and remembered.
- If the system is not ready for agentic workflows, say so directly and propose
  pre-work rather than forcing an automation design.

## Tool Notes

- For GitHub, use `gh` and local repo inspection when available. Avoid write
  operations unless the user explicitly asks for implementation.
- For Jira, Linear, or other trackers, first look for available MCPs,
  connectors, CLIs, exports, or user-provided files. If direct access is
  unavailable, ask for CSV/JSON exports or representative issue links.
- For generated recommendations that become repo changes, make those changes in
  the target repo and validate with the appropriate repo checks.
