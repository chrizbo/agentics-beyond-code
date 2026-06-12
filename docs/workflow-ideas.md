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
| 26 | ~~Decision Pre-Mortem Facilitator~~ | ~~When a decision is tagged, generates adversarial challenges and routes them to specific stakeholders for response before finalization. Extends Decision Log from recording → facilitating.~~ _Implemented as **[Adversarial PM](../.github/workflows/adversarial-pm.md)** — weekly scan of recent decisions with grumpy, non-deterministic challenges posted on source issues._ |
| 27 | Shared Learning Loop | After a launch, synthesizes outcomes vs. predictions across multiple contributors' prior comments. Surfaces who saw what coming and why — building collective pattern recognition. |
| 31 | Bet Lifecycle Tracker | Scans issues tagged as bets and checks lifecycle completeness — hypothesis, metrics, targeted actionable inputs, one-pager artifact, learning review. Flags stale or disconnected bets weekly. |
| 32 | Actionable Input Review Prep | Before each biweekly review, gathers metric movement, related bet activity, new insights, and open questions per team. Posts a structured prep discussion so reviews focus on interpretation, not data assembly. |
| 33 | Goal Graph Health Monitor | Audits goals for orphaned goals (no linked bets or inputs), staleness (no updates in N weeks), missing metrics, and missing counterbalancing/guardrail companions. Periodic health report. |
| 34 | Learning Review Synthesizer | After bets complete, scans their learning review artifacts and synthesizes cross-bet patterns into a monthly Insight Brief. Identifies recurring themes so learnings don't stay siloed in individual bets. |
| 35 | Funding Model Reality Check | Quarterly comparison of declared funding models and team stages against actual work patterns. Flags drift — e.g., a "Growth Accelerator" team with no bets targeting growth metrics, or a "New Offerings" team with no experiments. |
| 44 | Consensus Brief | Before a major decision, synthesizes stakeholder positions, underlying interests, unresolved objections, and possible compromise paths. Produces a facilitation brief that helps the DRI converge the discussion without flattening disagreement. |
| 46 | Decision Readiness Verifier | Before a decision is finalized, checks whether the issue or RFC includes the problem statement, options considered, constraints, stakeholders consulted, risks, reversibility, and explicit owner for follow-through. |
| 47 | Tradeoff Translator | Converts a proposed plan into the team's stated "even over" tradeoff language, highlighting where the plan reinforces, bends, or contradicts documented strategy. |
| 48 | Ambiguous Data Decision Helper | When metrics or evidence conflict, prepares a decision brief that separates facts, assumptions, confidence levels, missing data, and judgment calls so leaders can make the hard call explicitly. |

### Calendar Intelligence

| # | Workflow | Description |
|---|---------|-------------|
| 67 | ~~Calendar Load Report~~ | ~~Weekly fragmentation score and deep work block analysis per contributor. Flags high meeting dispersion and days with zero 90-minute uninterrupted blocks.~~ _Implemented as **[Calendar Load Report](../.github/workflows/calendar-load-report.md)** — runs Friday alongside weekly-status; fixture-first, reads from `google-calendar-fixtures/week-sample.json` until `GOOGLE_OAUTH_REFRESH_TOKEN` is configured._ |
| 68 | ~~Calendar Strategy Audit~~ | ~~Classifies team calendar time against docs/strategy.md priorities, flags zero-coverage priorities, and surfaces drift between stated strategy and where time actually goes.~~ _Implemented as **[Calendar Strategy Audit](../.github/workflows/calendar-strategy-audit.md)** — runs Wednesday alongside strategy-alignment; updates `docs/calendar-audit.md` each week._ |
| 69 | ~~Meeting Prep Enrichment~~ | ~~Per-meeting briefs generated from GitHub artifacts and injected into Google Calendar event descriptions before meetings. Mode A uses explicit agenda; Mode B infers purpose from attendee activity when events are sparse.~~ _Implemented as an additional step in **[Daily Standup Prep](../.github/workflows/daily-standup-prep.md)** — generates briefs and writes them to Google Meet event descriptions (dry-run by default; set `CALENDAR_WRITE_ENABLED=true` to enable writes)._ |
| 70 | Post-Meeting Capture | After meetings, extract decisions, action items, and learnings from transcripts and route them to the right GitHub artifacts. Based on Meeting Bridges research (Wang et al. 2024) — five use cases: archive, task reminders, onboarding absent members, group sensemaking, and launching follow-on collaboration. |
| 71 | Passive Goal Reflection | Ambient AI signal during meetings showing whether discussion is on-track with the stated meeting goal. Based on arxiv 2025 paper — passive (non-intrusive) beats active (interruptive) for maintaining flow while improving focus. |

