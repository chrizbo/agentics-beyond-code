---
description: Field-by-field mapping from a gh-aw workflow's frontmatter to a Claude Routine or Scheduled Task, the capability gaps to actively look for, and the safety-model gap to flag when porting.
disable-model-invocation: true
---

# Porting a gh-aw Workflow to a Routine or Scheduled Task

Use this after `claude-native-workflow-builder` has read the current
`.github/workflows/<name>.md` or `.yml` file for the workflow being ported.
Always read the live file — see the "read live, not frozen" default in
`SKILL.md`. This reference explains what to do with what you find in it.

## Verify against live docs before finalizing a port — this file goes stale too

The table below is this skill's current understanding, not a guarantee. Both
sides of this port are products that change on their own schedule, not on this
repo's: Claude Routines is explicitly labeled "research preview — behavior,
limits, and the API surface may change" in its own docs, and gh-aw ships new
releases regularly (this repo tracks a specific pinned version in
`.github/skills/agentic-workflows/.upstream-version` for exactly that reason).
A hardcoded comparison table is subject to the same drift this skill exists to
avoid — see the "read live, not frozen" default this reference already
inherits from `SKILL.md`.

Before finalizing a port, especially for anything below marked as
"no equivalent" or "check the current UI," reverify against:

- **Claude Routines**: fetch [code.claude.com/docs/en/routines](https://code.claude.com/docs/en/routines)
  (and linked pages like cloud environments, MCP connectors, or desktop
  scheduled tasks, if relevant to the specific workflow) rather than trusting
  this file's summary of what it supports.
- **gh-aw**: for the specific feature the workflow being ported actually uses
  (a particular `safe-outputs:` type, a particular `on:` trigger, a particular
  tool), check the matching upstream doc the `agentic-workflows` skill already
  routes to (e.g. `safe-outputs-automation.md`, `safe-outputs-content.md`,
  `github-agentic-workflows.md`) or [github.github.io/gh-aw](https://github.github.io/gh-aw/),
  not just this table's one-line summary of it.

Don't treat the table as exhaustive, either. gh-aw adds new `safe-outputs:`
types, new `on:` triggers, and new tool integrations over time, and Routines'
own feature set changes independently. If the workflow being ported uses
something not listed below, that's a signal to go check both docs, not a
signal that no gap exists. When you find a capability the workflow relies on
that Routines/Scheduled Tasks can't currently do — not just the ones
enumerated here — name it explicitly to the user the same way the
`safe-outputs:` gap is named below, rather than silently dropping or
approximating the behavior.

## The gap that matters most: `safe-outputs:`

gh-aw workflows declare a **structurally enforced** write boundary in their
`safe-outputs:` block — a max number of comments, an explicit allowed-labels
list, which project to update, whether body edits are permitted at all. The
framework enforces these outside the model's control; the agent cannot exceed
them no matter what the prompt says or what the model decides mid-run.

Routines have no equivalent. Per the product docs: routine sessions "run
autonomously as full Claude Code cloud sessions: there is no permission-mode
picker and no approval prompts during a run," and can "run shell commands...
and call any connectors you include." Whatever the connectors and repo access
allow, the session can do — the prompt is the only boundary, and it's an
instruction, not an enforcement mechanism.

This means porting a `safe-outputs:`-constrained workflow is not a syntax
translation — it's a real reduction in structural safety unless compensated
for. When porting:

1. **Restate every constraint explicitly and forcefully in the routine's
   prompt** — the exact max counts, the exact allowed label list, "never edit
   the issue body," "never touch any label not on this list." Treat the
   original `safe-outputs:` block as the spec for what the prompt must say.
2. **Scope connectors and repo access as the real enforcement layer.** A
   routine given only a GitHub connector scoped to one repo, with no write
   access to anything else, can't exceed its intended blast radius even if the
   prompt is imperfectly followed. Don't hand a ported routine broader access
   than the original workflow's `permissions:` block granted.
3. **Say this out loud to the user.** Don't silently port a workflow that
   relied on hard caps into one that relies entirely on the model reading
   instructions carefully. Name the gap and let them decide if that's an
   acceptable tradeoff for this particular workflow, or a reason to keep it on
   gh-aw.

## Field mapping (starting checklist — verify volatile rows live)

| gh-aw frontmatter field | Routine / Scheduled Task equivalent |
|---|---|
| `on: workflow_dispatch` | Manual — no trigger needed, or an **API** trigger if something else should fire it on demand |
| `on: schedule` | **Scheduled** trigger, same cadence |
| `on: issues:` / `on: pull_request:` | **GitHub** trigger (Routine only) — check the current routine editor for which event categories are actually selectable (see `routine-vs-scheduled-task.md`); not every gh-aw event type has a matching category yet |
| `on: slash_command:` | No direct equivalent — a Routine can't parse "is this comment's first word a specific command." Use an **API** trigger and have something else (a person running a script, a Slack app, a thin relay) call it when the command is seen. Keep the human-initiated nature: this should still require an explicit human action, never fire automatically |
| `engine:` (model id) | The prompt input's model selector when creating the routine |
| `steps:` (deterministic pre-steps) | Fold into the prompt as explicit shell commands — Routine sessions have bash access, same as gh-aw's `tools.bash`. Keep them deterministic in instruction ("run this exact script, don't improvise its logic") rather than describing what the step does and hoping the model reimplements it |
| `tools.bash` | Native to the routine session — no configuration needed |
| `tools.github` (mode/toolsets/lockdown/allowed-repos) | The routine's connected GitHub identity/connector plus which repositories are added to the routine. There's no declarative toolset/lockdown equivalent — scope it by which repos you add and which connectors you include, and say the intended scope explicitly in the prompt |
| `safe-outputs:` | No structural equivalent — see above. Restate explicitly in the prompt and scope via connectors/repo access |
| `permissions:` (read/write GH scopes) | No fine-grained per-workflow scope. Access is whatever the routine's connected GitHub identity and connectors allow — scope narrowly at the connector/repo level instead |
| `network.allowed` | The routine's cloud [environment](https://code.claude.com/docs/en/cloud-environments) network access setting (Trusted/Custom/Full + Allowed domains) |
| `strict`, `timeout-minutes`, `max-ai-credits` | No per-routine equivalent found in current docs. Usage is governed by the account's daily routine run cap and subscription limits, not a per-workflow cap — flag this as a difference, not a like-for-like port |
| `concurrency:` | No declarative equivalent — each triggering event starts an independent session; if the original workflow depended on concurrency grouping to avoid overlapping runs, say so and note the routine may need the prompt itself to check for in-flight duplicates |
| prompt body (the markdown after the frontmatter) | Becomes the routine's prompt largely as-is. Translate `${{ github.event.* }}` and `${{ inputs.* }}` expressions: manual-input values become either a static instruction, or the API trigger's optional `text` field (wrapped as untrusted `<routine-fire-payload>` data — the prompt must explicitly reference it to act on it) |

## What to hand back

One labeled block per ported workflow (see `SKILL.md`'s Output standard):
which source file it came from, the trigger to configure, the model to
select, and the full prompt text with every safe-outputs constraint and scope
limitation restated. Include a short **Capability gaps** note listing
anything the original workflow could do that the port can't do the same way —
the `safe-outputs:` enforcement gap if relevant, plus anything else found by
checking live docs per the section above. Don't present a port as a clean
equivalent when it isn't one.
