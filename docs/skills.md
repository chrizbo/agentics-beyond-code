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

After refreshing, update `.github/skills/agentic-workflows/.upstream-version` to the release used. The checked-in dispatcher and custom agent currently match gh-aw release `v0.89.21`, and the consumer Copilot setup installs `v0.89.21`.

The repository's installed CLI or generated workflow action versions can differ. Run `gh aw upgrade` separately when intentionally upgrading and recompiling the workflows themselves.

### Repo-owned skills

`.github/skills/non-coder-agentic-workflow-builder/` is maintained in this repository. Edit the canonical files there; the discovery links expose changes to other tools automatically.

`.github/skills/org-work-sensing/` is maintained in this repository. Use it for current-state assessment, readiness gap analysis, and work-signal review before recommending agentic workflow setup.

`.github/skills/claude-native-workflow-builder/` is maintained in this repository. Use it to port this repo's existing workflows (one, several, or a whole pipeline) — or design a new always-on automation from scratch — onto Claude Routines and Claude Scheduled Tasks instead of GitHub Agentic Workflows. It reads the current `.github/workflows/*.md`/`.yml` files directly rather than working from a separately maintained example, so the port stays current as those workflows change. The non-GitHub sibling of `non-coder-agentic-workflow-builder`.

`.github/skills/productboard-agent-builder/` is maintained in this repository. It adapts selected workflows into Productboard Spark instructions, preserving evidence and human decisions, and designs or configures verified schedules and triggers. It distinguishes native Spark execution from external agents connected to Productboard.

## Using the Productboard Agent Builder

Use `productboard-agent-builder` from a checkout of this repository or the
updated Claude plugin. The builder creates the Productboard instructions;
installing the builder does not install those generated skills in Productboard.
Source-based adaptations need a checkout or access to the plugin's recorded
public workflow sources.

Start with a draft:

```text
Use productboard-agent-builder to adapt Assumption Surfacer into a Productboard
Spark skill named assumption-surfacer. Read the source workflow. Analyze a brief
supplied in chat and return grounded questions without changing product records.
Show the instructions; do not deploy yet.
```

Then, when ready to create it:

```text
Create the prepared assumption-surfacer skill in my signed-in Productboard
workspace. Use Personal visibility and manual slash-command invocation. Check
for an existing match, avoid duplicates, and verify the persisted instructions
independently of browser-local drafts. Do not create a schedule.
```

Deployment defaults to browser automation, so it requires an available browser
control tool and a signed-in Productboard session with the appropriate access.
The MCP inspected during testing did not manage skills or schedules. The builder
rechecks direct API/MCP support when there is new capability evidence or when
asked, rather than repeating discovery on every request. Browser availability
depends on the host running the skill; installation does not provide that tool.

Scheduling is a separate request. Specify the skill, cadence, timezone, input,
output destination, and whether to activate it. The builder checks current
controls and distinguishes skill invocation settings from automation activation.
Native event/webhook triggering remains unverified; do not assume it works
because timed execution does.

### What has been tested

User-reported tests in one workspace on September 29, 2026 exercised browser
creation, updating without duplicates, independent verification of saved content,
manual invocation, native timed invocation, email receipt, and deletion of the
test automation while preserving the skill. These are bounded observations,
not guarantees for every workspace or permission level.

For a new adaptation, test a small fictional input and a case that should produce
no findings. Verify meaning and grounding rather than a fixed finding count.
If automation testing is needed, separate an authorized Manual run for invocation
and delivery from a timed run for scheduling. Agree on cleanup before activating
a temporary recurring test; deletion also removes its run history. A manual run
does not prove a schedule works, and completed execution does not prove delivery.

Detailed findings and unresolved limitations live in the skill's
[dated field observations](../.github/skills/productboard-agent-builder/references/observed-productboard-behavior.md).
Maintain those observations there rather than duplicating UI instructions here.
The repository checks below validate packaging and skill structure, not live
Productboard behavior.

## Validation

Run:

```bash
.github/scripts/sync-agent-skills.sh --check
```

The check verifies the discovery links, validates each `SKILL.md`, and reports gh-aw version alignment.

## Claude plugin distribution

Canonical skills remain here under `.github/skills/`. The directory plugin in
`plugins/agentics-beyond-code/` is generated from them and packaging inputs under
`packaging/claude/`. Do not edit generated copies or discovery links separately.
The root marketplace points to this generated package. After skill edits, run:

```bash
python3 .github/scripts/build-claude-plugin.py --sync
.github/scripts/sync-agent-skills.sh --check
python3 .github/scripts/build-claude-plugin.py --check
python3 -B .github/scripts/test-claude-plugin.py
```

See [Claude Cowork plugin](claude-cowork-plugin.md) for source-access differences,
versioning, release builds, and behavioral smoke tests.
