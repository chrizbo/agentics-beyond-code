# How It Works

Agentics Beyond Code uses [GitHub Agentic Workflows](https://githubnext.com/projects/agentic-workflows/) to automate launch tracking, health monitoring, and compliance checks for non-engineering roles. Here's how the system fits together.

## Sample Output

Browse real artifacts produced by the workflows in this repo:

| Type | Example | Produced by |
|------|---------|-------------|
| 📋 Initiative | [Expand to EU Market](https://github.com/chrizbo/agentics-beyond-code/issues/1) | Sample Data Simulator |
| 🚀 Launch | [API Rate Limiting & Throttling](https://github.com/chrizbo/agentics-beyond-code/issues/93) | Sample Data Simulator |
| 🛡️ Compliance sub-issue | [Security Compliance Review — EU Payment Methods](https://github.com/chrizbo/agentics-beyond-code/issues/83) | Compliance Review |
| 🛡️ Compliance status table | [Status table comment](https://github.com/chrizbo/agentics-beyond-code/issues/4#issuecomment-4411223864) | Compliance Review |
| 📣 GTM sub-issue | [Changelog draft — EU Payment Methods](https://github.com/chrizbo/agentics-beyond-code/issues/77) | GTM Content |
| 📋 Decision log | [Decision Log — 2026-05-09](https://github.com/chrizbo/agentics-beyond-code/issues/87) | Decision Log |
| 🔍 Assumptions | [Assumptions comment](https://github.com/chrizbo/agentics-beyond-code/issues/93#issuecomment-4413916898) | Assumption Surfacer |
| 📊 Launch readiness report | [Launch Readiness Report — 2026-05-09](https://github.com/chrizbo/agentics-beyond-code/discussions/76) | Launch Readiness |
| 📊 Weekly status | [Week of 2026-05-04](https://github.com/chrizbo/agentics-beyond-code/discussions/86) | Weekly Status |
| 📊 Leadership brief | [Alex Chen — Week of 2026-05-11](https://github.com/chrizbo/agentics-beyond-code/discussions/112) | Leadership Briefs |
| 📊 Compliance team report | [Security Review Status — Week of 2026-05-04](https://github.com/chrizbo/agentics-beyond-code/discussions/88) | Compliance Team Reports |
| 📊 GTM team report | [Go-to-Market Readiness — Week of 2026-05-04](https://github.com/chrizbo/agentics-beyond-code/discussions/105) | GTM Team Reports |
| 📊 Workflow health | [Week of 2026-05-04](https://github.com/chrizbo/agentics-beyond-code/discussions/106) | Workflow Health |
| 🔄 Weekly retro | [Week of 2026-05-04](https://github.com/chrizbo/agentics-beyond-code/discussions/104) | Process Analyzer |
| 🧭 Strategy evidence | [Strategy alignment PR](https://github.com/chrizbo/agentics-beyond-code/pull/107) | Strategy Alignment |
| 🎙️ Transcript comment | [Meeting notes on issue](https://github.com/chrizbo/agentics-beyond-code/issues/14#issuecomment-4413622565) | Transcript Processor |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Project                           │
│                   "Launch Tracker"                          │
│                                                             │
│  Issues with custom fields (Phase, Target Date, Risk, etc.) │
│  organized as: Initiative → Launch → Epic → Task            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ GraphQL API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Pre-Step: fetch-launch-data.sh                 │
│                                                             │
│  Deterministic script that fetches all project items,       │
│  custom field values, and walks sub-issue trees.            │
│  Outputs structured JSON for the agent to consume.          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ launch-data.json
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Agentic Workflow (AI Agent)                     │
│                                                             │
│  Reads launch-data.json + policy files.                     │
│  Applies readiness criteria, risk scoring, quality checks.  │
│  Generates a structured report.                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ safe-outputs
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Discussion / Issue                       │
│                                                             │
│  Weekly readiness report with pipeline summary,             │
│  per-launch status, risk breakdown, sign-off tracking.      │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Issues as the source of truth

Everything lives in GitHub Issues and Projects. A launch is an issue. Progress is measured by sub-issue completion. Metadata lives in labels and custom fields. There are no external tools, databases, or dashboards — GitHub is the single source of truth.

### 2. Three user personas

The system serves three audiences with different needs from the same data:

| Persona | What they care about | How they use the system |
|---------|---------------------|------------------------|
| **DRIs (PMs)** | Their launch's status, blockers, what needs action | Create/manage launch issues, read readiness reports |
| **Downstream teams** | Which launches need their sign-off | Watch for `ai:needs:{domain}` labels, review domain sections in reports |
| **Leaders** | Pipeline health, which launches are at risk | Read the executive summary and risk breakdown |

### 3. Issue hierarchy: Initiative → Launch → Epic → Task

Sub-issues provide the structure. Each level maps to an organizational concern:

- **Initiatives** — strategic goals owned by leaders (e.g., "Expand to EU market")
- **Launches** — shippable milestones owned by DRIs (e.g., "GDPR data export")
- **Epics** — workstreams, often owned by domain teams (e.g., "Security review")
- **Tasks** — individual work items (e.g., "Implement export API endpoint")

Workflows anchor on **launches** and walk the tree downward to assess readiness.

### 4. Phases are customer-access milestones

Phases describe who can access the feature, not internal engineering stages:

| Phase | Who has access |
|-------|---------------|
| **Team** | Internal team only |
| **Alpha** | Hand-selected users / dogfood |
| **Beta** | Broader opt-in audience |
| **GA** | All customers |

This framing keeps the language meaningful to all three personas and makes phase transitions observable risk signals (e.g., moving to Beta without a security sign-off).

### 5. Separation of workflows and policies

Workflows define the **general pattern** (e.g., "assess readiness against a policy"). Policy files define the **team-specific rules** (e.g., "readiness means security approved + docs updated").

```
.github/
  workflows/
    launch-readiness.md              ← Readiness assessment (weekly)
    compliance-review.md             ← Compliance triage + sub-issues (weekly + on label)
    compliance-team-reports.md       ← Per-team compliance digests (weekly)
    gtm-content.md                   ← Changelog drafts + roadmap items (weekly)
    weekly-status.md                 ← Leadership status rollup (weekly)
    leadership-brief.md              ← Personalized leadership briefs (weekly, one per leader)
    workflow-health.md               ← Agentic workflow health & cost report (weekly)
    decision-log.md                  ← Decision detection + PR creation (daily)
    transcript-processor.md          ← Transcript → issue comments (on push)
    process-analyzer.md              ← Weekly retro + process drift detection + automation candidates
    intake-triage.md                 ← Intake request triage with RICE/Kano scoring (on label)
  ISSUE_TEMPLATE/
    intake.yml                       ← Intake request template for features and bugs
  policies/
    launch-readiness-policy.md       ← Readiness thresholds & risk scoring
    weekly-status-policy.md          ← Status sections, bullet format & audience
    leadership-brief-alex-chen.md    ← Leadership brief persona (VP Platform Engineering)
    leadership-brief-priya-sharma.md ← Leadership brief persona (GPM Growth & Monetization)
    security-review-policy.md        ← Security rubric & review questions
    privacy-review-policy.md         ← Privacy rubric & review questions
    accessibility-review-policy.md   ← Accessibility rubric & review questions
    responsible-ai-review-policy.md  ← Responsible AI rubric & review questions
    voice-and-tone-policy.md         ← How we write customer-facing content
  scripts/
    fetch-launch-data.sh             ← Deterministic data fetching (shared)
decisions/                           ← Decision records (created by decision-log workflow)
docs/
  how-we-work.md                     ← Team processes & norms (updated by process-analyzer workflow)
transcripts/                         ← Meeting transcripts (.txt, .vtt) — drop files here
```

This means:
- Teams adopt workflows without forking — just edit policy files
- Policy changes take effect immediately (no recompilation)
- Compliance teams own their policy files independently
- Auditors can review policies as plain markdown

### 6. Deterministic pre-steps for structured data

Agentic workflows are great at reasoning but unreliable at complex API pagination and data assembly. The `fetch-launch-data.sh` script handles the deterministic work:

- Fetches all project items via GitHub's GraphQL API
- Resolves custom field values (Phase, Target Date, etc.)
- Recursively walks sub-issue trees to any depth
- Outputs clean JSON the agent can reliably parse

This pattern — **deterministic script for data, agent for analysis** — is reusable across all workflows in this repo.

### 7. Labels distinguish agent-created content

Issues and sub-issues created by agentic workflows carry `ai:`-prefixed labels
(`ai:compliance-review`, `ai:gtm`, etc.) so they can be filtered from feature
work. Discussions use descriptive title prefixes like `[Launch Readiness]`
or `[Compliance]`.

### 8. Reports as discussions

Readiness reports are posted as GitHub Discussions (not issues) to avoid cluttering the issue tracker. Previous reports are automatically closed when a new one is created, keeping only the latest active.

## Metadata Strategy

### Labels — automation state flags

| Label | Purpose |
|-------|---------|
| `launch` | Marks an issue as a launch |
| `blocker` | Flags a blocking issue |
| `at-risk` | Applied when a launch is at risk |
| `ai:needs:{domain}` | Flags that a domain team's input is required (added by workflow) |
| `approved:{domain}` | Domain sign-off granted (added by humans) |
| `ready-for-review` | Ready for domain team review |
| `ai:compliance-review` | Applied to compliance review sub-issues (distinguishes them from feature work) |
| `ai:gtm` | Applied to GTM content sub-issues (changelog drafts, roadmap items) |
| `ai:meeting-discussed` | Applied to issues discussed in a meeting transcript |
| `ai:process-update` | Applied to PRs updating `docs/how-we-work.md` from transcript analysis |
| `ai:automation-candidate` | Applied to issues proposing automation of a manual process |
| `triage-needed` | Marks an issue for automated triage (applied by intake issue template) |
| `triaged` | Triage complete — RICE and Kano scores applied |
| `needs-more-info` | Intake request is incomplete — bot has asked follow-up questions |
| `duplicate` | Duplicate of an existing issue |
| `rice:high` / `rice:medium` / `rice:low` | RICE score level |
| `kano:must-be` / `kano:one-dimensional` / `kano:attractive` / `kano:indifferent` | Kano classification |
| `aligns-with-current` | Request aligns with an active initiative or launch |

### Custom Fields — structured project data

| Field | Type | Purpose |
|-------|------|---------|
| Phase | Single select | Team, Alpha, Beta, GA |
| Target Date | Date | Expected ship date |
| Launch Type | Single select | Major, Minor, Patch, Internal |
| Risk Level | Single select | Low, Medium, High, Critical |

**Intake Triage project** (`projects/2`):

| Field | Type | Purpose |
|-------|------|---------|
| Status | Single select | Needs Triage (default), Needs More Info, Triaged, Duplicate, Accepted, Deferred |
| RICE Score | Text | Numeric RICE score |
| Request Type | Single select | Feature Request, Bug Report |
| Kano Category | Single select | Must-be, One-dimensional, Attractive, Indifferent |
| RICE Level | Single select | High, Medium, Low |

## Compliance Review System

The compliance review system ensures every launch gets evaluated by the right
compliance teams before shipping. It consists of two workflows and four policy files.

### How it works

1. **Compliance Review workflow** (`compliance-review.md`) evaluates each launch
   against four compliance rubrics — Security, Privacy, Accessibility, and
   Responsible AI. For each launch it:
   - Reads the rubric from the corresponding policy file
   - Determines whether a review is needed based on launch content
   - Adds/removes `ai:needs:{team}` labels on the launch issue
   - Posts a compact compliance status table as a comment on the launch
   - Creates **compliance review sub-issues** under the launch for each team
     that needs a review, pre-filled with tailored review questions, checklists,
     and context inferred from the launch
   - Updates existing open sub-issues in place when the launch changes

2. **Compliance Team Reports workflow** (`compliance-team-reports.md`) generates
   a weekly discussion for each compliance team showing:
   - Launches needing their review, sorted by urgency
   - Context on *why* each launch needs review
   - Links to the review sub-issues
   - Summary metrics (pending, in-progress, critical)

### Compliance review sub-issues

When a review is needed, the workflow creates a sub-issue under the launch
titled `[{Team}] Compliance Review — {Launch Title}`. These sub-issues:
- Are labeled `ai:compliance-review` + `ai:needs:{team}` so they can be filtered
- Contain the review questions from the policy file, pre-filled where possible
- Include a checklist and findings table for the reviewer
- Are assignable to the reviewer from the compliance team
- Track review lifecycle: open → assigned → closed → `approved:{team}` on parent

### Policy files

Each compliance team owns a policy file that defines:

| File | Team | Contents |
|------|------|----------|
| `security-review-policy.md` | 🔒 Security | Threat modeling, auth, data protection, dependency scanning |
| `privacy-review-policy.md` | 🔏 Privacy | Data inventory, user rights, tracking, third-party processors |
| `accessibility-review-policy.md` | ♿ Accessibility | WCAG conformance, keyboard nav, screen readers, visual design |
| `responsible-ai-review-policy.md` | 🤖 Responsible AI | Fairness, transparency, human oversight, safety |

Each file has three sections:
1. **Rubric** — criteria for when a review is/isn't needed
2. **Review Questions** — domain-specific questions the DRI must answer
3. **Review Checklist** — verification items for the reviewer

Teams can edit their policy file at any time — changes take effect on the next
workflow run without recompilation.

## GTM Content System

The GTM (go-to-market) system generates customer-facing content drafts as
sub-issues under each launch, so DRIs don't have to start from scratch when
it's time to announce a feature or update the public roadmap.

### How it works

The **GTM Content workflow** (`gtm-content.md`) runs weekly and:

1. Evaluates each open launch's phase, scope, and content
2. Creates two sub-issues per launch (when appropriate):
   - **📣 Changelog draft** — a customer-facing announcement post (Alpha+ only)
   - **🗺️ Roadmap item** — a forward-looking description for public roadmaps (all phases)
3. Updates existing sub-issues in place when the launch changes significantly
   (phase transition, major scope change, target quarter shift)
4. Roadmap items show only a **quarter** for expected availability — never
   specific dates or internal status

All content follows the **voice & tone policy** (`voice-and-tone-policy.md`),
which defines the org's writing style: friendly, benefit-led, specific, and
jargon-free.

### GTM sub-issues

Sub-issues are titled `[GTM] Changelog draft — ...` and `[GTM] Roadmap item — ...`
and labeled `ai:gtm` so they're filterable. They contain:
- A full draft written in the org's voice
- Specifics pulled from the launch body, epics, and sub-issues
- Clear markers that it's a draft needing DRI review before publishing

### Voice & tone policy

The policy at `.github/policies/voice-and-tone-policy.md` defines:
- Core writing principles (human, benefit-led, specific, brief)
- Tone guidance per content type (changelog vs. roadmap)
- Formatting rules (sentence case, active voice, present/future tense)
- Words to use and avoid

## Weekly Leadership Status

The weekly status system produces a single discussion post that gives leaders
a fast, scannable view of portfolio health — without reading individual issues.

### How it works

The **Weekly Status workflow** (`weekly-status.md`) runs weekly and:

1. Loads all initiatives, launches, epics, and tasks from the pre-fetched data
2. Identifies activity from the previous 7 days (state changes, phase transitions,
   new issues, label changes, comments)
3. Categorizes each notable item into one of four sections
4. Generates a single discussion post with a portfolio snapshot

### Report sections

| Section | Purpose | Example |
|---------|---------|---------|
| 🚀 **What Shipped** | Launches that reached GA, advanced phases, or completed milestones | "GDPR Data Export launched to GA" |
| 🧠 **What We Learned** | Insights from retros, experiments, compliance findings, or decisions | "Beta feedback showed 40% of users need bulk export" |
| 📢 **FYI** | Awareness items — date changes, new launches, scope shifts, approvals | "EU Expansion target moved from Q3 to Q4" |
| 🆘 **SOS** | Items needing leadership attention — blockers, missing approvals, risk | "Payments v2 blocked on legal review, no assignee" |

Each item follows a consistent bullet format:
```
* [Launch Title](url) - One sentence summary.
```

### Status policy

The policy at `.github/policies/weekly-status-policy.md` defines:
- Rules for what qualifies in each section
- Severity ordering for SOS items
- Tone and voice guidelines (concise, specific, action-oriented)
- The 7-day reporting window
- Audience expectations (celebrate, inform, escalate)

Leaders can customize the policy to adjust what surfaces in each section
without modifying the workflow itself.

## Leadership Briefs

The leadership brief system turns the weekly status **push** into a
personalized **pull** — one brief per leader, tailored to their domain,
quarterly goals, and management style.

### How it works

The **Leadership Brief workflow** (`leadership-brief.md`) runs Monday
mornings and:

1. Discovers all `.github/policies/leadership-brief-*.md` files at runtime
2. Loads the shared portfolio data (same `launch-data.json` as other workflows)
3. For each leader policy file, filters the portfolio to that leader's scope
4. Evaluates activity against that leader's quarterly goals
5. Generates one discussion per leader with personalized content

### Three action sections

| Section | Purpose | Example |
|---------|---------|---------|
| 🎉 **Give Kudos** | Recognition-worthy accomplishments — name the person, the achievement, and the goal it advances | "Platform Core squad shipped the auth migration 3 days early — directly advances the v3 API goal" |
| 💬 **Give Feedback** | Items worth a coaching conversation — framed as curiosity, not criticism | "Scope on Launch X expanded by 4 sub-issues without an updated timeline — worth checking in on" |
| 🚨 **Get Involved** | Pre-escalation — where the leader's intervention this week prevents a bigger problem | "Security review for billing launch is 5 days overdue — schedule 30 min with Security team to unblock" |

Each brief also includes a **Quarterly Goal Tracker** (status per goal
with weekly evidence) and a **Suggested Actions** checklist.

### Policy-driven personalization

Each leader gets a policy file that defines only what's unique to them:

```
.github/policies/
  leadership-brief-alex-chen.md       ← VP Platform Engineering
  leadership-brief-priya-sharma.md    ← GPM Growth & Monetization
```

A policy file contains:

| Section | What it defines |
|---------|----------------|
| **Persona** | Role, scope, reporting structure, squads |
| **Strategic Goals** | Quarterly goals with success metrics |
| **Kudos criteria** | What this leader considers worth celebrating |
| **Feedback criteria** | What patterns this leader wants to catch early |
| **Pre-Escalation criteria** | What situations need this leader's involvement |
| **Weekly Rhythm** | How the leader uses the brief in their week |
| **Leader-specific sensitivity** | Additional sensitivity rules beyond defaults |

General guidelines that apply to all leaders (tone, sensitivity defaults,
reporting window) live in the workflow itself — not in policy files.

### Adding a new leader

To add a brief for a new leader:

1. Create `.github/policies/leadership-brief-{name}.md` following the
   pattern of existing policies
2. Define their persona, squads, quarterly goals, and section criteria
3. The next Monday run will automatically discover and include them

No workflow changes or recompilation needed — the workflow discovers
policies at runtime.

### Relationship to Weekly Status

The **Weekly Status** (Friday) is a portfolio-wide push: "here's what
happened." The **Leadership Brief** (Monday) is a personalized pull:
"here's what *you* should do about it." They share the same data source
but serve different purposes:

| | Weekly Status | Leadership Brief |
|---|---|---|
| **When** | Friday | Monday |
| **Audience** | All leaders | One specific leader |
| **Scope** | Entire portfolio | Filtered to leader's domain |
| **Framing** | What happened | What to do about it |
| **Sections** | Shipped, Learned, FYI, SOS | Kudos, Feedback, Get Involved |

---

## Operations

### Workflow Health Report

The workflow health report gives the team visibility into how the agentic
workflows themselves are performing — success rates, failure patterns, cost
estimates, cross-workflow interaction analysis, and actionable recommendations.

#### How it works

The **Workflow Health workflow** (`workflow-health.md`) runs weekly and:

1. Identifies all agentic workflows (`.md` files in `.github/workflows/`)
2. Runs a deterministic pre-step to fetch the last 7 days of Actions data for
   each compiled `.lock.yml` workflow
3. Calculates success rates, average durations, and trigger breakdowns
4. Estimates costs based on runner minutes and observed OpenAI token usage
5. Assigns a health status to each workflow (🟢 Healthy → 🔴 Critical)
6. Analyzes cross-workflow interactions — temporal overlaps, shared resource conflicts, and cascade chains
7. Generates recommendations for efficiency, reliability, cost optimization, and conflict resolution

#### Health status levels

| Status | Criteria |
|--------|----------|
| 🟢 Healthy | Success rate ≥ 90%, no recurring failures |
| 🟡 Needs Attention | Success rate 70–89%, or occasional failures |
| 🟠 Degraded | Success rate 50–69%, or recurring failure pattern |
| 🔴 Critical | Success rate < 50%, or completely non-functional |
| ⚪ Inactive | No runs in the last 7 days |

#### Report sections

The discussion includes:
- **Overall Health Summary** — table of all workflows with run counts, success rates, durations, and health status
- **Critical & Degraded Workflows** — details on failing workflows with run links and investigation suggestions
- **Cost Summary** — runner minutes, observed token runs, and estimated OpenAI cost per workflow
- **Cross-Workflow Interactions** — concurrent run detection, shared resource conflicts (issues/labels modified by multiple workflows), cascade chain mapping (one workflow triggering another), and risk assessment (🔴 high / 🟡 medium / 🟢 low)
- **Recommendations** — specific, data-backed suggestions for efficiency, reliability, cost optimization, and cross-workflow conflict resolution

#### What it doesn't need

Unlike most other workflows in this repo, the Workflow Health report does **not**
use the `fetch-launch-data.sh` pre-step or read from GitHub Projects. It works
entirely from GitHub Actions run data via the `gh` CLI. The pre-step writes
`workflow-health-data-summary.json` for the agent to read first and
`workflow-health-data.json` for targeted drill-downs only.

## Decision Log System

The decision log system captures decisions as they happen — from issue comments
and meeting transcripts — so they don't get lost in conversation threads.

### How it works

The **Decision Log workflow** (`decision-log.md`) runs daily on weekdays near end of day (~midnight PT) and:

1. Scans recent issue comments across all initiatives, launches, epics, and tasks
   for decision signals (e.g., "we decided to…", "the call is…", "going with option…")
2. Reads any `.txt` or `.vtt` files in the `/transcripts/` directory for decision
   language in meeting recordings
3. For each decision found, creates a structured markdown record capturing:
   - The decision itself and its rationale
   - Options that were considered
   - Who was involved and when it was made
   - Links back to the source (issue comment or transcript)
4. Opens a PR adding the new decision files to `/decisions/` for review

### Decision record format

Each decision is stored as an individual markdown file at
`decisions/YYYY-MM-DD-<slug>.md` with structured frontmatter and sections
for context, options considered, rationale, and consequences.

### Integration with other workflows

The Weekly Status workflow can reference recent decisions in its
"What We Learned" section. The Compliance Review workflow can flag
decisions that have compliance implications.

## Transcript Processing System

The transcript processing system bridges the gap between meetings and
your issue tracker, ensuring action items and discussions don't get lost.

### How it works

The **Transcript Processor workflow** (`transcript-processor.md`) triggers
whenever `.txt` or `.vtt` files are pushed to the `/transcripts/` directory:

1. Parses the transcript file, handling both plain text and WebVTT formats
2. Extracts key topics: decisions, action items, status updates, blockers,
   and questions
3. Searches open issues for matches based on titles, labels, and content
4. Posts structured comments on matched issues summarizing the relevant
   portions of the meeting
5. Adds an `ai:meeting-discussed` label to issues that were discussed

### Transcript file conventions

- Drop `.txt` or `.vtt` files into the `/transcripts/` directory
- Name files descriptively (e.g., `2025-06-20-sprint-planning.vtt`)
- The workflow processes all new files in each push

## Intake Triage System

The intake triage system provides a structured process for evaluating incoming
feature requests and bug reports before they enter the product backlog. It uses
RICE and Kano scoring frameworks, strategy alignment checks, and duplicate
detection to help teams prioritize effectively.

### How it works

1. A user creates an issue using the **Intake Request** template (`.github/ISSUE_TEMPLATE/intake.yml`),
   which auto-applies the `triage-needed` label
2. The **Intake Request Triage workflow** (`intake-triage.md`) triggers on the label event and:
   - Reads the issue body, strategy doc, and current initiatives/launches
   - **Checks for completeness** — if key fields are missing (who is affected, problem statement),
     it labels the issue `needs-more-info` and posts a comment asking for the missing details
   - **Scores with RICE** — Reach × Impact × Confidence ÷ Effort, applying labels like `rice:high`
   - **Classifies with Kano** — Must-be, One-dimensional, Attractive, or Indifferent
   - **Checks strategy alignment** — compares against `docs/strategy.md` tradeoffs
   - **Detects duplicates** — searches for similar existing issues
   - **Assesses current work overlap** — checks whether the request aligns with active
     initiatives or launches and applies `aligns-with-current` if so
   - **Posts a structured triage comment** with all scores, rationale, and recommendations
   - **Adds the item to the Intake Triage project board** (`projects/2`) with status and field values

### Intake Triage project board

The triage system uses a **separate project board** (`projects/2`) from the main
Launch Tracker (`projects/1`). This keeps unvetted requests out of the sprint
backlog until they've been reviewed and accepted.

| Status | Meaning |
|--------|---------|
| **Needs Triage** (default) | New items awaiting automated or manual triage |
| **Needs More Info** | Submission is incomplete — bot has posted follow-up questions |
| **Triaged** | Fully scored with RICE and Kano, strategy alignment assessed |
| **Duplicate** | Duplicate of an existing issue |
| **Accepted** | Accepted into the product backlog |
| **Deferred** | Not prioritized now — will revisit later |

> **Tip:** Set "Needs Triage" as the default status value in the project settings
> so items always appear in views even if the workflow fails to set a status.

### RICE scoring

| Factor | How it's assessed |
|--------|------------------|
| **Reach** | Users/quarter affected, inferred from "Who is affected" field |
| **Impact** | 0.25 (minimal) to 3 (massive), based on severity and breadth |
| **Confidence** | 50–100%, based on specificity of the request |
| **Effort** | Person-months, estimated from solution complexity |

The workflow applies `rice:high` (score ≥ 1000), `rice:medium` (100–999), or `rice:low` (< 100).

### Kano classification

| Category | Description |
|----------|-------------|
| **Must-be** | Expected features — users are dissatisfied without them (e.g., bug fixes, security) |
| **One-dimensional** | Satisfaction scales linearly with implementation quality |
| **Attractive** | Unexpected delighters — absence doesn't cause dissatisfaction |
| **Indifferent** | Users don't care either way |

### Interaction with other workflows

- **Assumption Surfacer** skips issues with the `triage-needed` label (prompt-level guard)
  to avoid surfacing assumptions on unvetted requests
- **Compliance Review** uses a `labels:` filter that only activates on `launch`/`needs:*`
  labels, so triage label events are skipped before the agent starts
- The triage workflow uses `skip-bots: [github-actions]` is not needed here since the
  workflow only triggers on label events, but other workflows use it to prevent
  feedback loops from bot-authored comments

## Workflow Schedule

Most portfolio workflows share the same `fetch-launch-data.sh` pre-step for
data fetching. The compiled `.lock.yml` files are the source of truth for the
actual GitHub Actions triggers.

| Workflow | Trigger | Output | Audience |
|----------|---------|--------|----------|
| **Leadership Briefs** | Monday ~7:30 AM PT (`54 14 * * 1`) · Manual | One discussion per leader with kudos, feedback, and pre-escalation | Individual leaders |
| **GTM Team Reports** | Monday ~8 AM PT (`19 14 * * 1`) · Manual | Discussion summarizing launches needing GTM action | GTM team |
| **Compliance Review** | Monday ~8 AM PT (`26 15 * * 1`) · Issue labeled `launch`, `needs:security`, `needs:privacy`, `needs:accessibility`, or `needs:responsible-ai` · Manual | Labels on launches, status table comment, compliance review sub-issues | DRIs, compliance teams |
| **GTM Content** | Monday ~8:15 AM PT (`33 15 * * 1`) · Manual | Changelog draft and roadmap item sub-issues per launch | DRIs, marketing, comms |
| **Launch Readiness** | Monday ~8:30 AM PT (`7 15 * * 1`) · Manual | Discussion with pipeline summary, risk breakdown, sign-off tracking | DRIs, leaders |
| **Compliance Team Reports** | Monday ~8:45 AM PT (`8 16 * * 1`) · Manual | 4 discussions (one per compliance team) with urgency-sorted launch lists | Security, Privacy, Accessibility, Responsible AI teams |
| **Process Analyzer** | Monday night / early Tuesday UTC (`5 6 * * 2`) · Manual | Weekly retro discussion, process drift analysis, automation candidate issues, process update PRs | PMs, ops, leaders |
| **Decision Log** | Weeknights after each workday (`0 7 * * 2-6`) · Manual | PR with individual markdown decision records in `/decisions/` | PMs, DRIs, leaders |
| **Daily Standup Prep** | Monday and Wednesday ~8 AM PT (`0 15 * * 1,3`) · Manual | Discussion with high-priority standup topics, blockers, and facilitation prompts | PMs, DRIs, facilitators |
| **Strategy Alignment** | Wednesday ~8 AM PT (`19 15 * * 3`) · Manual | Strategy evidence PR plus comments on clear misalignment | PMs, leaders |
| **Adversarial PM** | Wednesday ~8:30 AM PT (`20 23 * * 3`) · Manual | Counterargument comments on recent consequential decisions | PMs, DRIs, leaders |
| **Workflow Health** | Friday ~8 AM PT (`6 14 * * 5`) · Manual | Discussion with success rates, failure patterns, cost estimates, cross-workflow interaction analysis, and recommendations | Ops, leaders |
| **Weekly Status** | Friday ~8 AM PT (`49 15 * * 5`) · Manual | Discussion with What Shipped, What We Learned, FYI, and SOS sections | Leaders, senior stakeholders |
| **Sample Data Simulator** | Sunday and Tuesday nights ~11 PM PT (`0 6 * * 1,3`) · Manual | Creates launches, closes tasks, advances phases, adds comments | Demo only — not needed for production |
| **Assumption Surfacer** | Issue opened/edited · Manual | Comments surfacing implicit assumptions as explicit questions | PMs, DRIs |
| **Intake Request Triage** | Issue labeled `triage-needed` | RICE/Kano scores, strategy alignment, triage comment, project board update | PMs, DRIs |
| **Transcript Processor** | Push to `transcripts/**/*.txt`, `transcripts/**/*.vtt`, `transcripts/*.txt`, or `transcripts/*.vtt` on `main` · Manual | Comments on matched issues with meeting context, decisions, action items | PMs, DRIs |

### Model sizing

Routine reporting workflows that mostly transform deterministic pre-fetched
data use `gpt-5.4-mini` to keep OpenAI usage low: Daily Standup Prep, Launch
Readiness, Compliance Team Reports, GTM Team Reports, Weekly Status, Workflow
Health, and the demo-only Sample Data Simulator. Judgment-heavy workflows that
score strategy, compliance risk, process drift, transcripts, or adversarial
arguments currently use the Codex engine default so the model has more reasoning
headroom where mistakes have higher product or organizational impact.

### Weekly cadence

Most portfolio workflows run **Monday mornings staggered between 7:30–8:45 AM PT** to kick off the week with fresh data, spaced to respect data dependencies. Daily or event-driven workflows fill in decisions, standup prep, transcript processing, and intake triage as work happens.

On a typical week:

**Sunday night / Tuesday night:**
1. **Sample Data Simulator** — demo-only activity generation, scheduled ahead
   of Monday and Wednesday workdays.

**Monday (staggered to respect data dependencies):**
2. **Leadership Briefs** (~7:30 AM PT) — personalized briefs for each leader
   with kudos, feedback, and pre-escalation. One discussion per leader policy.
3. **GTM Team Reports** (~8:00 AM PT) — summarizes launches needing GTM action.
4. **Compliance Review** (~8:00 AM PT) — evaluates launches, updates labels, creates/updates
   sub-issues. Runs first so that labels and sub-issues are current.
5. **GTM Content** (~8:15 AM PT) — generates/refreshes changelog drafts and roadmap items.
6. **Launch Readiness** (~8:30 AM PT) — assesses overall readiness including compliance
   sign-off status. References the labels set by the compliance review.
7. **Compliance Team Reports** (~8:45 AM PT) — generates per-team digests reflecting the
   latest label and sub-issue state.
8. **Daily Standup Prep** (~8:00 AM PT) — prepares the Monday standup.

**Monday night / early Tuesday UTC:**
9. **Process Analyzer** — posts the weekly retro, checks process drift, and
   proposes process updates or automation candidates.

**Weeknights after workdays:**
10. **Decision Log** — scans issue comments and transcripts for decisions,
   creates PRs with markdown decision records.

**Wednesday:**
11. **Daily Standup Prep** (~8:00 AM PT) — prepares the Wednesday standup.
12. **Strategy Alignment** (~8:00 AM PT) — checks decisions and activity
    against the strategy doc.
13. **Adversarial PM** (~8:30 AM PT) — challenges recent consequential decisions.

**Friday (~8 AM PT):**
14. **Workflow Health** — analyzes all agentic workflow runs from the past week,
    reports success rates, failure patterns, cost estimates, detects cross-workflow
    conflicts and cascade chains, and generates recommendations for efficiency,
    reliability, and conflict resolution.
15. **Weekly Status** — rolls up all activity into a single leadership status
   post with What Shipped, What We Learned, FYI, and SOS sections.

**On issues:**
16. **Assumption Surfacer** — runs on issue opened/edited events.
17. **Intake Request Triage** — scores requests when `triage-needed` is applied.
18. **Compliance Review** — also runs when relevant launch/compliance labels are
    added to an issue, so new launches get evaluated immediately.

**On push to `/transcripts/`:**
19. **Transcript Processor** — matches transcript content to open issues and
   posts summary comments with meeting context.
