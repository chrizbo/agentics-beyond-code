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
    launch-readiness.md          ← General pattern (reusable)
  policies/
    launch-readiness-policy.md   ← Team rules (customizable)
  scripts/
    fetch-launch-data.sh         ← Deterministic data fetching (shared)
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

### 7. Reports as discussions

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

### Custom Fields — structured project data

| Field | Type | Purpose |
|-------|------|---------|
| Phase | Single select | Team, Alpha, Beta, GA |
| Target Date | Date | Expected ship date |
| Launch Type | Single select | Major, Minor, Patch, Internal |
| Risk Level | Single select | Low, Medium, High, Critical |

## What's Built So Far

### ✅ Completed

- **Repository scaffolding** — README, issue templates (Initiative, Launch), labels, `.gitignore`
- **GitHub Project** — "Launch Tracker" with custom fields (Phase, Target Date, Launch Type, Risk Level)
- **Sample data** — 1 initiative, 3 launches (at different phases), epics and tasks with sub-issue hierarchy, some tasks closed to simulate progress
- **Data fetching script** — `.github/scripts/fetch-launch-data.sh` fetches project items + sub-issue trees via GraphQL
- **Launch Readiness workflow** — `.github/workflows/launch-readiness.md` with weekly schedule, policy-based assessment, discussion output
- **Readiness policy** — `.github/policies/launch-readiness-policy.md` with completeness thresholds, staleness windows, domain sign-off tracking, risk levels

### 🔜 Next

- Compile and test the launch readiness workflow end-to-end
- Build additional workflows (Risk Radar, Stale Work Detector, Policy Gate)
- Add more policy files for different workflow types
- Create a project setup script to automate label/field creation
- Document how to customize for different team structures
