# Agent Skills

This repository exposes the same skills through several discovery conventions so they work across coding tools without maintaining divergent copies.

## Layout

| Path | Purpose |
|---|---|
| `.github/skills/` | Canonical skill files and GitHub/Copilot discovery |
| `.agents/skills/` | Relative links for Codex and open Agent Skills-compatible tools |
| `.claude/skills/` | Relative links for Claude-style skill discovery |
| `AGENTS.md` | Portable guidance and fallback pointers |

Relative links are checked into Git. On Windows, enable Git symlink support before cloning if the links are checked out as plain text files.

## Ownership

### GitHub Next-owned skill

`.github/skills/agentic-workflows/SKILL.md` is an upstream dispatcher maintained in [`github/gh-aw`](https://github.com/github/gh-aw). Keep it as an upstream snapshot and avoid repo-specific edits.

Refresh it with:

```bash
gh aw upgrade --no-fix
.github/scripts/sync-agent-skills.sh --check
```

`gh aw upgrade --no-fix` refreshes the upstream dispatcher and custom agent without applying workflow codemods, updating actions, or recompiling workflows. Review the resulting diff before committing.

After refreshing, update `.github/skills/agentic-workflows/.upstream-version` to the release used. The checked-in dispatcher and custom agent currently match gh-aw release `v0.79.6`, and the consumer Copilot setup installs `v0.79.6`.

The repository's installed CLI or generated workflow action versions can differ. Run `gh aw upgrade` separately when intentionally upgrading and recompiling the workflows themselves.

### Repo-owned skills

`.github/skills/non-coder-agentic-workflow-builder/` is maintained in this repository. Edit the canonical files there; the discovery links expose changes to other tools automatically.

`.github/skills/org-work-sensing/` is maintained in this repository. Use it for current-state assessment, readiness gap analysis, and work-signal review before recommending agentic workflow setup.

`.github/skills/claude-native-workflow-builder/` is maintained in this repository. Use it to port this repo's existing workflows (one, several, or a whole pipeline) — or design a new always-on automation from scratch — onto Claude Routines and Claude Scheduled Tasks instead of GitHub Agentic Workflows. It reads the current `.github/workflows/*.md`/`.yml` files directly rather than working from a separately maintained example, so the port stays current as those workflows change. The non-GitHub sibling of `non-coder-agentic-workflow-builder`.

## Validation

Run:

```bash
.github/scripts/sync-agent-skills.sh --check
```

The check verifies the discovery links, validates each `SKILL.md`, and reports gh-aw version alignment.
