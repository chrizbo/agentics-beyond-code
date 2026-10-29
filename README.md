# 🚀 Agentics Beyond Code

Agentic Workflows for PMs, ops, compliance, and other non-engineering roles — built on [GitHub Agentic Workflows](https://github.github.com/gh-aw/), now in public preview.

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

> 🚧 **In progress: [Release Blog Pipeline](docs/release-blog-pipeline.md).** A marketer files a brief, and agents turn an initiative's merged PRs, scope changes, and decisions into an evidence-backed blog post. Humans approve the brief and the draft from Slack or Google Docs, and the post ships as a PR that renders an HTML blog page. Built so far: the [Release Blog Brief](.github/ISSUE_TEMPLATE/release-blog-brief.yml) template, the [blog post policy](.github/policies/blog-post-policy.md), the [📝 Release Blog Brief Builder](.github/workflows/blog-brief-builder.md), the `/approve-brief` gate ([Blog Gate Dispatch](.github/workflows/blog-gate-dispatch.yml)), the evidence fetch, and the [🧾 Release Story Seed](.github/workflows/release-story-seed.yml) demo data workflow. Progress is tracked on the [Content Pipeline](https://github.com/users/chrizbo/projects/4) board.

### 📥 Intake & Triage

> Two of the workflows below read Slack, but from different surfaces: Slack
> Reaction Intake reads the team's own internal workspace (teammates asking
> the team for something); Customer Feedback Intake reads separate
> field/CS-facing channels relaying external customer signal, alongside
> Discord and OSS-repo fixtures. See [Two Slack Surfaces](docs/slack-integration-plan.md#two-slack-surfaces-internal-team-channel-vs-external-customer-channels) for the full comparison.

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [📥 Intake Request Triage](.github/workflows/intake-triage.md) | Scores incoming feature requests and bug reports using RICE and Kano frameworks, checks strategy alignment, detects duplicates, flags incomplete submissions, and adds items to the triage project board | [Triage comment](https://github.com/chrizbo/agentics-beyond-code/issues/109#issuecomment-4416252905) |
| [🗣️ Customer Feedback Intake](.github/workflows/customer-feedback-intake.yml) | Manual deterministic fixture intake for **external, customer-facing** signal — normalizes OSS repo, Discord, and field/CS Slack channel fixtures, preserves exact customer language, creates feedback intake issues, and adds them to the Customer Feedback Queue project | [Feedback intake issue #311](https://github.com/chrizbo/agentics-beyond-code/issues/311) |
| [🔎 Feedback Dedupe & Strategy Triage](.github/workflows/feedback-dedupe-triage.md) | Reviews feedback intake issues, proposes duplicate clusters (linked as GitHub sub-issues of a canonical issue), compares exact customer language against strategy, suggests priority, comments on issues, labels the queue, and updates Customer Feedback Queue fields | [Triage comment - #311](https://github.com/chrizbo/agentics-beyond-code/issues/311#issuecomment-5691385756) |
| [📈 Friday Feedback Trends Report](.github/workflows/friday-feedback-trends-report.md) | Friday morning discussion recommending which feedback-driven work to consider accepting next week — ranked by suggested priority, confidence, and strategy fit, cross-referenced against active launches/initiatives so it never recommends duplicate work | [Feedback Trends - week of 2026-09-14](https://github.com/chrizbo/agentics-beyond-code/discussions/329) |
| [🏗️ Feedback Work Item Converter](.github/workflows/create-work-item.md) | Comment `/create-work-item` on a PM-approved feedback issue to convert it into a clean, agent-ready work item in the Launch Tracker project — redacts customer identity while preserving exact language, links back to every issue in the duplicate cluster | [Work item #328](https://github.com/chrizbo/agentics-beyond-code/issues/328), converted from [feedback #319](https://github.com/chrizbo/agentics-beyond-code/issues/319) |

### 📋 Decision & Knowledge

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [🔍 Assumption Surfacer](.github/workflows/assumption-surfacer.md) | Scans issues for implicit assumptions (timelines, dependencies, user behavior, capacity) and posts them as explicit questions for the team to reason through together | [Assumptions comment](https://github.com/chrizbo/agentics-beyond-code/issues/93#issuecomment-4413916898) |
| [😤 Adversarial PM](.github/workflows/adversarial-pm.md) | Wednesday morning grumpy challenge of the week's most consequential decisions — picks 2-3 from `/decisions/`, argues against them using non-deterministic lenses (pre-mortem, reversibility, opportunity cost, etc.), and posts sarcastic but specific counterarguments on the source issues | [ClickHouse challenge](https://github.com/chrizbo/agentics-beyond-code/issues/68#issuecomment-4416664720) |
| [📋 Decision Log](.github/workflows/decision-log.md) | Daily scan of issue comments and meeting transcripts for decisions — creates a PR with individual decision record files in `/decisions/` | [Decision log - 2026-05-09](https://github.com/chrizbo/agentics-beyond-code/issues/87) |
| [🧭 Strategy Alignment](.github/workflows/strategy-alignment.md) | Wednesday morning analysis of team activity against `docs/strategy.md` tradeoffs — comments on clearly misaligned issues, annotates the strategy doc with alignment evidence and emerging patterns | [Strategy evidence PR](https://github.com/chrizbo/agentics-beyond-code/pull/107) |
| [🎙️ Transcript Processor](.github/workflows/transcript-processor.md) | Triggered when `.txt` or `.vtt` files are pushed to `/transcripts/` — matches transcript content to open issues and posts summary comments | [Meeting notes comment](https://github.com/chrizbo/agentics-beyond-code/issues/14#issuecomment-4413622565) |
| [💬 Slack Context Processor](.github/workflows/slack-context-processor.md) | Pulls relevant Slack conversations into GitHub — matches messages to open issues and posts summary comments with source context and permalinks, so nothing discussed in Slack gets lost | [Slack update comment](https://github.com/chrizbo/agentics-beyond-code/issues/172#issuecomment-4596042385); [Slack message](https://slack.com/archives/C0B7ER3RZ53/p1780341504512589) ([join Slack](https://join.slack.com/t/agenticsbeyondcode/shared_invite/zt-3zfxw32uv-zSA0wE21pjPzUh1Nr4InIw)) |
| [📥 Slack Reaction Intake](.github/workflows/slack-reaction-intake.md) | React with `:inbox_tray:` on any message in the team's own **internal** Slack workspace to instantly capture it as a labeled GitHub intake issue — a teammate asking the team for something, not customer feedback — no copy-paste, no context switching, no requests dropped | [Slack intake issue](https://github.com/chrizbo/agentics-beyond-code/issues/224); [Slack message](https://slack.com/archives/C0B7ER3RZ53/p1780345438463139) ([join Slack](https://join.slack.com/t/agenticsbeyondcode/shared_invite/zt-3zfxw32uv-zSA0wE21pjPzUh1Nr4InIw)) |
| [🔔 Slack Triage Postback](.github/workflows/slack-triage-postback-dispatch.yml) | Closes the loop with Slack reporters — after triage completes, posts the outcome (RICE/Kano scores, alignment verdict, or needs-more-info) directly back into the originating Slack thread | [Triaged issue with postback sent](https://github.com/chrizbo/agentics-beyond-code/issues/235) |
| [📢 Slack Report-Back](.github/workflows/slack-report-back-dispatch.yml) | After any reporting workflow completes (Weekly Status, Launch Readiness, Workflow Health, etc.), posts a short link to the generated artifact in the configured Slack channel — keeping Slack-native teammates in the loop without requiring them to watch GitHub | [Slack message](https://slack.com/archives/C0B7ER3RZ53/p1748836040095519) ([join Slack](https://join.slack.com/t/agenticsbeyondcode/shared_invite/zt-3zfxw32uv-zSA0wE21pjPzUh1Nr4InIw)); [Weekly Status discussion](https://github.com/chrizbo/agentics-beyond-code/discussions/240) |

### 📊 Leadership

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [📋 Weekly Status](.github/workflows/weekly-status.md) | Friday morning leadership status rollup — What Shipped, What We Learned, FYI, and SOS — across all initiatives and launches. Automatically generates a collaborative Google Doc draft from the Discussion, posts a finalization gate comment on the Doc, and notifies the team in Slack. Resolving the gate comment triggers staged publishing. | [Weekly status - week of 2026-06-01](https://github.com/chrizbo/agentics-beyond-code/discussions/200) |
| [📋 Leadership Briefs](.github/workflows/leadership-brief.md) | Monday morning personalized briefs — one per leader policy file — with Give Kudos, Give Feedback, and Get Involved sections tailored to each leader's domain, goals, and management style | [Alex Chen](https://github.com/chrizbo/agentics-beyond-code/discussions/201) and [Priya Sharma](https://github.com/chrizbo/agentics-beyond-code/discussions/202) - week of 2026-06-01 |

### 📅 Calendar Intelligence

> Fixture-first: all three workflows run against `google-calendar-fixtures/` without any credentials configured. Connect a shared team Google Calendar to go live — see [`google-calendar-fixtures/README.md`](google-calendar-fixtures/README.md).

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [📅 Calendar Load Report](.github/workflows/calendar-load-report.md) | Friday fragmentation score and deep work block analysis per contributor — flags high meeting dispersion and days with zero 90-minute uninterrupted blocks | [Calendar Load — week of 2026-06-09](https://github.com/chrizbo/agentics-beyond-code/discussions/291) |
| [🧭 Calendar Strategy Audit](.github/workflows/calendar-strategy-audit.md) | Wednesday audit classifying team calendar time against `docs/strategy.md` priorities — surfaces which stated priorities have zero calendar coverage and whether async GitHub activity fills those gaps | [Calendar Audit — week of 2026-06-09](https://github.com/chrizbo/agentics-beyond-code/discussions/293) |
| [🔁 Daily Standup Prep](.github/workflows/daily-standup-prep.md) | Monday/Wednesday standup prep — posts a discussion with high-priority topics, blockers, and facilitation prompts, enriched with Mode A/B meeting briefs from today's calendar events | [Standup prep - 2026-05-31](https://github.com/chrizbo/agentics-beyond-code/discussions/195) |

### 🔧 Operations

| Workflow | Description | Example output |
|----------|-------------|----------------|
| [🩺 Workflow Health](.github/workflows/workflow-health.md) | Friday morning health report across all agentic workflows — success rates, failure patterns, cost estimates, cross-workflow interaction analysis (conflict detection, cascade chains, resource contention), and efficiency recommendations | [Health report - 2026-05-31](https://github.com/chrizbo/agentics-beyond-code/discussions/197) |
| [🧾 Commitment Reconciler](.github/workflows/commitment-reconciler.md) | Monday commitment audit that compares transcripts and issue comments against GitHub artifacts, surfacing promised-but-untracked work, stale commitments, artifact drift, and completion mismatches | [Commitment reconciliation - week of 2026-06-01](https://github.com/chrizbo/agentics-beyond-code/issues/198) |
| [🔄 Process Analyzer](.github/workflows/process-analyzer.md) | Weekly retro + process analysis — posts a team retrospective discussion, detects process drift in transcripts vs `docs/how-we-work.md`, identifies automation opportunities and gaps, and creates update PRs | [Retro - week of 2026-05-25](https://github.com/chrizbo/agentics-beyond-code/discussions/199) |
| [🐒 Chaos Monkey](.github/workflows/chaos-monkey.md) | On-demand organizational chaos injection — scores the team's stasis across 6 signals (decision diversity, participation entropy, process staleness, topic homogeneity, launch concentration), and when things are too comfortable, posts a discussion with 2–3 calibrated disruption prescriptions. Stays silent when the team is healthy. | [Stasis Report — 2026-06-08](https://github.com/chrizbo/agentics-beyond-code/discussions/275) |

### 🧪 Demo / Sample Data

> **Note:** The sample data workflows are for **demo purposes only**. They generate fake project activity so the other workflows have realistic data to work with. You don't need them for production use. The schedules are currently **paused** — trigger them manually when you want to generate fresh data.

#### Running workflows manually

When triggering workflows by hand, run them in stages — parallel within each stage, but wait for each stage to complete before starting the next:

| Stage | Workflows | Why |
|-------|-----------|-----|
| **1** | `sample-data-simulator`, `sample-data-launch-creator`, `customer-feedback-intake` | Generates fresh project and feedback data — must run first |
| **2** | `decision-log`, `daily-standup-prep`, `assumption-surfacer`, `process-analyzer`, `compliance-team-reports`, `feedback-dedupe-triage` | Analyze current data |
| **3** | `weekly-status`, `leadership-brief`, `friday-feedback-trends-report` | Roll up stage 2 outputs |
| **4** | `workflow-health` | Monitor everything — run last |

`create-work-item` isn't part of this staged run — it's triggered on demand by
commenting `/create-work-item` on a PM-approved feedback issue, not run in bulk.

| Workflow | Cadence | Description | Example output |
|----------|---------|-------------|----------------|
| [🎲 Sample Data Simulator](.github/workflows/sample-data-simulator.md) | Daily | Closes tasks, adds progress comments, generates standup transcripts, and creates intake issues — keeps daily activity flowing. | Closed [#69](https://github.com/chrizbo/agentics-beyond-code/issues/69) and [#176](https://github.com/chrizbo/agentics-beyond-code/issues/176), progress comments on [#96](https://github.com/chrizbo/agentics-beyond-code/issues/96) and [#262](https://github.com/chrizbo/agentics-beyond-code/issues/262), standup transcript [PR #286](https://github.com/chrizbo/agentics-beyond-code/pull/286), intake issue [#287](https://github.com/chrizbo/agentics-beyond-code/issues/287) |
| [🏗️ Sample Data Launch Creator](.github/workflows/sample-data-launch-creator.md) | Weekly | Creates new launches with epics and tasks, advances launch phases, closes completed launches, and adjusts risk levels — grows the project hierarchy over time. | Created [[Launch] Real-Time Notifications #280](https://github.com/chrizbo/agentics-beyond-code/issues/280) with epics [#281](https://github.com/chrizbo/agentics-beyond-code/issues/281) and [#282](https://github.com/chrizbo/agentics-beyond-code/issues/282) |
| [🗣️ Customer Feedback Intake](.github/workflows/customer-feedback-intake.yml) | Manual | Creates Customer Feedback Queue issues from fixture data so feedback triage and Friday reports have realistic cross-channel signals. | [Feedback intake issue #311](https://github.com/chrizbo/agentics-beyond-code/issues/311) |

## 💡 Philosophy

Six ideas shaped this project:

### Process as Code

Team policies — how we triage, what "launch-ready" means, compliance rubrics — are written as markdown files that humans review and agents execute. When the policy file _is_ the automation input, docs can't rot: changing `how-we-work.md` changes how the workflow behaves on its next run.

### Living Documents

Strategy docs, decision logs, and how-we-work guides go stale the moment someone merges a PR or wraps up a meeting. Agentic workflows close that gap by _connecting_ documents to the events that should update them — transcript pushes, issue closures, weekly cadences — so the document stays as current as the work itself. The update always arrives as something reviewable — a PR, a comment, a draft discussion — so the team has a natural moment to push back before anything is final.

### Artifacts over Roles

The scoping unit for each workflow is the **artifact** it produces (a readiness report, a compliance review, a decision record), not the role it replaces. When everyone agrees on the output artifact, the workflow has a natural boundary and the agent's constraints stay focused. Animate the artifact, not the job title. And because the artifact is always something a human can read and act on — not a silent action taken on your behalf — the agent drafts; the team decides.

### The Repo Is the Architecture

The model is interchangeable — what makes these workflows effective is the **environment** they operate in: issues, labels, docs, transcripts, git history. Designing the repo topology well matters more than picking the right LLM. Model changes still need runtime compatibility and output-quality checks; see [Codex workflow configuration](docs/codex-workflows.md) for the current inventory and evaluation procedure.

### Your Habits Are Already Triggers

You don't need a new tool to work with agents — the habits you already have are enough. An emoji reaction captures a Slack message as a tracked request. A comment in a Google Doc kicks off a review cycle. A reaction in a thread closes the loop with the person who raised it. The integrations are designed to meet your workflow where it lives, not pull you into another system. When the trigger is something you were already going to do, adoption disappears.

### Every Run Improves the System

Good agentic systems compound. The process analyzer detects drift, the decision log accumulates records, strategy alignment annotates docs with evidence. Each run leaves the repo a little smarter than it found it.

## 🧰 Agent Skills

This repo includes reusable agent skills for adopting Agentics Beyond Code
workflows. They follow one path: **assess** how the team works, **design** the
smallest useful set of workflows, then **build** them on the platform where the
team's work already lives.

```text
agentic-workflow-planner          github-workflow-builder
  Assess -> Design  ───────────>  claude-native-workflow-builder
  (platform-neutral)              productboard-agent-builder
                                  atlassian-agent-builder
                                  google-workspace-agent-builder
                                  microsoft-365-agent-builder
```

| Skill | Step | Use it when |
|---|---|---|
| **[Agentic Workflow Planner](.github/skills/agentic-workflow-planner/SKILL.md)** | Assess, Design | You want a readiness or current-state assessment from GitHub, Jira, Linear, or docs, or you want to know which workflows to adopt and where they should run. Start here if you're unsure. |
| **[GitHub Workflow Builder](.github/skills/github-workflow-builder/SKILL.md)** | Build: GitHub | Your team lives in GitHub Issues/Projects/Discussions. Sets up gh-aw workflows, blank strategy/how-we-work docs, policies, issue templates, labels, and project boards. |
| **[Claude-Native Workflow Builder](.github/skills/claude-native-workflow-builder/SKILL.md)** | Build: Claude | Your team lives in Slack, Notion, Jira, or email (or Google Workspace without Workspace Studio), or you want one workflow without the GitHub scaffolding. Ports or designs Claude Routines and Scheduled Tasks. |
| **[Productboard Agent Builder](.github/skills/productboard-agent-builder/SKILL.md)** | Build: Productboard | Product discovery, feedback, and planning live in Productboard. Adapts workflows into Spark skills and configures supported schedules. See [usage and testing](docs/skills.md#using-the-productboard-agent-builder). |
| **[Atlassian Agent Builder](.github/skills/atlassian-agent-builder/SKILL.md)** | Build: Atlassian | Work is tracked in Jira and documented in Confluence, and the team has Rovo. Adapts workflows into Rovo agents with Jira or Confluence automation for schedules, events, and workflow transitions. Deployment guidance is documentation-derived until field-tested; see [usage](docs/skills.md#using-the-atlassian-agent-builder). |
| **[Google Workspace Agent Builder](.github/skills/google-workspace-agent-builder/SKILL.md)** | Build: Google Workspace | The team works in Gmail, Drive, Sheets, and Chat on a Workspace edition with Gemini. Checks the Workspace plan, admin settings, and Studio run quota, then adapts workflows into Workspace Studio flows and skills (or Apps Script or Gemini Enterprise where those fit better). Deployment guidance is documentation-derived until field-tested; see [usage](docs/skills.md#using-the-google-workspace-agent-builder). |
| **[Microsoft 365 Agent Builder](.github/skills/microsoft-365-agent-builder/SKILL.md)** | Build: Microsoft 365 | Adapt workflows into Agent Builder agents, Copilot Studio agents, and Power Automate flows, checking tenant access, licensing, and execution identity. Deployment is not yet field-tested; see [usage](docs/skills.md#using-the-microsoft-365-agent-builder). |
| **[Agentic Workflows](.github/skills/agentic-workflows/SKILL.md)** | gh-aw authoring | Creating, debugging, or compiling gh-aw workflow files directly. Maintained upstream by the [gh-aw framework](https://github.github.io/gh-aw/). In this repo only; not in the Claude plugin. |

If you already know the platform and the workflow ("make the Friday trends
report a Claude Routine"), go straight to that builder. To show the skills to
someone else, follow the [skills demo script](docs/skills-demo-script.md).

### Install as a Claude plugin

The planner and the six platform builders are packaged as the **Agentics Beyond
Code** Claude plugin, with templates, references, and an index for retrieving
selected workflow sources from a pinned public repository revision. Installing it
does not activate the workflows in this repository or connect any services.

Install it from the [Claude plugin directory](https://claude.ai/new#customize/plugins/id/0fc0c7e1-2215-4ba4-8c5f-c791333cbee4%40anthropic-plugin-directory) (sign in to Claude
first), or go to **Customize → Plugins** and search for **Agentics Beyond Code**.
If your Claude environment doesn't show directory plugins, add the repository
marketplace `chrizbo/agentics-beyond-code` through **Customize → Plugins → Add
marketplace**, then install `agentics-beyond-code`. For Claude Code, ZIP
installation, prerequisites, example prompts, and updates, see the
[plugin guide](docs/claude-cowork-plugin.md). This is a community plugin listed in
Anthropic's directory, not an Anthropic-built integration.

The plugin has no hosted backend, analytics, or bundled connectors. Depending on
your request, skills can read supplied files or connected work systems and produce
files or draft automations. Data stays subject to the Claude environment and any
services you authorize; see [data handling and submission notes](docs/anthropic-submission.md).

The installable package is generated under [`plugins/agentics-beyond-code/`](plugins/agentics-beyond-code/).
Runtime workflow files and integration scripts remain outside that package.

### Install as a ChatGPT or Codex plugin

The same seven skills are packaged for **ChatGPT and Codex**. On a Mac, start
with a local installation: build or extract the ChatGPT package, then ask the
built-in plugin creator to register its folder in your personal marketplace
and install it. Start a new chat after installation. Use an `@` mention in
ChatGPT or `$microsoft-365-agent-builder` (or another skill) in Codex.

See the [Mac installation guide](docs/chatgpt-plugin.md#install-on-a-mac) for
build commands, a copy-ready installation prompt, updates, and troubleshooting.
Use `agentics-beyond-code-0.5.2-chatgpt.zip` for this package; the ZIP without
`-chatgpt` is the Claude package. Local marketplace availability depends on the
client and workspace; it does not automatically install the plugin on the web.

There is no public OpenAI listing for this package yet. The guide also covers
[workspace sharing and public directory submission](docs/chatgpt-plugin.md#public-directory-and-workspace-sharing).
Installing the skills does not connect services or start automations. See the
package's [data handling notes](plugins/chatgpt/agentics-beyond-code/docs/privacy.md).
The generated package lives in
[`plugins/chatgpt/agentics-beyond-code/`](plugins/chatgpt/agentics-beyond-code/).

### Skill layout in this repo

Skills have one canonical copy and several discovery views:

- `.github/skills/` contains the canonical skills and supports GitHub/Copilot discovery.
- `.agents/skills/` links to the canonical skills for Codex and open Agent Skills-compatible tools.
- `.claude/skills/` links to the canonical skills for Claude-style discovery.
- [`AGENTS.md`](AGENTS.md) provides portable repository guidance for coding agents.

The `agentic-workflows` skill is maintained upstream by GitHub Next. See
[`docs/skills.md`](docs/skills.md) for ownership, refresh, and validation guidance.

## 📖 Documentation

### Getting Started

- **[Getting Started](docs/setup.md)** — prerequisites, installation, and first run
- **[How It Works](docs/how-it-works.md)** — architecture, issue hierarchy, and customization
- **[Agent Skills](docs/skills.md)** — how the planner and platform builders fit together, ownership, and validation
- **[Skills Demo Script](docs/skills-demo-script.md)** — a 25-minute presenter walkthrough of each skill using the simulated org
- **[Release Blog Pipeline](docs/release-blog-pipeline.md)** — spec and build status for the GTM pipeline that turns an initiative's history into an approved, published release blog post (AI for Marketers Summit demo)
- **[FAQ](docs/faq.md)** — common questions about setup, workflows, and costs
- **[Workflow Ideas](docs/workflow-ideas.md)** — catalog of future workflow ideas for PM, ops, compliance, and GTM
- **[External Integration Patterns](docs/external-integration-patterns.md)** — future work for integrating with Slack, Jira, Microsoft 365, Google Workspace, Salesforce, ServiceNow, Notion, Asana, and Linear
- **[Slack Integration Plan](docs/slack-integration-plan.md)** — Slack context ingestion, emoji-driven automation, and Slack report-backs for the team's own internal workspace; three of five phases are built and live, the rest still proposal
- **[Google Docs Integration Plan](docs/google-docs-integration-plan.md)** — fixture-first proposal for bounded Google Docs context reads and validated document updates; the Weekly Status collaborative Google Doc flow (draft → shape → finalize → Slack) is built and was proven live on 2026-06-08 ([writeup](https://github.com/chrizbo/agentics-beyond-code/discussions/290)), currently paused pending an expired Google OAuth token refresh — the broader plan beyond that flow is still proposal

### Sample Team Context

> These docs represent a **fictional team** used as sample context for the workflows. Fork the repo and replace them with your own team's docs.

- **[How We Work](docs/how-we-work.md)** — team processes, meeting cadence, triage, and communication norms
- **[Strategic Tradeoffs](docs/strategy.md)** — the team's "even over" strategy statements, annotated with alignment evidence
- **[Fake Google Docs Scope](google-docs-fixtures/README.md)** — synthetic external product, customer, security, launch, and program documents for folder- or shared-drive-based Google Docs demos
- **[Launch Tracker Project](https://github.com/users/chrizbo/projects/1)** — the sample GitHub Project with issues, launches, and workflow-generated artifacts
- **[Intake Triage Project](https://github.com/users/chrizbo/projects/2)** — project board for triaging incoming feature requests and bug reports
- **[Customer Feedback Queue Project](https://github.com/users/chrizbo/projects/3)** — project board for cross-channel customer feedback, dedupe clusters, and strategy/priority triage
- **[Content Pipeline Project](https://github.com/users/chrizbo/projects/4)** — GTM content from brief to publish, one column per human approval gate (release blog pipeline)

## 🤝 Contributing

This is an early-stage project. We'd love ideas for workflows that help non-engineering roles work better with GitHub repos. Open an issue or submit a PR!

## 📖 Learn More

- [GitHub Agentic Workflows docs](https://github.github.io/gh-aw/)
- [Public preview announcement](https://github.blog/changelog/2026-06-11-github-agentic-workflows-is-now-in-public-preview/)
- [The Agentics (engineering-focused)](https://github.com/githubnext/agentics)

## 📬 Contact

Want to enable Agentics Beyond Code for your organization? Reach out to **Chris Butler**, the creator of this project:

- **Email:** [chrizbo@gmail.com](mailto:chrizbo@gmail.com)
- **LinkedIn:** [linkedin.com/in/chrisbu](https://www.linkedin.com/in/chrisbu/)

## 📄 License

[MIT](LICENSE)
