# 🚀 Agentics Beyond Code

Agentic Workflows for PMs, ops, compliance, and other non-engineering roles — built on [GitHub Agentic Workflows](https://githubnext.com/projects/agentic-workflows/).

While [The Agentics](https://github.com/githubnext/agentics) focuses on engineering use cases (CI, code review, testing), **Agentics Beyond Code** brings the same power to the people who ship, govern, and operate products — without writing a line of code.

> **⏸️ Scheduled workflows are currently paused** to reduce API costs while this repo is in demo/reference mode. Workflows triggered by human activity (issue creation, Slack reactions, transcript pushes) remain active. To run the full system, trigger the [Sample Data Simulator](.github/workflows/sample-data-simulator.md) and [Sample Data Launch Creator](.github/workflows/sample-data-launch-creator.md) manually first, then follow the [stage run order](#running-workflows-manually). To re-enable scheduled runs, uncomment the `schedule:` lines in each workflow's `.md` file and recompile with `gh aw compile`.

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
| [💬 Slack Context Processor](.github/workflows/slack-context-processor.md) | Pulls relevant Slack conversations into GitHub — matches messages to open issues and posts summary comments with source context and permalinks, so nothing discussed in Slack gets lost | [Slack update comment](https://github.com/chrizbo/agentics-beyond-code/issues/172#issuecomment-4596042385); [Slack message](https://slack.com/archives/C0B7ER3RZ53/p1780341504512589) ([join Slack](https://join.slack.com/t/agenticsbeyondcode/shared_invite/zt-3zfxw32uv-zSA0wE21pjPzUh1Nr4InIw)) |
| [📥 Slack Reaction Intake](.github/workflows/slack-reaction-intake.md) | React with `:inbox_tray:` on any Slack message to instantly capture it as a labeled GitHub intake issue — no copy-paste, no context switching, no requests dropped | [Slack intake issue](https://github.com/chrizbo/agentics-beyond-code/issues/224); [Slack message](https://slack.com/archives/C0B7ER3RZ53/p1780345438463139) ([join Slack](https://join.slack.com/t/agenticsbeyondcode/shared_invite/zt-3zfxw32uv-zSA0wE21pjPzUh1Nr4InIw)) |
| [🔔 Slack Triage Postback](.github/workflows/slack-triage-postback-dispatch.yml) | Closes the loop with Slack reporters — after triage completes, posts the outcome (RICE/Kano scores, alignment verdict, or needs-more-info) directly back into the originating Slack thread | [Triaged issue with postback sent](https://github.com/chrizbo/agentics-beyond-code/issues/235) |
| [📢 Slack Report-Back](.github/workflows/slack-report-back-dispatch.yml) | After any reporting workflow completes (Weekly Status, Launch Readiness, Workflow Health, etc.), posts a short link to the generated artifact in the configured Slack channel — keeping Slack-native teammates in the loop without requiring them to watch GitHub | [Slack message](https://slack.com/archives/C0B7ER3RZ53/p1748836040095519) ([join Slack](https://join.slack.com/t/agenticsbeyondcode/shared_invite/zt-3zfxw32uv-zSA0wE21pjPzUh1Nr4InIw)); [Weekly Status discussion](https://github.com/chrizbo/agentics-beyond-code/discussions/240) |

### 📊 Leadership

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [📋 Weekly Status](.github/workflows/weekly-status.md) | Friday morning leadership status rollup — What Shipped, What We Learned, FYI, and SOS — across all initiatives and launches. Automatically generates a collaborative Google Doc draft from the Discussion, posts a finalization gate comment on the Doc, and notifies the team in Slack. Resolving the gate comment triggers staged publishing. | [Weekly status - week of 2026-06-01](https://github.com/chrizbo/agentics-beyond-code/discussions/200) |
| [📋 Leadership Briefs](.github/workflows/leadership-brief.md) | Monday morning personalized briefs — one per leader policy file — with Give Kudos, Give Feedback, and Get Involved sections tailored to each leader's domain, goals, and management style | [Alex Chen](https://github.com/chrizbo/agentics-beyond-code/discussions/201) and [Priya Sharma](https://github.com/chrizbo/agentics-beyond-code/discussions/202) - week of 2026-06-01 |

### 🔧 Operations

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [🩺 Workflow Health](.github/workflows/workflow-health.md) | Friday morning health report across all agentic workflows — success rates, failure patterns, cost estimates, cross-workflow interaction analysis (conflict detection, cascade chains, resource contention), and efficiency recommendations | [Health report - 2026-05-31](https://github.com/chrizbo/agentics-beyond-code/discussions/197) |
| [🧾 Commitment Reconciler](.github/workflows/commitment-reconciler.md) | Monday commitment audit that compares transcripts and issue comments against GitHub artifacts, surfacing promised-but-untracked work, stale commitments, artifact drift, and completion mismatches | [Commitment reconciliation - week of 2026-06-01](https://github.com/chrizbo/agentics-beyond-code/issues/198) |
| [🔄 Process Analyzer](.github/workflows/process-analyzer.md) | Weekly retro + process analysis — posts a team retrospective discussion, detects process drift in transcripts vs `docs/how-we-work.md`, identifies automation opportunities and gaps, and creates update PRs | [Retro - week of 2026-05-25](https://github.com/chrizbo/agentics-beyond-code/discussions/199) |
| [🔁 Daily Standup Prep](.github/workflows/daily-standup-prep.md) | Monday/Wednesday standup preparation: posts a discussion with high-priority topics, blockers, and facilitation prompts to help run effective daily syncs | [Standup prep - 2026-05-31](https://github.com/chrizbo/agentics-beyond-code/discussions/195) |
| [🐒 Chaos Monkey](.github/workflows/chaos-monkey.md) | On-demand organizational chaos injection — scores the team's stasis across 6 signals (decision diversity, participation entropy, process staleness, topic homogeneity, launch concentration), and when things are too comfortable, posts a discussion with 2–3 calibrated disruption prescriptions. Stays silent when the team is healthy. | [Stasis Report — 2026-06-08](https://github.com/chrizbo/agentics-beyond-code/discussions/275) |

### 🧪 Demo / Sample Data

> **Note:** The sample data workflows are for **demo purposes only**. They generate fake project activity so the other workflows have realistic data to work with. You don't need them for production use. The schedules are currently **paused** — trigger them manually when you want to generate fresh data.

#### Running workflows manually

When triggering workflows by hand, run them in stages — parallel within each stage, but wait for each stage to complete before starting the next:

| Stage | Workflows | Why |
|-------|-----------|-----|
| **1** | `sample-data-simulator`, `sample-data-launch-creator` | Generates fresh project data — must run first |
| **2** | `decision-log`, `daily-standup-prep`, `assumption-surfacer`, `process-analyzer`, `compliance-team-reports` | Analyze current data |
| **3** | `weekly-status`, `leadership-brief` | Roll up stage 2 outputs |
| **4** | `workflow-health` | Monitor everything — run last |

| Workflow | Cadence | Description | Example output |
|----------|---------|-------------|----------------|
| [🎲 Sample Data Simulator](.github/workflows/sample-data-simulator.md) | Daily | Closes tasks, adds progress comments, generates standup transcripts, and creates intake issues — keeps daily activity flowing. | Closed [#69](https://github.com/chrizbo/agentics-beyond-code/issues/69) and [#176](https://github.com/chrizbo/agentics-beyond-code/issues/176), progress comments on [#96](https://github.com/chrizbo/agentics-beyond-code/issues/96) and [#262](https://github.com/chrizbo/agentics-beyond-code/issues/262), standup transcript [PR #286](https://github.com/chrizbo/agentics-beyond-code/pull/286), intake issue [#287](https://github.com/chrizbo/agentics-beyond-code/issues/287) |
| [🏗️ Sample Data Launch Creator](.github/workflows/sample-data-launch-creator.md) | Weekly | Creates new launches with epics and tasks, advances launch phases, closes completed launches, and adjusts risk levels — grows the project hierarchy over time. | Created [[Launch] Real-Time Notifications #280](https://github.com/chrizbo/agentics-beyond-code/issues/280) with epics [#281](https://github.com/chrizbo/agentics-beyond-code/issues/281) and [#282](https://github.com/chrizbo/agentics-beyond-code/issues/282) |

## 💡 Philosophy

Six ideas shaped this project:

### Process as Code

Team policies — how we triage, what "launch-ready" means, compliance rubrics — are written as markdown files that humans review and agents execute. When the policy file _is_ the automation input, docs can't rot: changing `how-we-work.md` changes how the workflow behaves on its next run.

### Living Documents

Strategy docs, decision logs, and how-we-work guides go stale the moment someone merges a PR or wraps up a meeting. Agentic workflows close that gap by _connecting_ documents to the events that should update them — transcript pushes, issue closures, weekly cadences — so the document stays as current as the work itself. The update always arrives as something reviewable — a PR, a comment, a draft discussion — so the team has a natural moment to push back before anything is final.

### Artifacts over Roles

The scoping unit for each workflow is the **artifact** it produces (a readiness report, a compliance review, a decision record), not the role it replaces. When everyone agrees on the output artifact, the workflow has a natural boundary and the agent's constraints stay focused. Animate the artifact, not the job title. And because the artifact is always something a human can read and act on — not a silent action taken on your behalf — the agent drafts; the team decides.

### The Repo Is the Architecture

The model is interchangeable — what makes these workflows effective is the **environment** they operate in: issues, labels, docs, transcripts, git history. Designing the repo topology well matters more than picking the right LLM.

### Your Habits Are Already Triggers

You don't need a new tool to work with agents — the habits you already have are enough. An emoji reaction captures a Slack message as a tracked request. A comment in a Google Doc kicks off a review cycle. A reaction in a thread closes the loop with the person who raised it. The integrations are designed to meet your workflow where it lives, not pull you into another system. When the trigger is something you were already going to do, adoption disappears.

### Every Run Improves the System

Good agentic systems compound. The process analyzer detects drift, the decision log accumulates records, strategy alignment annotates docs with evidence. Each run leaves the repo a little smarter than it found it.

## 🧰 Agent Skills

This repo includes reusable agent skills for setting up and maintaining
Agentics Beyond Code workflows:

- **[Non-Coder Agentic Workflow Builder](.github/skills/non-coder-agentic-workflow-builder/SKILL.md)** — helps product, ops, compliance, GTM, design, research, support, customer success, program, and leadership users turn process problems into a repo setup with workflows, project boards, issue templates, labels, blank strategy/how-we-work docs, policies, and folders.
- **[Agentic Workflows](.github/skills/agentic-workflows/SKILL.md)** — helps create, update, debug, compile, and validate GitHub Agentic Workflows. Bundled from the [gh-aw framework](https://github.github.io/gh-aw/).

Skills are mirrored in two places:

- `.github/skills/` follows the GitHub skill discovery convention.
- `.claude/skills/` supports local Claude-style skill discovery.

## 📖 Documentation

### Getting Started

- **[Getting Started](docs/setup.md)** — prerequisites, installation, and first run
- **[How It Works](docs/how-it-works.md)** — architecture, issue hierarchy, and customization
- **[FAQ](docs/faq.md)** — common questions about setup, workflows, and costs
- **[Workflow Ideas](docs/workflow-ideas.md)** — catalog of future workflow ideas for PM, ops, compliance, and GTM
- **[External Integration Patterns](docs/external-integration-patterns.md)** — future work for integrating with Slack, Jira, Microsoft 365, Google Workspace, Salesforce, ServiceNow, Notion, Asana, and Linear
- **[Slack Integration Plan](docs/slack-integration-plan.md)** — proposal for Slack context ingestion, emoji-driven automation, and Slack report-backs
- **[Google Docs Integration Plan](docs/google-docs-integration-plan.md)** — fixture-first proposal for bounded Google Docs context reads and validated document updates

### Sample Team Context

> These docs represent a **fictional team** used as sample context for the workflows. Fork the repo and replace them with your own team's docs.

- **[How We Work](docs/how-we-work.md)** — team processes, meeting cadence, triage, and communication norms
- **[Strategic Tradeoffs](docs/strategy.md)** — the team's "even over" strategy statements, annotated with alignment evidence
- **[Fake Google Docs Scope](google-docs-fixtures/README.md)** — synthetic external product, customer, security, launch, and program documents for folder- or shared-drive-based Google Docs demos
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
