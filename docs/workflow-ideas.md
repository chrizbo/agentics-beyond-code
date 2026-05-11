# Workflow Ideas — PM, Ops, Compliance, and GTM

Ideas for agentic workflows beyond code. These are candidates for future
implementation as GitHub Agentic Workflows.

## Ideas

### PM & Strategy

| # | Workflow | Description |
|---|---------|-------------|
| 1 | Strategy-Execution Alignment Audit | Checks whether active work maps to stated strategic priorities. Flags orphaned initiatives. |
| 9 | Funding/Investment Review Prep | Generates quarterly portfolio ROI report for finance stakeholders. |
| 15 | Outcome vs Output Scorecard | Distinguishes shipping velocity from actual impact. Monthly scorecard. |
| 25 | Tension Detector | Finds contradictions between stated strategy and active work. Posts a discussion inviting interpretation from multiple stakeholders — not a report, a prompt for shared sensemaking. |
| 26 | ~~Decision Pre-Mortem Facilitator~~ | ~~When a decision is tagged, generates adversarial challenges and routes them to specific stakeholders for response before finalization. Extends Decision Log from recording → facilitating.~~ _Implemented as **[Adversarial PM](.github/workflows/adversarial-pm.md)** — weekly scan of recent decisions with grumpy, non-deterministic challenges posted on source issues._ |
| 27 | Shared Learning Loop | After a launch, synthesizes outcomes vs. predictions across multiple contributors' prior comments. Surfaces who saw what coming and why — building collective pattern recognition. |
| 31 | Bet Lifecycle Tracker | Scans issues tagged as bets and checks lifecycle completeness — hypothesis, metrics, targeted actionable inputs, one-pager artifact, learning review. Flags stale or disconnected bets weekly. |
| 32 | Actionable Input Review Prep | Before each biweekly review, gathers metric movement, related bet activity, new insights, and open questions per team. Posts a structured prep discussion so reviews focus on interpretation, not data assembly. |
| 33 | Goal Graph Health Monitor | Audits goals for orphaned goals (no linked bets or inputs), staleness (no updates in N weeks), missing metrics, and missing counterbalancing/guardrail companions. Periodic health report. |
| 34 | Learning Review Synthesizer | After bets complete, scans their learning review artifacts and synthesizes cross-bet patterns into a monthly Insight Brief. Identifies recurring themes so learnings don't stay siloed in individual bets. |
| 35 | Funding Model Reality Check | Quarterly comparison of declared funding models and team stages against actual work patterns. Flags drift — e.g., a "Growth Accelerator" team with no bets targeting growth metrics, or a "New Offerings" team with no experiments. |

### Operations

| # | Workflow | Description |
|---|---------|-------------|
| 2 | Unplanned Work Tracker | Detects mid-sprint scope creep, tracks ratio over time. |
| 6 | Stakeholder Feedback Synthesizer | Monthly synthesis of themes and sentiment from meeting notes. |
| 7 | Process Retirement Auditor | Finds stale templates, unused labels, zero-engagement workflows. |
| 8 | Cross-Team Dependency Radar | Surfaces conflicting timelines and blocked handoffs. |
| 10 | Change Adoption Monitor | 30/60/90-day adoption tracking for new processes. |
| 12 | Time Allocation Visibility | Reactive vs strategic work split analysis. |
| 19 | Framework/Ritual Sunset Reviewer | Audits meeting and ceremony engagement signals quarterly. See also: ritual cadence tracking built into the **Process Analyzer** workflow, which checks the Ritual Cadence table in `docs/how-we-work.md` weekly and reports status in the retro discussion. |
| 21 | Action Item Tracker | Extracts action items from meeting transcripts, creates issues, follows up weekly on completion/abandonment. Feeds into prioritization rubric updates ("we never do X, stop assigning it"). |
| 28 | Context Bridge | When someone is mentioned on an unfamiliar issue, generates a personalized briefing based on their role, team, and recent work — not a generic summary but a frame-aware bridge. |
| 29 | Consistency Auditor | Flags where team practices have drifted from `docs/how-we-work.md` and asks whether drift is intentional or accidental. |
| 36 | Team Health Checklist Auditor | For each team, checks whether the 8 POM basics are in place: charter/mission, strategy, models, roadmap of bets, bet artifacts, metrics & input targets, goals, and kickoff/learning review docs. Periodic health report. |
| 37 | Scope Ownership Auditor | Scans the scope registry for orphaned scopes (no team assigned), overlapping ownership, stale scopes (not referenced in recent bets), and scopes missing linked capabilities or customer context. |
| 38 | Cross-Team Collaboration Tracker | Analyzes cross-team mentions, shared labels, PR reviews across boundaries, and transcript references to surface actual collaboration patterns. Compares against declared Team Topology interaction modes and flags mismatches or friction. |
| 39 | Artifact Freshness Tracker | Checks key artifacts (product vision, strategy docs, roadmaps, bet one-pagers) against their expected refresh cadence — strategy yearly, roadmap quarterly, bet one-pagers monthly. Flags stale artifacts and missing required types. |

### AI Governance

| # | Workflow | Description |
|---|---------|-------------|
| 5 | AI Capability Maturity Tracker | Categorizes AI investments by speed/consistency/scale/skill. |
| 13 | AI Decision Accountability Tracker | Requires accountability entry for AI features shipping. |
| 16 | Expert Judgment Capture | Logs why humans override AI recommendations. |

### Compliance & Quality

| # | Workflow | Description |
|---|---------|-------------|
| 14 | Spec Completeness Gate | Blocks PRs without proper specs and acceptance criteria. |
| 17 | Scaling Readiness Assessment | Pre-flight check before feature expansion. |
| 22 | Cross-Team Intake Dispatcher | When a launch issue is created, auto-generates draft intake issues in downstream team repos (privacy, legal, GTM, responsible AI). Goes beyond reports by creating actual work items where compliance teams do their work. |

### GTM & Communication

| # | Workflow | Description |
|---|---------|-------------|
| 11 | Competitive Intelligence Digest | Weekly market/competitor intel rollup. |
| 18 | Stakeholder Narrative Generator | Data → audience-tailored status narratives. _Partially implemented by **[Leadership Briefs](.github/workflows/leadership-brief.md)** — generates per-leader briefs tailored to their domain and goals._ |
| 20 | Customer Value → Business Impact Linker | Connects shipping to revenue/cost signals. |
| 23 | Customer Feedback Aggregator | Multi-source feedback monitor: pulls from issues, discussions, Discord, Slack, and social into normalized feedback issues in one repo. Enables dedup, trend detection, and cross-channel prioritization. |
| 24 | Feedback → Work Item Converter | Slash command on a customer feedback issue that strips PII and customer-specific details, then creates a clean, agent-ready engineering issue. Bridges the PM interpretation gap. |
| 30 | Cross-Frame Translator | Same work viewed through PM, engineering, finance, and leadership lenses simultaneously. Each frame links back to the others — multiple concurrent frames without forcing one official model. _See **[Leadership Briefs](.github/workflows/leadership-brief.md)** for an initial implementation — each leader policy file creates a different "frame" on the same portfolio data._ |

