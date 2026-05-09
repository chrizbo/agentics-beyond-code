# Frequently Asked Questions

## General

### What is this repo?

A collection of ready-to-use [GitHub Agentic Workflows](https://github.github.io/gh-aw/) for non-engineering roles — PMs, compliance teams, and leaders. The workflows read your existing GitHub Issues and Projects to generate readiness reports, compliance reviews, and go-to-market content automatically.

### Do I need to write code to use these workflows?

No. You customize behavior by editing markdown policy files in `.github/policies/`. The workflows themselves are compiled from markdown using `gh aw compile` — no YAML authoring required.

### How is this different from The Agentics?

[The Agentics](https://github.com/githubnext/agentics) focuses on engineering workflows (CI, code review, testing). **Agentics Beyond Code** covers the non-engineering side — launch tracking, compliance, and go-to-market content.

---

## Setup & Configuration

### What do I need to get started?

A GitHub repository with Issues and a Project board. See the [Getting Started guide](setup.md) for prerequisites, token setup, and first-run instructions.

### Can I use this with an existing project?

Yes. The workflows read from a GitHub Project and its linked issues. As long as your issues use the expected labels (`launch`, `initiative`, `epic`) and your project has the required custom fields (Phase, Target Date), everything works. See [setup.md](setup.md) for the full list.

### How do I change when a compliance review is required?

Edit the rubric section of the relevant policy file in `.github/policies/` (e.g., `security-review-policy.md`). Changes take effect on the next workflow run — no recompilation needed.

### How do I change the writing style for GTM content?

Edit `.github/policies/voice-and-tone-policy.md`. The GTM Content workflow reads it at runtime and applies it to all generated drafts.

---

## Workflows

### How often do the workflows run?

| Workflow | Schedule | Manual trigger? |
|----------|----------|-----------------|
| Launch Readiness Checker | Monday ~8:30 AM PT | Yes |
| Compliance Review | Monday ~8 AM PT | Yes |
| Compliance Team Reports | Monday ~8:45 AM PT | Yes |
| GTM Content | Monday ~8:15 AM PT | Yes |
| GTM Team Reports | Monday ~8 AM PT | Yes |
| Assumption Surfacer | On issue opened/edited | Yes |
| Decision Log | Daily on weekdays | Yes |
| Weekly Status | Friday ~8 AM PT | Yes |
| Workflow Health | Friday ~8 AM PT | Yes |
| Transcript Processor | On push to `/transcripts/` | Yes |
| Process Analyzer | Weekly | Yes |
| Sample Data Simulator | Daily on weekdays | Yes |

The **Sample Data Simulator** is for demo purposes only — it generates fake project activity so the other workflows have realistic data. You don't need it for production use. Trigger it manually anytime with `gh aw run sample-data-simulator` to add more content.

All workflows can also be triggered on demand with `gh aw run <workflow-name>`.

### What happens if I run a workflow twice?

Workflows are idempotent. They check for existing sub-issues, labels, and comments before creating new ones. On a second run, existing content is updated in place rather than duplicated.

### Can workflows conflict with each other?

Yes — workflows that run on the same schedule or modify the same resources (issues, labels, discussions) can interfere. For example, Monday-morning workflows may read stale data if another workflow is still updating labels. The **Workflow Health** report includes a **Cross-Workflow Interactions** section that detects these conflicts automatically each week: concurrent runs, shared resource modifications, label churn, and cascade chains (one workflow's output triggering another). Check the Friday health report for any 🔴 high-risk interactions and follow the recommended mitigations.

### Will workflows create issues I don't want?

Workflows only create sub-issues when their rubric or policy says one is needed. You control the criteria by editing the policy files. Sub-issues are always created as children of the relevant launch — they won't clutter your repo with orphaned issues.

### Do generated sub-issues get published automatically?

No. Compliance review sub-issues and GTM drafts are created as open issues for the DRI or reviewer to act on. Changelog drafts and roadmap items are explicitly marked as drafts that need human review before publishing.

---

## Compliance

### Which compliance teams are supported?

Four teams out of the box: **Security**, **Privacy**, **Accessibility**, and **Responsible AI**. Each has its own policy file with a rubric, review questions, and checklist.

### Can I add or remove compliance teams?

Yes, but it requires editing the workflow file (`compliance-review.md`) and creating or removing the corresponding policy file in `.github/policies/`. After changes, recompile with `gh aw compile compliance-review`.

### How do compliance labels work?

- `ai:needs:{team}` (e.g., `ai:needs:security`) — the workflow adds this when a review is required
- `approved:{team}` (e.g., `approved:security`) — a reviewer adds this manually when the review passes
- The Launch Readiness Checker factors these labels into its risk assessment

---

## GTM Content

### What content does the GTM workflow generate?

Two sub-issues per launch:
- **Changelog draft** — a customer-facing announcement post (created for Alpha phase and later)
- **Roadmap item** — a forward-looking description for public roadmaps (created for all phases)

### Why does the roadmap item only show a quarter, not a specific date?

Roadmap items are customer-facing. Sharing a specific internal target date creates false precision and sets expectations the team may not be able to meet. A quarter (e.g., "Q3 2026") communicates timing without over-committing.

---

## Decision Log

### How does the decision log detect decisions?

The workflow scans issue comments and transcript files for decision-signal language — phrases like "we decided to…", "the call is…", "going with option…", or "final decision:". It uses context clues to extract the decision, options considered, rationale, and participants.

### Where are decision records stored?

Individual markdown files in the `/decisions/` directory, named `YYYY-MM-DD-<slug>.md`. The workflow creates a PR with the new files so you can review before merging.

### Can I write decision records manually?

Yes. The `/decisions/` directory is just markdown files. You can create them manually following the same format, or edit the ones the workflow generates.

---

## Transcript Processing

### What transcript formats are supported?

Plain text (`.txt`) and WebVTT (`.vtt`) files. Drop them into the `/transcripts/` directory and push to trigger the workflow.

### How does the transcript processor match to issues?

It extracts key topics, names, and action items from the transcript and fuzzy-matches them against open issue titles, labels, and body content. Only high-confidence matches get comments posted.

### Will it create duplicate comments if I push the same transcript again?

The workflow checks for existing comments from the same transcript file to avoid duplicates.

---

## Process Analyzer & Weekly Retro

### What does the Process Analyzer do?

It runs weekly and reads all meeting transcripts from the past 7 days. It does three things:

1. **Posts a weekly retro Discussion** focused on *how* the team is working (collaboration patterns, blockers with process root causes, team energy, process health) — not what shipped (the Weekly Status workflow covers that)
2. **Detects process drift** by comparing what people describe in transcripts against `docs/how-we-work.md`. When drift is found, it creates a PR to update the doc
3. **Identifies automation candidates** — manual processes people mention that could be handled by a workflow — and files issues for strong candidates

### What is `docs/how-we-work.md`?

A living document describing how the team operates — meeting cadence, issue triage, PR review SLAs, on-call rotation, communication norms, and an inventory of what's already automated vs. still manual. The Process Analyzer keeps it current by detecting when the team's actual behavior drifts from what's documented.

> ⚠️ The included `docs/how-we-work.md` is **sample data** for demo purposes. Replace it with your actual team's processes before using in production.

### How does it detect process drift?

It looks for discrepancies between transcript discussion and the how-we-work doc — for example, someone saying "we moved design review to Thursday" when the doc says Wednesday, or "we're doing rotating triage now" when the doc says one person handles it. Only decided changes trigger a PR update; casual suggestions are noted but don't modify the doc.

### How is the weekly retro different from the Weekly Status report?

The **Weekly Status** covers *what* the team shipped, learned, and needs help with — it's a leadership status rollup. The **Process Analyzer retro** covers *how* the team is working — collaboration patterns, process friction, team energy, and whether documented processes match reality. They complement each other.

---

## Costs & Tokens

### Do workflows cost money to run?

Workflows use GitHub Copilot via GitHub Actions, which consumes [Copilot premium requests](https://docs.github.com/en/copilot/managing-copilot/managing-copilot-as-an-individual-subscriber/monitoring-usage-and-spending/avoiding-unexpected-copilot-costs). Each workflow run includes a cost estimate in its output so you can track spend.

### Can I control costs?

Yes. Workflows run on a weekly schedule (Monday/Friday mornings PT) — you can adjust the schedule or run them only on demand. Each workflow also has a `timeout-minutes` setting to cap execution time.
