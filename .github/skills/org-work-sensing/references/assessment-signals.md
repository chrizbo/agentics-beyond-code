# Assessment Signals

Use this reference when turning work artifacts into an organizational assessment.
The goal is not to score people; it is to understand the operating system that
the artifacts reveal.

## Pre-Work Readiness

Before recommending automation or agentic workflows, assess whether the team's
systems are legible enough for an agent to help.

| Readiness Area | Ready Enough | Gap |
|---|---|---|
| Systems of record | It is clear where requests, commitments, decisions, and releases live | Work is split across tools with no durable home |
| Work taxonomy | Types, labels, statuses, and priorities have shared meaning | Fields exist but do not guide behavior |
| Ownership | Work has owners, reviewers, approvers, or accountable teams | Items drift without a named decision path |
| Source material | Strategy, how-we-work, roadmap, and decision records exist | Agents would have to infer goals from scattered comments |
| Links | Issues, PRs, docs, epics, incidents, and releases connect | Related work is only discoverable by memory |
| Permissions | The agent can inspect the right artifacts safely | Critical evidence is inaccessible or too sensitive |
| Access path | MCPs, connectors, CLIs, APIs, or exports provide reliable evidence | Access depends on screenshots, memory, or partial samples |

If several readiness areas have gaps, recommend a cleanup sequence before
workflow implementation. The first useful intervention may be a map of current
systems, a blank strategy or how-we-work doc, an intake template, label cleanup,
or a decision log.

## Signal Map

| Area | Healthy Signals | Watch Signals |
|---|---|---|
| Strategy | Work links to goals, roadmap, milestones, or customer outcomes | Many active threads with unclear goal connection |
| Ownership | Clear assignees, reviewers, decision owners, and escalation paths | Repeated handoffs, orphaned issues, unclear approvers |
| Flow | Work moves through states predictably with visible blockers | Long stale periods, frequent reopening, large batches |
| Decision quality | Decisions are recorded with rationale and follow-up owners | Decisions live only in comments, meetings, or chat fragments |
| Review health | Reviews are timely, scoped, and owned | PRs wait, CI is flaky, review load clusters on few people |
| Intake | New work has enough context, priority, and acceptance criteria | Vague asks, duplicate issues, unclear urgency |
| Cross-functional work | Dependencies, launch criteria, risks, and owners are visible | Late surprises, recurring stakeholder questions |
| Learning loop | Incidents, retros, and misses produce concrete changes | Same failure modes recur without owner or follow-up |

## GitHub Evidence

Inspect:

- issue age, labels, assignees, comments, linked PRs, milestones, and close rate
- PR age, review latency, number of reviewers, CI failures, size, and rework
- project fields, status transitions, iteration fields, and stale cards
- discussions, decision records, release notes, and roadmap docs
- workflow runs for recurring failures or deployment/release friction
- CODEOWNERS, branch protection hints, issue templates, and contribution docs

Useful questions:

- Which work is active but not moving?
- Which labels, milestones, or project fields actually guide behavior?
- Where do people ask for decisions, and where are decisions recorded?
- Are PRs waiting on humans, tests, unclear requirements, or large scope?
- Are repeated workflow failures creating hidden coordination cost?

## Jira or Linear Evidence

Inspect:

- issue type, status, cycle time, priority, assignee, reporter, component, epic
- blocked flags, dependencies, linked issues, comments, and status history
- sprint or cycle churn, rollover, unplanned work, and reopened work
- epic health, roadmap alignment, and unresolved decisions

Useful questions:

- Are statuses meaningful or just decorative?
- Does priority predict what actually gets worked?
- Are blockers resolved by owners or absorbed as waiting time?
- Does the team close the loop on incidents, customer escalations, or launch
  misses?

## Operating Docs Evidence

Inspect:

- strategy, roadmap, how-we-work, launch plans, decision logs, status reports
- incident reviews, compliance notes, support escalations, and customer feedback
- meeting notes or summaries when available

Useful questions:

- Do docs describe how work is actually happening?
- Are goals, owners, tradeoffs, and non-goals explicit?
- Are documents current enough to guide decisions?
- Is there a durable artifact for repeated questions?

