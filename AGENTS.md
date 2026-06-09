# Repository Agent Guidance

## Skills

Use the repository skills when adapting or maintaining the agentic workflows:

- `agentic-workflows`: create, update, debug, compile, and upgrade GitHub Agentic Workflows.
- `non-coder-agentic-workflow-builder`: turn team and process problems into a repo setup using the workflows and operating artifacts in this repository.

Canonical skill files live in `.github/skills/`. Discovery links expose the same skills through:

- `.agents/skills/` for Codex and tools following the open Agent Skills convention.
- `.claude/skills/` for Claude-style skill discovery.

Do not edit the discovery links or their contents as separate copies.

## Ownership

The `agentic-workflows` skill is maintained upstream by GitHub Next in `github/gh-aw`. Keep its `SKILL.md` aligned with the gh-aw release used by this repository. Do not add repo-specific instructions to that skill.

The `non-coder-agentic-workflow-builder` skill is maintained by this repository and may be adapted here.

Run `.github/scripts/sync-agent-skills.sh --check` after changing skills. See `docs/skills.md` for the update procedure.
