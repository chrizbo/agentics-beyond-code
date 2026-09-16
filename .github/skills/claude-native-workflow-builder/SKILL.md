---
name: claude-native-workflow-builder
description: >
  Use this skill when a user wants an always-on, org-owned automation built on
  Claude's own product surfaces — Claude Routines and Claude Scheduled Tasks —
  instead of GitHub Agentic Workflows, and wants it whether or not GitHub is
  the team's system of record. Trigger on requests like "set this up without
  GitHub", "build this as a Claude Routine", "schedule this with Claude",
  "make this work in Slack/Notion/Jira instead of GitHub", "show me the same
  pattern but not GitHub-specific", "turn this process into a Routine or
  Scheduled Task", or "I don't want to learn gh-aw, what are my options".
---

# Claude-Native Workflow Builder

This skill turns a plain-language process problem into an always-on
automation built with Claude Routines and Claude Scheduled Tasks: which one to
use per step, what triggers it, where the human interpretation gate lives, and
what org governance applies. It is the non-GitHub sibling of
[`non-coder-agentic-workflow-builder`](../non-coder-agentic-workflow-builder/SKILL.md) —
same philosophy (living documents, artifacts over roles, the PM/owner decides),
different execution engine.

Use this skill instead of `non-coder-agentic-workflow-builder` when the user's
system of record isn't GitHub, when they explicitly don't want a GitHub
Actions/gh-aw dependency, or when they want to see that the pattern this repo
teaches isn't tied to GitHub at all. Use `non-coder-agentic-workflow-builder`
when GitHub Issues/Projects/Discussions are the team's actual home.

## Core workflow

1. Ask for, or infer from the user's message:
   - the recurring process problem and its current manual steps
   - which steps need judgment (dedupe, scoring, drafting) versus which are
     purely mechanical (parsing, idempotency checks, formatting)
   - what triggers each step in real life today: a cadence ("every Friday"),
     an event ("when someone files feedback"), or an on-demand human action
     ("when the PM approves it")
   - where the team already looks for this kind of thing — Slack, email, a
     spreadsheet, Notion, Jira, Linear, Google Docs, or GitHub — per this
     repo's ["Your Habits Are Already Triggers"](../../../README.md#your-habits-are-already-triggers)
     philosophy; don't introduce a new surface if an existing habit works
   - who owns/governs the automation once it's running (a single person's
     Claude account, or a Team/Enterprise-owned routine an admin can see and
     disable)
   - what a human must approve before anything becomes durable or visible to
     others, and what's safe to happen automatically
2. Read `references/routine-vs-scheduled-task.md` for the full decision
   framework, trigger mechanics, and org-governance details.
3. For a concrete worked example of this exact porting exercise, read
   [`docs/cross-channel-customer-feedback-workflow-claude-native-spec.md`](../../../docs/cross-channel-customer-feedback-workflow-claude-native-spec.md),
   which takes this repo's GitHub-based cross-channel customer feedback
   workflow and rebuilds it stage-by-stage on Routines and Scheduled Tasks,
   including a variant with no GitHub artifacts at all.
4. Classify each step as a **Routine** (needs repo/file access, connectors, or
   multi-step tool use; triggered on a schedule, an API call, or a repo event)
   or a **Scheduled Task** (a recurring prompt against connectors that reads
   and posts a result; cadence-only, no repo needed). See the decision table
   in step 2's reference file.
5. Design the human interpretation gate explicitly. It should live wherever
   the team already reacts to things (a Slack thread, a doc comment, a status
   column), and only an explicit human action should trigger any step that
   commits the team to work, spends money, or becomes visible outside the
   automation's own draft surface.
6. Produce a setup plan, not vague advice: per step, name the trigger type,
   the connectors/access it needs, the destination it writes to, the human
   gate before anything durable happens, and the org-governance control that
   applies (Team/Enterprise Owner routine toggle, or workspace-level Scheduled
   Task admin controls).
7. If the user wants it actually created, point them at the real mechanism
   rather than editing files on their behalf: the `/schedule` command or
   `claude.ai/code` web UI for Routines, and the Claude Cowork UI or
   scheduled-tasks tools for Scheduled Tasks. This skill produces the plan and
   the prompt text to use there; it does not fabricate a live routine by
   writing repo files, because there is no file-based equivalent of a Routine
   or Scheduled Task the way a `.md` workflow file is the source of truth for
   gh-aw.
8. If the user's actual system of record is GitHub and they have no objection
   to GitHub Actions, say so and route to `agentic-workflows` and
   `non-coder-agentic-workflow-builder` instead — don't force the non-GitHub
   answer on a team for whom GitHub already works.

## Output standard

When the user asks for a recommendation only, produce a concise setup plan
with, per step:

- step name and what problem it solves
- Routine or Scheduled Task, and why
- trigger (schedule / API / repo event / cadence / on demand)
- connectors and access needed
- destination (where the output lands)
- the human gate, if any, and who owns the decision
- org-governance control that applies

Then a rollout order: which steps to stand up first, and what needs to exist
(a channel, a sheet, a connector) before that step can run.

When the user asks to actually build it, help them write the exact prompt text
for the Routine or Scheduled Task (what to read, what judgment to apply, what
to write and where, what never to do without a human saying so), then point
them at the real setup surface from step 7 above.

## Important defaults

- Don't assume GitHub is the wrong choice by default — ask. This skill exists
  for when GitHub genuinely isn't the team's surface, not to talk every user
  out of `non-coder-agentic-workflow-builder`.
- Keep the same artifact-centered discipline as the rest of this repo: every
  automation produces something a human can read and act on (a report, a
  drafted item, a comment), never a silent action taken on someone's behalf.
- Deterministic steps (parsing, idempotency checks, formatting) stay
  deterministic even in a Routine — don't spend a model call on something a
  script does reliably and cheaper.
- Prefer a Scheduled Task over a Routine whenever the step doesn't need repo
  or file access — it's the lighter-weight primitive and doesn't require a
  dev environment.
- Treat "who can see and disable this" as a required design question, not an
  afterthought. An always-on, org-owned automation needs an owner and an off
  switch before it needs more capability.
- Reuse this repo's existing fixture-first discipline: prove the pipeline
  against fixtures before wiring live connectors, the same way the GitHub
  workflows in this repo do.
- Never let the automation itself decide that something is ready to become
  committed work, spend money, or go out externally — that step stays an
  explicit human trigger, regardless of which engine runs the automation.
