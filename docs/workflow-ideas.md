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

### Operations

| # | Workflow | Description |
|---|---------|-------------|
| 2 | Unplanned Work Tracker | Detects mid-sprint scope creep, tracks ratio over time. |
| 6 | Stakeholder Feedback Synthesizer | Monthly synthesis of themes and sentiment from meeting notes. |
| 7 | Process Retirement Auditor | Finds stale templates, unused labels, zero-engagement workflows. |
| 8 | Cross-Team Dependency Radar | Surfaces conflicting timelines and blocked handoffs. |
| 10 | Change Adoption Monitor | 30/60/90-day adoption tracking for new processes. |
| 12 | Time Allocation Visibility | Reactive vs strategic work split analysis. |
| 19 | Framework/Ritual Sunset Reviewer | Audits meeting and ceremony engagement signals quarterly. |
| 21 | Action Item Tracker | Extracts action items from meeting transcripts, creates issues, follows up weekly on completion/abandonment. Feeds into prioritization rubric updates ("we never do X, stop assigning it"). |

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
| 18 | Stakeholder Narrative Generator | Data → audience-tailored status narratives. |
| 20 | Customer Value → Business Impact Linker | Connects shipping to revenue/cost signals. |
| 23 | Customer Feedback Aggregator | Multi-source feedback monitor: pulls from issues, discussions, Discord, Slack, and social into normalized feedback issues in one repo. Enables dedup, trend detection, and cross-channel prioritization. |
| 24 | Feedback → Work Item Converter | Slash command on a customer feedback issue that strips PII and customer-specific details, then creates a clean, agent-ready engineering issue. Bridges the PM interpretation gap. |

### Multiplayer — Shared Sensemaking

> Inspired by [John Cutler's multiplayer framing](https://cutlefish.substack.com/): workflows where understanding emerges from interaction, not just well-organized data. These move beyond "shared-context solo" (everyone in their own AI session with good shelves) into genuine multiplayer — interpretations travel, not just information.

| # | Workflow | Description |
|---|---------|-------------|
| M2 | Cross-Frame Translator | Same work viewed through PM, engineering, finance, and leadership lenses simultaneously. Each frame links back to the others. Enables Cutler's "multiple concurrent frames" without forcing one official model. |
| M3 | Tension Detector | Finds contradictions between stated strategy and active work. Posts a discussion inviting interpretation from multiple stakeholders — not a report, a prompt for shared sensemaking. |
| M4 | Decision Pre-Mortem Facilitator | When a decision is tagged, generates adversarial challenges and routes them to specific stakeholders for response before finalization. Extends Decision Log from recording → facilitating. |
| M5 | Context Bridge | When someone is mentioned on an unfamiliar issue, generates a personalized briefing based on their role, team, and recent work — not a generic summary but a frame-aware bridge. |
| M6 | Consistency Auditor | Applies Cutler's sharp/flexible/legible-variety framework. Flags where team practices have drifted from `docs/how-we-work.md` and asks whether drift is intentional or accidental. |
| M7 | Shared Learning Loop | After a launch, synthesizes outcomes vs. predictions across multiple contributors' prior comments. Surfaces who saw what coming and why — building collective pattern recognition. |
