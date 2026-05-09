# 🚀 Agentics Beyond Code

Agentic Workflows for PMs, ops, compliance, and other non-engineering roles — built on [GitHub Agentic Workflows](https://githubnext.com/projects/agentic-workflows/).

While [The Agentics](https://github.com/githubnext/agentics) focuses on engineering use cases (CI, code review, testing), **Agentics Beyond Code** brings the same power to the people who ship, govern, and operate products — without writing a line of code.

## 🎯 Who is this for?

- **DRIs / Product Managers** — track launches, monitor feature health, keep roadmaps honest
- **Downstream / Compliance Teams** — domain sign-offs, audit trails, policy checks
- **Leaders** — launch pipeline visibility, risk dashboards, trend analysis

## 📂 Available Workflows

### 🚢 Launch Tracking

| Workflow | Description |
|----------|-------------|
| [🚦 Launch Readiness Checker](.github/workflows/launch-readiness.md) | Monday morning readiness report across all launches — completeness, risk, blockers, sign-offs |

### ✅ Compliance

| Workflow | Description |
|----------|-------------|
| [🛡️ Compliance Review](.github/workflows/compliance-review.md) | Evaluates launches against Security, Privacy, Accessibility, and Responsible AI rubrics — updates labels, posts status tables, creates review sub-issues (Monday mornings) |
| [📊 Compliance Team Reports](.github/workflows/compliance-team-reports.md) | Monday morning per-team discussion showing launches needing review, sorted by urgency |

### 📣 Go-to-Market

| Workflow | Description |
|----------|-------------|
| [📣 GTM Content](.github/workflows/gtm-content.md) | Monday morning generation and refresh of changelog announcement drafts and public roadmap items as sub-issues, following the org's voice & tone policy |
| [📣 GTM Team Reports](.github/workflows/gtm-team-reports.md) | Monday morning report summarizing launches needing GTM action — missing changelog drafts, missing roadmap items, content needing refresh, and upcoming launches |

| Workflow | Description |
|----------|-------------|
| [🔍 Assumption Surfacer](.github/workflows/assumption-surfacer.md) | Scans issues and PRs for implicit assumptions (timelines, dependencies, user behavior, capacity) and posts them as explicit questions for the team to reason through together |
| [📋 Decision Log](.github/workflows/decision-log.md) | Daily scan of issue comments and meeting transcripts for decisions — creates a PR with individual decision record files in `/decisions/` |
| [🧭 Strategy Alignment](.github/workflows/strategy-alignment.md) | Monday morning analysis of decisions against `docs/strategy.md` tradeoffs — comments on misaligned issues, annotates the strategy doc with alignment evidence and emerging patterns |
| [🎙️ Transcript Processor](.github/workflows/transcript-processor.md) | Triggered when `.txt` or `.vtt` files are pushed to `/transcripts/` — matches transcript content to open issues and posts summary comments |
| [🔄 Process Analyzer](.github/workflows/process-analyzer.md) | Weekly retro + process analysis — posts a team retrospective discussion, detects process drift in transcripts vs `docs/how-we-work.md`, identifies automation opportunities, and creates update PRs |

### 📊 Leadership

| Workflow | Description |
|----------|-------------|
| [📋 Weekly Status](.github/workflows/weekly-status.md) | Friday morning leadership status rollup — What Shipped, What We Learned, FYI, and SOS — across all initiatives and launches |
| [🩺 Workflow Health](.github/workflows/workflow-health.md) | Friday morning health report across all agentic workflows — success rates, failure patterns, cost estimates, cross-workflow interaction analysis (conflict detection, cascade chains, resource contention), and efficiency recommendations |

### 🧪 Demo / Sample Data

> **Note:** The sample data simulator is for **demo purposes only**. It generates fake project activity so the other workflows have realistic data to work with. You don't need it for production use.

| Workflow | Description |
|----------|-------------|
| [🎲 Sample Data Simulator](.github/workflows/sample-data-simulator.md) | Generates realistic project activity daily — creates launches, closes tasks, advances phases. Run manually anytime to add more content. |

## 📖 Documentation

- **[How We Work](docs/how-we-work.md)** — team processes, meeting cadence, triage, and communication norms
- **[Getting Started](docs/setup.md)** — prerequisites, installation, and first run
- **[How It Works](docs/how-it-works.md)** — architecture, issue hierarchy, and customization
- **[FAQ](docs/faq.md)** — common questions about setup, workflows, and costs
- **[Workflow Ideas](docs/workflow-ideas.md)** — catalog of future workflow ideas for PM, ops, compliance, and GTM

## 🤝 Contributing

This is an early-stage project. We'd love ideas for workflows that help non-engineering roles work better with GitHub repos. Open an issue or submit a PR!

## 📖 Learn More

- [GitHub Agentic Workflows docs](https://github.github.io/gh-aw/)
- [The Agentics (engineering-focused)](https://github.com/githubnext/agentics)
- [GitHub Next — Agentic Workflows](https://githubnext.com/projects/agentic-workflows/)