### Operations

| # | Workflow | Description |
|---|---------|-------------|
| 66 | ~~Chaos Monkey for Organizations~~ | ~~Detects organizational stasis and groupthink signals (participation concentration, process calcification, topic homogeneity, low alternatives analysis), then prescribes 2–3 calibrated disruptions to break the specific local maxima the team is stuck in. Purely advisory — outputs a discussion post.~~ _Implemented as **[Chaos Monkey](../.github/workflows/chaos-monkey.md)** — trigger manually when you want a stasis assessment; add a schedule once signal quality is validated._ |
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
| 40 | ~~Commitment Reconciler~~ | ~~Scans transcripts, issue comments, and project state for commitments that are promised but untracked, tracked but stale, completed but still open, or drifting from the latest conversation.~~ _Implemented as **[Commitment Reconciler](../.github/workflows/commitment-reconciler.md)** — weekly report that reconciles conversation commitments against GitHub artifacts._ |
| 41 | Stakeholder Relationship Nudge | Maintains lightweight stakeholder context from issues, meetings, and prior briefs. Nudges DRIs when a stakeholder has not been updated after a material change, when a prior concern has no follow-up, or when a meeting would benefit from resurfaced context. |
| 42 | Program Risk Early-Warning Radar | Combines stale issues/PRs, phase changes, missing sign-offs, date drift, blockers, dependency mentions, and transcript signals into an early-warning report before risks become obvious launch problems. |
| 43 | Manual PM Work Detector | Finds recurring low-judgment PM chores in transcripts, issues, and docs — status assembly, spreadsheet reshaping, reminder loops, repeated copy/paste updates — and opens automation-candidate issues with evidence and estimated time saved. |
| 49 | Board Reality Reconciler | Compares GitHub Project fields against recent comments, transcripts, labels, and child issue state to flag boards that have quietly drifted from reality. |
| 50 | Meeting Note Cleanup | Turns raw meeting transcripts into clean issue-linked notes with decisions, action items, open questions, risks, and unresolved follow-ups, then suggests where each note should live. |
| 51 | Dependency Map Inference | Infers cross-team and cross-launch dependencies from issue links, comments, transcripts, labels, and shared assignees. Posts a weekly map of hidden dependency chains and risky handoffs. |
| 63 | Zoom Transcript Fetcher | Polls the Zoom API every ~2 hours for new recordings from meetings listed in `docs/how-we-work.md` (each meeting has a Zoom Meeting ID field). Downloads `.vtt` transcripts and commits them to `/transcripts/` on main, which triggers the existing Transcript Processor workflow. Uses repo memory to track already-imported recording IDs. Implemented as a plain GitHub Actions workflow (not an AW) since the work is deterministic plumbing. See [decision record](../decisions/2026-06-01-zoom-transcript-fetcher-design.md) for architecture choices. |
| 52 | Cognitive Load Balancer | Scans assignment patterns, meeting references, review requests, and blocker ownership to identify overloaded people or teams before their work becomes a program bottleneck. |
| 53 | Escalation Timing Advisor | Flags situations where a PM should switch from async tracking to synchronous escalation because ambiguity, delay, or stakeholder tension is becoming expensive. |
| 54 | Stakeholder Context Brief | Before stakeholder syncs, generates a short prep note with last interaction, open asks, recent changes, prior concerns, and recommended discussion focus. |
| 55 | Social Capital Gap Detector | Looks for launches or dependencies that rely on teams with little recent interaction, then recommends relationship-building check-ins before a favor or escalation is needed. |
| 63 | ~~Slack Context Processor~~ | ~~Pulls context from allowed Slack channels and threads for linked GitHub artifacts, then summarizes high-confidence decisions, blockers, commitments, and open questions back onto the relevant issue.~~ _Implemented as **[Slack Context Processor](../.github/workflows/slack-context-processor.md)** — fixture-first Slack integration MVP that matches Slack-shaped JSON fixtures to open issues and posts summarized context comments._ |
| 64 | ~~Slack Reaction Intake~~ | ~~Treats configured emoji reactions in allowed Slack channels as lightweight automation signals, such as creating intake issues, flagging blockers, or capturing decision candidates with source permalinks.~~ _Implemented as **[Slack Reaction Intake](../.github/workflows/slack-reaction-intake.md)** — fixture-first MVP that creates labeled GitHub intake issues from `:inbox_tray:` reactions._ |
| 65 | External Integration Health Monitor | Audits external tool integrations for stale credentials, noisy channels, duplicate post-backs, missed events, and unsafe write attempts. See [External Integration Patterns](external-integration-patterns.md). |

