# How It Works

Agentics Beyond Code uses [GitHub Agentic Workflows](https://githubnext.com/projects/agentic-workflows/) to automate launch tracking, health monitoring, and compliance checks for non-engineering roles. Here's how the system fits together.

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
| **Downstream teams** | Which launches need their sign-off | Watch for `needs:{domain}` labels, review domain sections in reports |
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
  policies/
    launch-readiness-policy.md       ← Readiness thresholds & risk scoring
    security-review-policy.md        ← Security rubric & review questions
    privacy-review-policy.md         ← Privacy rubric & review questions
    accessibility-review-policy.md   ← Accessibility rubric & review questions
    responsible-ai-review-policy.md  ← Responsible AI rubric & review questions
    voice-and-tone-policy.md         ← How we write customer-facing content
  scripts/
    fetch-launch-data.sh             ← Deterministic data fetching (shared)
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

### 7. `ai:` prefix on all agent-created content

All issues, discussions, and other resources created by agentic workflows use the `ai:` title prefix. This makes it immediately obvious which content was generated by automation vs. created by humans, and makes it easy to filter or search for agent output.

Every workflow's `safe-outputs` should include `title-prefix: "ai: "` (or `"ai: [Category] "`).

### 8. Reports as discussions

Readiness reports are posted as GitHub Discussions (not issues) to avoid cluttering the issue tracker. Previous reports are automatically closed when a new one is created, keeping only the latest active.

## Metadata Strategy

### Labels — automation state flags

| Label | Purpose |
|-------|---------|
| `launch` | Marks an issue as a launch |
| `blocker` | Flags a blocking issue |
| `at-risk` | Applied when a launch is at risk |
| `needs:{domain}` | Flags that a domain team's input is required |
| `approved:{domain}` | Domain sign-off granted |
| `ready-for-review` | Ready for domain team review |
| `compliance-review` | Applied to compliance review sub-issues (distinguishes them from feature work) |

### Custom Fields — structured project data

| Field | Type | Purpose |
|-------|------|---------|
| Phase | Single select | Team, Alpha, Beta, GA |
| Target Date | Date | Expected ship date |
| Launch Type | Single select | Major, Minor, Patch, Internal |
| Risk Level | Single select | Low, Medium, High, Critical |

## Compliance Review System

The compliance review system ensures every launch gets evaluated by the right
compliance teams before shipping. It consists of two workflows and four policy files.

### How it works

1. **Compliance Review workflow** (`compliance-review.md`) evaluates each launch
   against four compliance rubrics — Security, Privacy, Accessibility, and
   Responsible AI. For each launch it:
   - Reads the rubric from the corresponding policy file
   - Determines whether a review is needed based on launch content
   - Adds/removes `needs:{team}` labels on the launch issue
   - Posts a compact compliance status table as a comment on the launch
   - Creates **compliance review sub-issues** under the launch for each team
     that needs a review, pre-filled with tailored review questions, checklists,
     and context inferred from the launch

2. **Compliance Team Reports workflow** (`compliance-team-reports.md`) generates
   a weekly discussion for each compliance team showing:
   - Launches needing their review, sorted by urgency
   - Context on *why* each launch needs review
   - Links to the review sub-issues
   - Summary metrics (pending, in-progress, critical)

### Compliance review sub-issues

When a review is needed, the workflow creates a sub-issue under the launch
titled `[{Team}] Compliance Review — {Launch Title}`. These sub-issues:
- Are labeled `compliance-review` + `needs:{team}` so they can be filtered
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

1. Evaluates each open launch's phase, scope, and completeness
2. Creates two sub-issues per launch (when appropriate):
   - **📣 Changelog draft** — a customer-facing announcement post (Alpha+ only)
   - **🗺️ Roadmap item** — a forward-looking description for public roadmaps (all phases)
3. Refreshes existing drafts when the launch changes significantly (phase
   transition, major scope change, target date shift)

All content follows the **voice & tone policy** (`voice-and-tone-policy.md`),
which defines the org's writing style: friendly, benefit-led, specific, and
jargon-free.

### GTM sub-issues

Sub-issues are titled `[GTM] Changelog draft — ...` and `[GTM] Roadmap item — ...`
and labeled `gtm` so they're filterable. They contain:
- A full draft written in the org's voice
- Specifics pulled from the launch body, epics, and sub-issues
- Clear markers that it's a draft needing DRI review before publishing

### Voice & tone policy

The policy at `.github/policies/voice-and-tone-policy.md` defines:
- Core writing principles (human, benefit-led, specific, brief)
- Tone guidance per content type (changelog vs. roadmap)
- Formatting rules (sentence case, active voice, present/future tense)
- Words to use and avoid

## Workflow Schedule

All workflows share the same `fetch-launch-data.sh` pre-step for data fetching.

| Workflow | Trigger | Output | Audience |
|----------|---------|--------|----------|
| **Launch Readiness** | Weekly (scheduled) · Manual | Discussion with pipeline summary, risk breakdown, sign-off tracking | DRIs, leaders |
| **Compliance Review** | Weekly (scheduled) · On issue labeled · Manual | Labels on launches, status table comment, compliance review sub-issues | DRIs, compliance teams |
| **Compliance Team Reports** | Weekly (scheduled) · Manual | 4 discussions (one per compliance team) with urgency-sorted launch lists | Security, Privacy, Accessibility, Responsible AI teams |
| **GTM Content** | Weekly (scheduled) · Manual | Changelog draft and roadmap item sub-issues per launch | DRIs, marketing, comms |

### Weekly cadence

On a typical week the scheduled workflows run in this order:

1. **Compliance Review** — evaluates launches, updates labels, creates/updates
   sub-issues. Runs first so that labels and sub-issues are current.
2. **GTM Content** — generates/refreshes changelog drafts and roadmap items.
3. **Launch Readiness** — assesses overall readiness including compliance
   sign-off status. References the labels set by the compliance review.
4. **Compliance Team Reports** — generates per-team digests reflecting the
   latest label and sub-issue state.

The Compliance Review workflow also runs **on-demand** whenever a `launch`
label is added to an issue, so new launches get evaluated immediately.

## What's Built So Far

### ✅ Completed

- **Repository scaffolding** — README, issue templates (Initiative, Launch), labels, `.gitignore`
- **GitHub Project** — "Launch Tracker" with custom fields (Phase, Target Date, Launch Type, Risk Level)
- **Sample data** — 1 initiative, 3 launches (at different phases), epics and tasks with sub-issue hierarchy, some tasks closed to simulate progress
- **Data fetching script** — `.github/scripts/fetch-launch-data.sh` fetches project items + sub-issue trees via GraphQL
- **Launch Readiness workflow** — `.github/workflows/launch-readiness.md` with weekly schedule, policy-based assessment, discussion output
- **Readiness policy** — `.github/policies/launch-readiness-policy.md` with completeness thresholds, staleness windows, domain sign-off tracking, risk levels
- **Compliance Review workflow** — `.github/workflows/compliance-review.md` with rubric evaluation, label management, status tables, review sub-issues
- **Compliance Team Reports workflow** — `.github/workflows/compliance-team-reports.md` with per-team weekly discussions
- **Compliance policy files** — Security, Privacy, Accessibility, Responsible AI rubrics with review questions and checklists
- **GTM Content workflow** — `.github/workflows/gtm-content.md` with changelog drafts and roadmap items as sub-issues
- **Voice & tone policy** — `.github/policies/voice-and-tone-policy.md` defining org writing style for customer-facing content

### 🔜 Next

- Compile and test all workflows end-to-end
- Build additional workflows (Risk Radar, Stale Work Detector, Policy Gate)
- Create a project setup script to automate label/field creation
- Document how to customize for different team structures
