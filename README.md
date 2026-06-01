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
| [🚦 Launch Readiness Checker](.github/workflows/launch-readiness.md) | Monday morning readiness report across all launches — completeness, risk, blockers, sign-offs | [Readiness report - 2026-05-31](https://github.com/chrizbo/agentics-beyond-code/discussions/196) |

### ✅ Compliance

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [🛡️ Compliance Review](.github/workflows/compliance-review.md) | Evaluates launches against Security, Privacy, Accessibility, and Responsible AI rubrics — updates labels, posts status tables, creates review sub-issues (Monday mornings) | [Status table comment - 2026-05-31](https://github.com/chrizbo/agentics-beyond-code/issues/3#issuecomment-4588202940) |
| [📊 Compliance Team Reports](.github/workflows/compliance-team-reports.md) | Monday morning per-team discussion showing launches needing review, sorted by urgency | [Security](https://github.com/chrizbo/agentics-beyond-code/discussions/203), [Privacy](https://github.com/chrizbo/agentics-beyond-code/discussions/204), [Accessibility](https://github.com/chrizbo/agentics-beyond-code/discussions/205), and [Responsible AI](https://github.com/chrizbo/agentics-beyond-code/discussions/206) - week of 2026-06-01 |

### 📣 Go-to-Market

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [📣 GTM Content](.github/workflows/gtm-content.md) | Monday morning generation and refresh of changelog announcement drafts and public roadmap items as sub-issues, following the org's voice & tone policy | [Changelog draft - EU Payment Methods](https://github.com/chrizbo/agentics-beyond-code/issues/77) |
| [📣 GTM Team Reports](.github/workflows/gtm-team-reports.md) | Monday morning report summarizing launches needing GTM action — missing changelog drafts, missing roadmap items, content needing refresh, and upcoming launches | [GTM readiness report - 2026-05-31](https://github.com/chrizbo/agentics-beyond-code/discussions/194) |

### 📥 Intake & Triage

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [📥 Intake Request Triage](.github/workflows/intake-triage.md) | Scores incoming feature requests and bug reports using RICE and Kano frameworks, checks strategy alignment, detects duplicates, flags incomplete submissions, and adds items to the triage project board | [Triage comment](https://github.com/chrizbo/agentics-beyond-code/issues/109#issuecomment-4416252905) |

### 📋 Decision & Knowledge

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [🔍 Assumption Surfacer](.github/workflows/assumption-surfacer.md) | Scans issues for implicit assumptions (timelines, dependencies, user behavior, capacity) and posts them as explicit questions for the team to reason through together | [Assumptions comment](https://github.com/chrizbo/agentics-beyond-code/issues/93#issuecomment-4413916898) |
| [😤 Adversarial PM](.github/workflows/adversarial-pm.md) | Wednesday morning grumpy challenge of the week's most consequential decisions — picks 2-3 from `/decisions/`, argues against them using non-deterministic lenses (pre-mortem, reversibility, opportunity cost, etc.), and posts sarcastic but specific counterarguments on the source issues | [ClickHouse challenge](https://github.com/chrizbo/agentics-beyond-code/issues/68#issuecomment-4416664720) |
| [📋 Decision Log](.github/workflows/decision-log.md) | Daily scan of issue comments and meeting transcripts for decisions — creates a PR with individual decision record files in `/decisions/` | [Decision log - 2026-05-09](https://github.com/chrizbo/agentics-beyond-code/issues/87) |
| [🧭 Strategy Alignment](.github/workflows/strategy-alignment.md) | Wednesday morning analysis of team activity against `docs/strategy.md` tradeoffs — comments on clearly misaligned issues, annotates the strategy doc with alignment evidence and emerging patterns | [Strategy evidence PR](https://github.com/chrizbo/agentics-beyond-code/pull/107) |
| [🎙️ Transcript Processor](.github/workflows/transcript-processor.md) | Triggered when `.txt` or `.vtt` files are pushed to `/transcripts/` — matches transcript content to open issues and posts summary comments | [Meeting notes comment](https://github.com/chrizbo/agentics-beyond-code/issues/14#issuecomment-4413622565) |

### 📊 Leadership

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [📋 Weekly Status](.github/workflows/weekly-status.md) | Friday morning leadership status rollup — What Shipped, What We Learned, FYI, and SOS — across all initiatives and launches | [Weekly status - week of 2026-06-01](https://github.com/chrizbo/agentics-beyond-code/discussions/200) |
| [📋 Leadership Briefs](.github/workflows/leadership-brief.md) | Monday morning personalized briefs — one per leader policy file — with Give Kudos, Give Feedback, and Get Involved sections tailored to each leader's domain, goals, and management style | [Alex Chen](https://github.com/chrizbo/agentics-beyond-code/discussions/201) and [Priya Sharma](https://github.com/chrizbo/agentics-beyond-code/discussions/202) - week of 2026-06-01 |

### 🔧 Operations

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [🩺 Workflow Health](.github/workflows/workflow-health.md) | Friday morning health report across all agentic workflows — success rates, failure patterns, cost estimates, cross-workflow interaction analysis (conflict detection, cascade chains, resource contention), and efficiency recommendations | [Health report - 2026-05-31](https://github.com/chrizbo/agentics-beyond-code/discussions/197) |
| [🧾 Commitment Reconciler](.github/workflows/commitment-reconciler.md) | Monday commitment audit that compares transcripts and issue comments against GitHub artifacts, surfacing promised-but-untracked work, stale commitments, artifact drift, and completion mismatches | [Commitment reconciliation - week of 2026-06-01](https://github.com/chrizbo/agentics-beyond-code/issues/198) |
| [🔄 Process Analyzer](.github/workflows/process-analyzer.md) | Weekly retro + process analysis — posts a team retrospective discussion, detects process drift in transcripts vs `docs/how-we-work.md`, identifies automation opportunities and gaps, and creates update PRs | [Retro - week of 2026-05-25](https://github.com/chrizbo/agentics-beyond-code/discussions/199) |
| [🔁 Daily Standup Prep](.github/workflows/daily-standup-prep.md) | Monday/Wednesday standup preparation: posts a discussion with high-priority topics, blockers, and facilitation prompts to help run effective daily syncs | [Standup prep - 2026-05-31](https://github.com/chrizbo/agentics-beyond-code/discussions/195) |

### 🧪 Demo / Sample Data

> **Note:** The sample data simulator is for **demo purposes only**. It generates fake project activity so the other workflows have realistic data to work with. You don't need it for production use.

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [🎲 Sample Data Simulator](.github/workflows/sample-data-simulator.md) | Generates realistic project activity Sunday and Tuesday nights — creates launches, closes tasks, advances phases. Run manually anytime to add more content. | Closed sample issues [#72](https://github.com/chrizbo/agentics-beyond-code/issues/72), [#70](https://github.com/chrizbo/agentics-beyond-code/issues/70), [#71](https://github.com/chrizbo/agentics-beyond-code/issues/71), and [#3](https://github.com/chrizbo/agentics-beyond-code/issues/3) |

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

## 🧰 Agent Skills

This repo includes reusable agent skills for setting up and maintaining
Agentics Beyond Code workflows:

- **[Non-Coder Agentic Workflow Builder](.github/skills/non-coder-agentic-workflow-builder/SKILL.md)** — helps product, ops, compliance, GTM, design, research, support, customer success, program, and leadership users turn process problems into a repo setup with workflows, project boards, issue templates, labels, blank strategy/how-we-work docs, policies, and folders.
- **[Agentic Workflows](.github/skills/agentic-workflows/SKILL.md)** — helps create, update, debug, compile, and validate GitHub Agentic Workflows.

Skills are mirrored in two places:

- `.github/skills/` follows the GitHub skill discovery convention.
- `.claude/skills/` supports local Claude-style skill discovery.

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
