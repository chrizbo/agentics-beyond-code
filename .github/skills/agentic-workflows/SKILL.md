---
name: agentic-workflows
description: >
  Use this skill whenever the user asks about GitHub Agentic Workflows (gh-aw) in any form —
  creating new workflows, updating or improving existing ones, debugging failed runs, upgrading
  to new gh-aw versions, understanding safe-outputs, or choosing workflow architecture patterns.
  Trigger on: "create a workflow", "update the workflow", "why did this workflow fail", "debug
  this run", "upgrade workflows", "gh aw", "safe-outputs", "safeoutputs", ".github/workflows/*.md",
  "agentic workflow", "lock.yml", "gh aw compile", "gh aw run", or any question about workflow
  models, prompts, permissions, engines, or token costs. Also trigger when the user shares a
  workflow run URL or log and asks what went wrong.
---

# Agentic Workflows Skill

This skill routes GitHub Agentic Workflow (gh-aw) requests to the right specialized prompt.

## How to use this skill

1. Read the dispatcher at `prompts/` directory of this skill — specifically `agentic-workflows.agent.md` — for the full routing table.
2. Based on the user's intent, load and follow the matching prompt file from the `prompts/` directory below.
3. Keep responses concise and action-oriented.

## Routing quick-reference

| User intent | Prompt file |
|---|---|
| Create a new workflow | `prompts/create-agentic-workflow.md` |
| Update / improve an existing workflow | `prompts/update-agentic-workflow.md` |
| Debug a failed or misbehaving run | `prompts/debug-agentic-workflow.md` |
| Upgrade to a new gh-aw version | `prompts/upgrade-agentic-workflows.md` |
| Build a report-generating workflow | `prompts/report.md` |
| Create a shared/reusable component | `prompts/create-shared-agentic-workflow.md` |
| Fix Dependabot PRs on lock files | `prompts/dependabot.md` |
| Analyze or report on test coverage | `prompts/test-coverage.md` |
| Render ASCII charts in markdown | `prompts/asciicharts.md` |
| Run / compile / trigger via CLI | `prompts/cli-commands.md` |
| Reduce token costs / optimize | `prompts/token-optimization.md` |
| Choose workflow architecture/pattern | `prompts/patterns.md` |
| Understand safe-outputs options | `prompts/safe-outputs.md` |
| General gh-aw reference | `prompts/github-agentic-workflows.md` |

Read the full dispatcher (`agentic-workflows.agent.md`) for richer routing logic and combinations (e.g. report + OTEL, update + token-optimization).
