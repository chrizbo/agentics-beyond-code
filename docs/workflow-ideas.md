# Workflow Ideas — PM, Ops, Compliance, and GTM

Ideas for agentic workflows beyond code. These are candidates for future
implementation as GitHub Agentic Workflows.

## Ideas

### PM & Strategy

| # | Workflow | Description |
|---|---------|-------------|
| 1 | Strategy-Execution Alignment Audit | Checks whether active work maps to stated strategic priorities. Flags orphaned initiatives. |
| 3 | Decision Log | ✅ **Built** — Detects decisions in issue comments, creates PR with markdown decision files. |
| 9 | Funding/Investment Review Prep | Generates quarterly portfolio ROI report for finance stakeholders. |
| 15 | Outcome vs Output Scorecard | Distinguishes shipping velocity from actual impact. Monthly scorecard. |

### Operations

| # | Workflow | Description |
|---|---------|-------------|
| 2 | Unplanned Work Tracker | Detects mid-sprint scope creep, tracks ratio over time. |
| 4 | Product Ops Health Dashboard | ✅ **Built** — Weekly agentic workflow health report with success rates, costs, cross-workflow interaction analysis, and recommendations. |
| 6 | Stakeholder Feedback Synthesizer | Monthly synthesis of themes and sentiment from meeting notes. |
| 7 | Process Retirement Auditor | Finds stale templates, unused labels, zero-engagement workflows. |
| 8 | Cross-Team Dependency Radar | Surfaces conflicting timelines and blocked handoffs. |
| 10 | Change Adoption Monitor | 30/60/90-day adoption tracking for new processes. |
| 12 | Time Allocation Visibility | Reactive vs strategic work split analysis. |
| 19 | Framework/Ritual Sunset Reviewer | Audits meeting and ceremony engagement signals quarterly. |

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

### GTM & Communication

| # | Workflow | Description |
|---|---------|-------------|
| 11 | Competitive Intelligence Digest | Weekly market/competitor intel rollup. |
| 18 | Stakeholder Narrative Generator | Data → audience-tailored status narratives. |
| 20 | Customer Value → Business Impact Linker | Connects shipping to revenue/cost signals. |

### Productivity & Knowledge

| # | Workflow | Description |
|---|---------|-------------|
| T1 | Transcript Processor | ✅ **Built** — Processes meeting transcripts, updates related issues. |
| PA | Process Analyzer | ✅ **Built** — Weekly retro + process analysis. Posts team retrospective discussion, detects transcript vs how-we-work drift, identifies automation candidates, creates update PRs. |

### Multiplayer — Shared Sensemaking

> Inspired by [John Cutler's multiplayer framing](https://cutlefish.substack.com/): workflows where understanding emerges from interaction, not just well-organized data. These move beyond "shared-context solo" (everyone in their own AI session with good shelves) into genuine multiplayer — interpretations travel, not just information.

| # | Workflow | Description |
|---|---------|-------------|
| M1 | Assumption Surfacer | Scans issues and PRs for implicit assumptions (timelines, user behavior, dependencies, capacity). Posts them as explicit questions on the issue, tagging relevant people for interpretation. Reasoning travels, not just data. |
| M2 | Cross-Frame Translator | Same work viewed through PM, engineering, finance, and leadership lenses simultaneously. Each frame links back to the others. Enables Cutler's "multiple concurrent frames" without forcing one official model. |
| M3 | Tension Detector | Finds contradictions between stated strategy and active work. Posts a discussion inviting interpretation from multiple stakeholders — not a report, a prompt for shared sensemaking. |
| M4 | Decision Pre-Mortem Facilitator | When a decision is tagged, generates adversarial challenges and routes them to specific stakeholders for response before finalization. Extends Decision Log from recording → facilitating. |
| M5 | Context Bridge | When someone is mentioned on an unfamiliar issue, generates a personalized briefing based on their role, team, and recent work — not a generic summary but a frame-aware bridge. |
| M6 | Consistency Auditor | Applies Cutler's sharp/flexible/legible-variety framework. Flags where team practices have drifted from `docs/how-we-work.md` and asks whether drift is intentional or accidental. |
| M7 | Shared Learning Loop | After a launch, synthesizes outcomes vs. predictions across multiple contributors' prior comments. Surfaces who saw what coming and why — building collective pattern recognition. |