### AI Governance

| # | Workflow | Description |
|---|---------|-------------|
| 5 | AI Capability Maturity Tracker | Categorizes AI investments by speed/consistency/scale/skill. |
| 13 | AI Decision Accountability Tracker | Requires accountability entry for AI features shipping. |
| 16 | Expert Judgment Capture | Logs why humans override AI recommendations. |
| 56 | AI Use Boundary Reviewer | Reviews proposed automation or AI-generated drafts for areas where human judgment, sensitive relationships, personnel context, or political nuance should remain explicitly human-owned. |
| 57 | AI Output Verification Checklist | For AI-generated reports, briefs, and issue updates, checks whether claims are linked to source artifacts, flags unsupported assertions, and asks for human verification where evidence is thin. |
| 58 | Prompt Quality Coach | Reviews workflow prompts, issue descriptions, and requirements docs for specificity, acceptance criteria, context, constraints, and verification instructions. |

### Compliance & Quality

| # | Workflow | Description |
|---|---------|-------------|
| 14 | Spec Completeness Gate | Blocks PRs without proper specs and acceptance criteria. |
| 17 | Scaling Readiness Assessment | Pre-flight check before feature expansion. |
| 22 | Cross-Team Intake Dispatcher | When a launch issue is created, auto-generates draft intake issues in downstream team repos (privacy, legal, GTM, responsible AI). Goes beyond reports by creating actual work items where compliance teams do their work. |
| 59 | Evidence Coverage Auditor | Checks reports, decision records, compliance reviews, and status updates for claims that lack source links, dated evidence, or clear confidence levels. |

### GTM & Communication

| # | Workflow | Description |
|---|---------|-------------|
| 11 | Competitive Intelligence Digest | Weekly market/competitor intel rollup. |
| 18 | Stakeholder Narrative Generator | Data → audience-tailored status narratives. _Partially implemented by **[Leadership Briefs](../.github/workflows/leadership-brief.md)** — generates per-leader briefs tailored to their domain and goals._ |
| 20 | Customer Value → Business Impact Linker | Connects shipping to revenue/cost signals. |
| 23 | Customer Feedback Aggregator | Multi-source feedback monitor: pulls from issues, discussions, Discord, Slack, and social into normalized feedback issues in one repo. Enables dedup, trend detection, and cross-channel prioritization. |
| 24 | Feedback → Work Item Converter | Slash command on a customer feedback issue that strips PII and customer-specific details, then creates a clean, agent-ready engineering issue. Bridges the PM interpretation gap. |
| 30 | Cross-Frame Translator | Same work viewed through PM, engineering, finance, and leadership lenses simultaneously. Each frame links back to the others — multiple concurrent frames without forcing one official model. _See **[Leadership Briefs](../.github/workflows/leadership-brief.md)** for an initial implementation — each leader policy file creates a different "frame" on the same portfolio data._ |
| 45 | Audience-Specific Narrative Rewriter | Takes one canonical status source and rewrites it for specific audiences such as executives, engineering, GTM, compliance, or customers while preserving links back to the same source artifacts. |
| 60 | Executive Translation Draft | Converts engineering-heavy updates into executive-ready language focused on customer impact, risk, tradeoffs, timeline, and what leadership should do next. |
| 61 | Weekly Status First Draft | Builds a first-draft weekly status narrative from commits, merged PRs, issue movement, comments, decisions, and transcripts so PMs edit for "so what" instead of assembling the "what." |
| 62 | Message Tone Retargeter | Takes a single update and adapts it for different stakeholder relationships and channels while preserving factual consistency and avoiding over-automation of sensitive messages. |
