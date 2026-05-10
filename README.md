# 🚀 Agentics Beyond Code

Agentic Workflows for PMs, ops, compliance, and other non-engineering roles — built on [GitHub Agentic Workflows](https://githubnext.com/projects/agentic-workflows/).

While [The Agentics](https://github.com/githubnext/agentics) focuses on engineering use cases (CI, code review, testing), **Agentics Beyond Code** brings the same power to the people who ship, govern, and operate products — without writing a line of code.

## 🎯 Who is this for?

- **DRIs / Product Managers** — track launches, monitor feature health, keep roadmaps honest
- **Downstream / Compliance Teams** — domain sign-offs, audit trails, policy checks
- **Leaders** — launch pipeline visibility, risk dashboards, trend analysis

## 📂 Available Workflows

### 🚢 Launch Tracking

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [🚦 Launch Readiness Checker](.github/workflows/launch-readiness.md) | Monday morning readiness report across all launches — completeness, risk, blockers, sign-offs | [Report — 2026-05-09](https://github.com/chrizbo/agentics-beyond-code/discussions/76) |

### ✅ Compliance

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [🛡️ Compliance Review](.github/workflows/compliance-review.md) | Evaluates launches against Security, Privacy, Accessibility, and Responsible AI rubrics — updates labels, posts status tables, creates review sub-issues (Monday mornings) | [Status table comment](https://github.com/chrizbo/agentics-beyond-code/issues/4#issuecomment-4411223864) |
| [📊 Compliance Team Reports](.github/workflows/compliance-team-reports.md) | Monday morning per-team discussion showing launches needing review, sorted by urgency | [Security Status — Week of 2026-05-04](https://github.com/chrizbo/agentics-beyond-code/discussions/88) |

### 📣 Go-to-Market

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [📣 GTM Content](.github/workflows/gtm-content.md) | Monday morning generation and refresh of changelog announcement drafts and public roadmap items as sub-issues, following the org's voice & tone policy | [Changelog draft — EU Payment Methods](https://github.com/chrizbo/agentics-beyond-code/issues/77) |
| [📣 GTM Team Reports](.github/workflows/gtm-team-reports.md) | Monday morning report summarizing launches needing GTM action — missing changelog drafts, missing roadmap items, content needing refresh, and upcoming launches | [GTM Readiness — Week of 2026-05-04](https://github.com/chrizbo/agentics-beyond-code/discussions/105) |

### 📥 Intake & Triage

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [📥 Intake Request Triage](.github/workflows/intake-triage.md) | Scores incoming feature requests and bug reports using RICE and Kano frameworks, checks strategy alignment, detects duplicates, flags incomplete submissions, and adds items to the triage project board | [Triage comment](https://github.com/chrizbo/agentics-beyond-code/issues/109#issuecomment) |

### 📋 Decision & Knowledge

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [🔍 Assumption Surfacer](.github/workflows/assumption-surfacer.md) | Scans issues and PRs for implicit assumptions (timelines, dependencies, user behavior, capacity) and posts them as explicit questions for the team to reason through together | [Assumptions comment](https://github.com/chrizbo/agentics-beyond-code/issues/93#issuecomment-4413916898) |
| [📋 Decision Log](.github/workflows/decision-log.md) | Daily scan of issue comments and meeting transcripts for decisions — creates a PR with individual decision record files in `/decisions/` | [Decision Log — 2026-05-09](https://github.com/chrizbo/agentics-beyond-code/issues/87) |
| [🧭 Strategy Alignment](.github/workflows/strategy-alignment.md) | Monday morning analysis of team activity against `docs/strategy.md` tradeoffs — comments on clearly misaligned issues, annotates the strategy doc with alignment evidence and emerging patterns | [Strategy evidence PR](https://github.com/chrizbo/agentics-beyond-code/pull/107) |
| [🎙️ Transcript Processor](.github/workflows/transcript-processor.md) | Triggered when `.txt` or `.vtt` files are pushed to `/transcripts/` — matches transcript content to open issues and posts summary comments | [Meeting notes comment](https://github.com/chrizbo/agentics-beyond-code/issues/14#issuecomment-4413622565) |
| [🔄 Process Analyzer](.github/workflows/process-analyzer.md) | Weekly retro + process analysis — posts a team retrospective discussion, detects process drift in transcripts vs `docs/how-we-work.md`, identifies automation opportunities and gaps, and creates update PRs | [Retro — Week of 2026-05-04](https://github.com/chrizbo/agentics-beyond-code/discussions/104) |

### 📊 Leadership

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [📋 Weekly Status](.github/workflows/weekly-status.md) | Friday morning leadership status rollup — What Shipped, What We Learned, FYI, and SOS — across all initiatives and launches | [Week of 2026-05-04](https://github.com/chrizbo/agentics-beyond-code/discussions/86) |
| [🩺 Workflow Health](.github/workflows/workflow-health.md) | Friday morning health report across all agentic workflows — success rates, failure patterns, cost estimates, cross-workflow interaction analysis (conflict detection, cascade chains, resource contention), and efficiency recommendations | [Week of 2026-05-04](https://github.com/chrizbo/agentics-beyond-code/discussions/106) |

### 🧪 Demo / Sample Data

> **Note:** The sample data simulator is for **demo purposes only**. It generates fake project activity so the other workflows have realistic data to work with. You don't need it for production use.

| Workflow | Description |
|----------|-------------|
| [🎲 Sample Data Simulator](.github/workflows/sample-data-simulator.md) | Generates realistic project activity daily — creates launches, closes tasks, advances phases. Run manually anytime to add more content. |

## 💡 Philosophy

Five ideas shaped this project:

### Process as Code

Team policies — how we triage, what "launch-ready" means, compliance rubrics — are written as markdown files that humans review and agents execute. When the policy file _is_ the automation input, docs can't rot: changing `how-we-work.md` changes how the workflow behaves on its next run.

### Living Documents

Strategy docs, decision logs, and how-we-work guides go stale the moment someone merges a PR or wraps up a meeting. Agentic workflows close that gap by _connecting_ documents to the events that should update them — transcript pushes, issue closures, weekly cadences — so the document stays as current as the work itself.

### Artifacts over Roles

The scoping unit for each workflow is the **artifact** it produces (a readiness report, a compliance review, a decision record), not the role it replaces. When everyone agrees on the output artifact, the workflow has a natural boundary and the agent's constraints stay focused. Animate the artifact, not the job title.

### The Repo Is the Architecture

The model is interchangeable — what makes these workflows effective is the **environment** they operate in: issues, labels, docs, transcripts, git history. Designing the repo topology well matters more than picking the right LLM.

### Every Run Improves the System

Good agentic systems compound. The process analyzer detects drift, the decision log accumulates records, strategy alignment annotates docs with evidence. Each run leaves the repo a little smarter than it found it.

## 📖 Documentation

### Getting Started

- **[Getting Started](docs/setup.md)** — prerequisites, installation, and first run
- **[How It Works](docs/how-it-works.md)** — architecture, issue hierarchy, and customization
- **[FAQ](docs/faq.md)** — common questions about setup, workflows, and costs
- **[Workflow Ideas](docs/workflow-ideas.md)** — catalog of future workflow ideas for PM, ops, compliance, and GTM

### Sample Team Context

> These docs represent a **fictional team** used as sample context for the workflows. Fork the repo and replace them with your own team's docs.

- **[How We Work](docs/how-we-work.md)** — team processes, meeting cadence, triage, and communication norms
- **[Strategic Tradeoffs](docs/strategy.md)** — the team's "even over" strategy statements, annotated with alignment evidence
- **[Launch Tracker Project](https://github.com/users/chrizbo/projects/1)** — the sample GitHub Project with issues, launches, and workflow-generated artifacts
- **[Intake Triage Project](https://github.com/users/chrizbo/projects/2)** — project board for triaging incoming feature requests and bug reports

## 🤝 Contributing

This is an early-stage project. We'd love ideas for workflows that help non-engineering roles work better with GitHub repos. Open an issue or submit a PR!

## 📖 Learn More

- [GitHub Agentic Workflows docs](https://github.github.io/gh-aw/)
- [The Agentics (engineering-focused)](https://github.com/githubnext/agentics)
- [GitHub Next — Agentic Workflows](https://githubnext.com/projects/agentic-workflows/)

## 📬 Contact

Want to enable Agentics Beyond Code for your organization? Reach out to **Chris Butler**, the creator of this project:

- **Email:** [chrizbo@gmail.com](mailto:chrizbo@gmail.com)
- **LinkedIn:** [linkedin.com/in/chrisbu](https://www.linkedin.com/in/chrisbu/)