## Inference Guidance

Use this format for each major finding:

```text
Finding: concise pattern
Evidence: 2-4 concrete artifacts or counts
Inference: what this likely means
Confidence: high/medium/low
Risk: why it matters
Recommendation: practical next step
```

Avoid:

- diagnosing culture from one artifact
- naming individuals as the problem
- treating missing data as proof of absence
- recommending automation before clarifying the human workflow
- flattening all teams into the same process template

### Sparse samples and confidence

- Report the supplied counts without assuming disjoint groups, a denominator,
  prevalence, or a trend. Separate confidence in the observation from confidence
  in its explanation; a limited sample need not make an explicit count uncertain.
- Distinguish an observed gap from an unknown. Missing owners on sampled items
  are an observed gap. Whether an ownership policy exists is unknown unless
  operating docs or other evidence establish it.
- Describe delays before diagnosing bottlenecks. Compare waiting time with the
  expected service window and downstream impact when available. Do not call a
  queue the largest source of delay without comparisons to other stages.
- Keep causes as alternatives until supported: unclear routing, unavailable
  approvers, incomplete requests, and capacity constraints can produce similar
  observations. Ask for evidence that distinguishes them.
- Bound consequences: outdated statuses can distort reports that depend on
  them; they do not prove that every report is wrong. Avoid universal claims
  such as "nobody owns work" or "the team has no capacity problem."
- Propose the smallest useful check or correction. Example response times and
  observation periods are adjustable suggestions. Readiness depends on reliable
  inputs for the selected automation, not an arbitrary number of elapsed weeks.

For example, five unowned requests, three waiting two weeks for approval, and
two completed requests with stale statuses support: "These examples show
ownership gaps, approval waits, and outdated statuses. Their prevalence and
causes remain unclear." They do not establish ten distinct affected requests,
an absent approval policy, or a team-wide diagnosis. Use the same qualification
in the executive summary and readiness table.

### Carry uncertainty into recommendations

Before finalizing, check that proposed actions do not assume facts the findings
left unresolved. Refer to "affected requests" when groups might overlap; do not
sum them into a unique-item count. Missing recorded ownership does not establish
that no one is accountable: first identify any existing owner and record them,
or assign one if needed. Verify completion and reconcile stale statuses rather
than automatically prescribing closure.

Do not invent cleanup durations or promise that a short intervention will yield
a clean baseline. Estimate effort only with a stated basis and assumptions.
Frame unverified causes as alternatives throughout, including under headings
such as "what it likely means"; a definitive diagnosis followed by caveats is
still a definitive diagnosis.

Assess readiness for a specific automation and its consequences. A report that
commits work based on inaccurate status has different prerequisites from a
read-only check that flags missing owners for human review. The latter still
requires usable inputs and may flag unrecorded owners rather than truly unowned
work. Neither a blanket readiness verdict nor a claim that data-quality checks
are independent of data quality follows from a few examples.

## Recommendation Catalog

Map common patterns to interventions:

| Pattern | Consider |
|---|---|
| Stale issues and unclear owners | triage ritual, ownership labels, aging report, project field cleanup |
| Review bottlenecks | CODEOWNERS review, PR size guidance, review rotation, flaky CI cleanup |
| Repeated status questions | weekly status workflow, leadership brief, project dashboard hygiene |
| Decisions lost in comments | decision log workflow, decision issue template, docs owner |
| Strategy/work mismatch | strategy alignment review, roadmap doc refresh, milestone cleanup |
| Launch surprises | launch readiness workflow, risk register, release checklist |
| Recurring incidents | incident review workflow, follow-up tracker, owner-based remediation report |
| Intake noise | intake template, priority definitions, duplicate detection, triage SLA |
| Messy tool topology | current-state map, systems-of-record decision, linking conventions |
| Automation not ready | pre-work checklist, source-material cleanup, pilot on one workflow |

When an intervention is an agentic workflow or repo operating artifact, hand off
to `non-coder-agentic-workflow-builder` or `agentic-workflows` as appropriate.
