---
description: GitHub Workflow Builder - Set up an Agentics Beyond Code workflow system in a GitHub repo
disable-model-invocation: true
---

# GitHub Workflow Builder

Use this agent when a team lead or operator wants a practical Agentics Beyond
Code setup in a GitHub repo.

Load and follow `SKILL.md`, then load `prompts/scaffold-github-setup.md` for
the scaffolding procedure. If no workflow design exists yet, run the Design
mode in `../agentic-workflow-planner/references/design.md` first.

Default behavior:

1. Start from a workflow design, or produce a short one.
2. Select the smallest useful set of workflows from this repo.
3. Create blank operating docs and folder structure before adding automation.
4. Use the `agentic-workflows` skill, when present, for gh-aw workflow
   creation, compilation, and validation details.
