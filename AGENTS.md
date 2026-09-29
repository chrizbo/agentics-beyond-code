# Repository Agent Guidance

## Skills

Use the repository skills when adapting or maintaining the agentic workflows:

Skills follow one path: assess → design → build on a platform.

- `agentic-workflow-planner`: platform-neutral front door. Assess mode reviews current state, tool topology, readiness gaps, and operating signals. Design mode turns team problems into a workflow set and picks the platform.
- `github-workflow-builder`: build the design on GitHub (gh-aw workflows, docs, policies, issue templates, labels, project boards).
- `claude-native-workflow-builder`: build the design as Claude Routines and Scheduled Tasks.
- `productboard-agent-builder`: adapt workflows into Productboard Spark skills and configure supported schedules or triggers.
- `agentic-workflows`: create, update, debug, compile, and upgrade GitHub Agentic Workflows (upstream; not packaged in the Claude plugin).

Canonical skill files live in `.github/skills/`. Discovery links expose the same skills through:

- `.agents/skills/` for Codex and tools following the open Agent Skills convention.
- `.claude/skills/` for Claude-style skill discovery.

Do not edit the discovery links or their contents as separate copies.

## Ownership

The `agentic-workflows` skill is maintained upstream by GitHub Next in `github/gh-aw`. Keep its `SKILL.md` aligned with the gh-aw release used by this repository. Do not add repo-specific instructions to that skill.

The `agentic-workflow-planner`, `github-workflow-builder`, `claude-native-workflow-builder`, and `productboard-agent-builder` skills are maintained by this repository and may be adapted here. Keep platform-neutral intake and design guidance in the planner; keep builders limited to platform-specific steps.

Run `.github/scripts/sync-agent-skills.sh --check` after changing skills. See `docs/skills.md` for the update procedure.
