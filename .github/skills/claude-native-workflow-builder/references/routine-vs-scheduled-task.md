---
description: Decision framework for choosing between a Claude Routine and a Claude Scheduled Task per automation step, plus trigger mechanics and org-governance notes.
disable-model-invocation: true
---

# Routine vs. Scheduled Task: Decision Framework

Use this after the `claude-native-workflow-builder` skill triggers, once the
user's process problem and its steps are understood.

## The two primitives

**Claude Routine** (Claude Code): configured once — a prompt, a repo, and
connectors — then run on a trigger. Runs on Anthropic-managed cloud
infrastructure, or an organization's self-hosted environment when routed
there, so it keeps working when a laptop is closed. Needs a repo/dev
environment context even when the "repo" is just a place to keep prompt state
and logs.

**Claude Scheduled Task** (Claude Cowork / claude.ai): a recurring prompt on a
cadence — daily, weekly, weekdays, hourly, or on demand. No repo or dev
environment required. Runs against whatever connectors the session has.

Both are always-on in the sense that matters for this repo's philosophy:
neither depends on a human remembering to open an app and click "run."

## Decision table

| Signal | Choose Routine | Choose Scheduled Task |
|---|---|---|
| Needs to read/write files, run scripts, or check state against a repo | Yes | No |
| Needs multi-step tool use with judgment applied across steps (dedupe, then triage, then draft) | Yes | Maybe — a single well-scoped prompt can do simpler multi-step reasoning without file state |
| Trigger is an external event (an API call, a repo event) rather than a clock | Yes — Routines support API and GitHub-event triggers | No — Scheduled Tasks are cadence-only |
| Trigger is purely "every N hours/days" | Either works | Prefer Scheduled Task — lighter weight, no dev environment to provision |
| Output is a report, digest, or message posted somewhere | Either works | Prefer Scheduled Task if no file/repo access is needed to produce it |
| Needs idempotency checks against structured records (has this item already been processed?) | Yes, if those records live in files/a repo | Only if the connector itself exposes a queryable store (a spreadsheet, a database) the task can check without file access |

When a step could go either way, default to the lighter-weight primitive
(Scheduled Task) and only move to a Routine when the step's needs outgrow it —
same instinct as this repo's own guidance to keep deterministic steps
deterministic and agentic steps narrowly scoped.

## Trigger mechanics

**Routines** support three trigger types, and a routine can have more than
one attached:

- **Scheduled** — a recurring cadence (hourly, nightly, weekly) or once at a
  specific future time.
- **API** — an HTTP POST to a per-routine endpoint with a bearer token. This
  is the right trigger for "fire when something happens" without waiting for
  the next scheduled run — e.g., a Slack slash command or a webhook relay
  calling the endpoint the moment a PM approves something.
- **GitHub** — runs automatically in response to repository events. Exactly
  which event categories are selectable has been observed to disagree between
  the docs page and the live routine editor, and even between two checks of
  the live docs in the same week — treat "Pull request" and "Release" as the
  only ones you can count on, and confirm anything else (an "Issue opened"
  category has been seen selectable in the UI at least once) against the
  current UI at the moment you're setting this up, not against this file or
  any prior conversation's finding. A generic "Custom" event option is
  visible but greyed out; it's a reserved slot for broader webhook/event
  support, not something gated by plan or permissions. Useful even in a "not
  GitHub-specific" design if the only GitHub-shaped thing left in the pipeline
  is a repo event worth reacting to; it doesn't require the rest of the
  pipeline to be GitHub-based.

**Scheduled Tasks** support cadence (daily, weekly, weekdays, hourly) and
on-demand runs. There is no API-trigger equivalent — if a step genuinely needs
to fire on an external event rather than a clock, it needs a Routine instead.

## Org governance

- **Routines**: available on Pro, Max, Team, and Enterprise plans. Team and
  Enterprise Owners can disable routines for all members from
  `claude.ai/admin-settings/claude-code`. When designing an org-owned routine,
  name who the owner is and confirm they know this toggle exists — it's the
  equivalent of a repo admin being able to disable a GitHub Actions workflow.
- **Scheduled Tasks**: governed by whatever admin controls exist for the
  Cowork/claude.ai workspace the task runs in. Confirm the same thing: who can
  see it, who can stop it, and whether it's tied to an individual's account or
  a shared workspace identity.
- Either way, the equivalent of this repo's `safe-outputs:` discipline is
  **connector scoping**: give the routine or task only the connectors and
  write actions it actually needs, and review that scope the way a
  `safe-outputs:` block in a gh-aw workflow gets reviewed. A routine with
  broad Slack-posting access and broad repo-write access when it only needs
  read-Slack/write-one-channel is over-scoped the same way an overly broad
  `permissions:` block would be in GitHub Actions.

## Setup surfaces

These are the actual places a user goes to create these, once the plan from
`claude-native-workflow-builder` is ready:

- Routines: the `/schedule` command in Claude Code, or the `claude.ai/code`
  web UI.
- Scheduled Tasks: the Claude Cowork UI, or the scheduled-tasks tools/API
  where available in a session.

This skill helps design the plan and write the prompt text. It does not
create a live Routine or Scheduled Task by writing files to a repo — unlike a
gh-aw workflow, there is no `.md`/`.yml` source-of-truth file that defines
one. Hand the user the finished prompt text and point them at the real setup
surface.
