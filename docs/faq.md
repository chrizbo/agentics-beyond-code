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
| Launch Readiness Checker | Weekly | Yes |
| Compliance Review | Weekly | Yes |
| Compliance Team Reports | Weekly | Yes |
| GTM Content | Weekly | Yes |

All workflows can also be triggered on demand with `gh aw run <workflow-name>`.

### What happens if I run a workflow twice?

Workflows are idempotent. They check for existing sub-issues, labels, and comments before creating new ones. On a second run, existing content is updated in place rather than duplicated.

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

- `needs:{team}` (e.g., `needs:security`) — the workflow adds this when a review is required
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

## Costs & Tokens

### Do workflows cost money to run?

Workflows use GitHub Copilot via GitHub Actions, which consumes [Copilot premium requests](https://docs.github.com/en/copilot/managing-copilot/managing-copilot-as-an-individual-subscriber/monitoring-usage-and-spending/avoiding-unexpected-copilot-costs). Each workflow run includes a cost estimate in its output so you can track spend.

### Can I control costs?

Yes. Workflows run weekly by default — you can adjust the schedule or run them only on demand. Each workflow also has a `timeout-minutes` setting to cap execution time.
