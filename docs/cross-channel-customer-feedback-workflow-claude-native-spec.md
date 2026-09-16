# Cross-Channel Customer Feedback Workflow: Claude-Native Variant

This is a companion to
[`docs/cross-channel-customer-feedback-workflow-spec.md`](cross-channel-customer-feedback-workflow-spec.md).
Same problem, same human-ownership model, same artifacts where it still makes
sense — but the execution engine is [Claude Routines](https://code.claude.com/docs/en/routines)
and [Claude Scheduled Tasks](https://claude.com/blog/introducing-routines-in-claude-code)
instead of GitHub Agentic Workflows (gh-aw) and GitHub Actions.

The point of this variant is not that GitHub is a bad choice — the original spec's
project board, issues, and sub-issue duplicate linking are genuinely good fits for
a feedback queue. The point is that the **pattern** (deterministic adapters →
normalized queue → agent triage → human interpretation gate → agent conversion →
recurring trend report) is not GitHub-shaped. It is shaped by the problem. This
doc proves that by rebuilding it on an entirely different always-on substrate: no
GitHub Actions, no YAML workflow compiler, no repo required for the parts that
don't need one.

Read the original spec first for the parts that don't change: the
[Problem](cross-channel-customer-feedback-workflow-spec.md#problem),
[Human Ownership Model](cross-channel-customer-feedback-workflow-spec.md#human-ownership-model),
[Language Preservation Principle](cross-channel-customer-feedback-workflow-spec.md#language-preservation-principle),
and [Privacy and Safety Boundaries](cross-channel-customer-feedback-workflow-spec.md#privacy-and-safety-boundaries)
apply unchanged. What follows covers only what's different.

## Why this proves portability

Three things are specific to the original implementation that this variant
deliberately does not reuse:

1. **The execution engine.** The original runs on GitHub Actions, compiled from
   markdown by the gh-aw framework, triggered by `workflow_dispatch`,
   `schedule:`, `issues`, and `slash_command:` events. This variant runs on
   Claude's own product surfaces: **Routines** (configured once — prompt, repo,
   connectors — then triggered on a schedule, an API call, or a repo event) and
   **Scheduled Tasks** (a recurring prompt on a cadence, no repo or dev
   environment required). Both run on Anthropic-managed infrastructure and keep
   working when a laptop is closed, same as GitHub Actions does — "always-on"
   isn't a GitHub property.
2. **Org ownership and governance.** The original is governed by repo
   permissions, `on.roles`, and `safe-outputs`. This variant is governed the
   same way conceptually — a human-reviewable gate before anything writes
   somewhere durable — but the admin control is a Team/Enterprise owner toggle
   (`claude.ai/admin-settings/claude-code`) rather than a repo setting, and the
   write boundary is enforced by which connectors and destinations the routine
   or task is configured with, not by a `safe-outputs:` block in YAML.
3. **The durable store.** The original uses GitHub Issues and a GitHub Project.
   This variant shows the queue and the report living in Slack and a shared
   spreadsheet instead, to make the "not GitHub-specific" claim concrete rather
   than aspirational. Section [Fully Non-GitHub Variant](#fully-non-github-variant)
   below is the one to point to if someone asks "okay but does this *actually*
   work without GitHub."

Everything else — exact-language preservation, the PM interpretation gate,
duplicate handling as evidence-linking rather than silent merge, redaction
before conversion — is unchanged, because none of that was ever a GitHub
property either.

## Routine vs. Scheduled Task

Both are always-on and org-owned. The difference is what they need to run.

| | Claude Routine | Claude Scheduled Task |
|---|---|---|
| Needs a repo/dev environment | Yes | No |
| Needs connectors (Slack, Google, custom MCP, etc.) | Yes, configured per routine | Yes, whatever the Cowork session has |
| Trigger types | Scheduled (cron-like cadence, or once at a future time), API (HTTP POST with a bearer token), GitHub (repo events like PRs or releases) | Cadence only (daily, weekly, weekdays, hourly), or on demand |
| Best for | Multi-step tool use against a codebase or structured data: dedupe reasoning, drafting a work item with acceptance criteria, anything that reads/writes files or runs scripts | A recurring prompt that reads from connectors and writes a report or message: a digest, a trend summary, a status post |
| Org control | Team/Enterprise Owners can disable routines org-wide | Governed by whatever admin controls exist for the Cowork/Claude.ai workspace |
| Setup | `claude.ai/code` web UI or the `/schedule` command in Claude Code | Claude Cowork UI or the scheduled-tasks API |

Rule of thumb used throughout this doc: if the step needs judgment applied to a
changing body of evidence (dedupe, strategy-fit scoring, drafting a work item),
it's a **Routine**. If the step is "run this prompt on a cadence and post the
result," it's a **Scheduled Task**. A few steps can be either; the table below
calls out which one each stage in this repo actually uses and why.

## Stage-by-Stage Port

| # | Stage (from the original spec) | Original engine | Claude-native engine | Trigger | Destination in this port |
|---|---|---|---|---|---|
| 1 | Feedback Source Normalizers | Deterministic GitHub Action script | Deterministic script, unchanged — still not an agent step | Called by stage 2's routine as a pre-step, or run standalone | `feedback-events/*.json` (same schema, same files) |
| 2 | Feedback Intake Creator | `customer-feedback-intake.yml` (GitHub Action) | Routine, API-triggered | API call from wherever the source event originates (a Slack app, a webhook relay, or run manually) | GitHub issue **or** a Slack channel post **or** a spreadsheet row — see [Fully Non-GitHub Variant](#fully-non-github-variant) |
| 3 | Dedupe, Strategy Triage, Priority Suggestion | `feedback-dedupe-triage.md` (agentic workflow) | Routine, scheduled | Daily or a few times a week | Comments/labels on the same destination as stage 2 |
| 4 | PM Interpretation Gate | Issue labels and comments | Unchanged in spirit — a human reacts in whatever surface stage 2/3 wrote to | N/A (human action) | A Slack thread reply, a spreadsheet status column, or a GitHub label — whatever the team already watches |
| 5 | Feedback-to-Work-Item Converter | `create-work-item.md`, `slash_command:` trigger | Routine, API-triggered | A Slack slash command or button posts to the routine's API endpoint | New work item in the team's tracker (GitHub issue, Linear, Notion — whatever stage 4 feeds) |
| 6 | Friday Feedback Trends Report | `friday-feedback-trends-report.md` (scheduled agentic workflow) | Scheduled Task | Weekly, Friday morning | Slack channel post, email, or a Google Doc — no repo required |
| 7 | Feedback Fixture Simulator | `sample-data-simulator.md`-style workflow | Scheduled Task or Routine, whichever matches where fixtures live | Manual or scheduled | Same fixture folders |

Why stage 2 (intake) is a **Routine** and not a Scheduled Task even though it's
deterministic: it needs repo/file access to write normalized events and check
idempotency keys against existing records, and API-trigger routines are the
right shape for "fire when a new feedback item shows up" rather than "run every
N hours and hope nothing was missed." Stage 6 (the trends report) is the
opposite case — read from connectors, apply judgment, post a summary,
no file writes needed — which is exactly what a Scheduled Task is for.

## Mapping the Human Ownership Model onto native surfaces

The original spec's bright line still holds: deterministic adapters collect
evidence, agents cluster/score/draft, the PM decides. What changes is *where*
the PM makes that decision, because "comment `/create-work-item` on a GitHub
issue" assumes GitHub is the team's home surface. This repo's own philosophy
already covers this — see
["Your Habits Are Already Triggers"](../README.md#your-habits-are-already-triggers)
in the README — and it applies directly here:

- If the team lives in Slack: the PM's interpretation is a thread reply; a
  specific emoji reaction (mirroring
  [`slack-reaction-intake.md`](../.github/workflows/slack-reaction-intake.md))
  or a slash command is the trigger for stage 5's API call.
- If the team lives in a spreadsheet or Notion: the PM's interpretation is a
  status-column change or a checkbox; the routine polls or is triggered by the
  connector's own automation (a Notion database automation, an Airtable
  automation) calling the routine's API endpoint.
- If the team still lives in GitHub: nothing changes from the original spec
  except the compute engine underneath.

The rule that should never move regardless of surface: **only an explicit human
action triggers conversion.** A scheduled or API-triggered routine may draft,
label, comment, or flag — it should never itself decide that a piece of
feedback is ready to become committed work.

## Fully Non-GitHub Variant

A concrete version to demo the "isn't specific to GitHub" claim, reusing this
repo's existing fixtures and Slack conventions
([`docs/slack-integration-plan.md`](slack-integration-plan.md)) so it isn't
hypothetical:

- **Queue:** a Google Sheet (or Airtable base) with one row per feedback item —
  source, exact phrases, terminology, dedupe key, status, suggested priority —
  standing in for the GitHub Project fields in the original spec.
- **Stage 2 (intake), Routine, API-triggered:** normalizes a fixture or live
  source event, checks the sheet for an existing `idempotency_key`, appends a
  row if new.
- **Stage 3 (dedupe/triage), Routine, scheduled daily:** reads the sheet,
  clusters likely duplicates, writes a triage comment and suggested priority
  back into the row, and posts a short summary of anything needing PM review
  into a `#customer-feedback` Slack channel — mirroring
  [`slack-report-back-dispatch.yml`](../.github/workflows/slack-report-back-dispatch.yml)'s
  "close the loop in Slack" pattern, but from a Routine instead of a workflow.
- **Stage 4 (PM gate):** the PM reacts to the Slack summary post — an emoji for
  "accept," a thread reply for "needs more info" — same habit-as-trigger
  pattern as `slack-reaction-intake.md`, just without a GitHub issue underneath
  it.
- **Stage 5 (conversion), Routine, API-triggered:** the PM's Slack reaction
  fires a small relay (a Slack app event handler, or a person running a short
  slash command) that calls the routine's API endpoint; the routine drafts the
  work item and writes it into whatever tracker the team actually uses
  (Linear, Notion, Jira — or still GitHub, if that's where engineering work
  lives even when feedback intake isn't there).
- **Stage 6 (Friday report), Scheduled Task, weekly:** reads the sheet, posts a
  formatted summary directly into `#customer-feedback` — no repo, no
  Discussion, no gh-aw compile step.

Nothing in this variant is GitHub. The only thing carried over on purpose is
the shape of the pipeline and the non-negotiable human gate.

## What stays constant either way

- The [Normalized Feedback Event Schema](cross-channel-customer-feedback-workflow-spec.md#normalized-feedback-event-schema)
  from the original spec. Whatever the destination, adapters should still
  converge on that shape — it's the contract, not a GitHub artifact.
- The [Fixtures vs. Live Integrations](cross-channel-customer-feedback-workflow-spec.md#fixtures-vs-live-integrations)
  discipline: fixtures model the source shape, stable IDs, permalinks, and
  redaction behavior regardless of which engine consumes them.
- The [Privacy and Safety Boundaries](cross-channel-customer-feedback-workflow-spec.md#privacy-and-safety-boundaries):
  treat community feedback as untrusted content, redact before anything
  durable is written, and use read-only default access with a narrow,
  explicit write surface — the equivalent of `safe-outputs` here is scoping
  each routine/task to only the connectors and write actions it actually
  needs, and reviewing that scope the same way a `safe-outputs:` block gets
  reviewed.

## Setup Mechanics

When it's time to actually stand this up (not covered by this spec — see the
[`claude-native-workflow-builder`](../.github/skills/claude-native-workflow-builder/SKILL.md)
skill for the setup conversation):

- Routines: `claude.ai/code` web UI, or the `/schedule` command in Claude Code.
  A Team/Enterprise Owner can see and disable all org routines from
  `claude.ai/admin-settings/claude-code`.
- Scheduled Tasks: the Claude Cowork UI, or the scheduled-tasks API/MCP tools
  where available in a session.
- Both need the same pre-work as the original spec's live integration path:
  channel/repo allowlists, read-only default permissions, stable idempotency
  keys, a max-items-per-run limit, and a fixture replay mode for tests and
  demos.

## Open Questions

- Where does org-level audit logging live for a Routine that writes to Slack
  or a spreadsheet instead of GitHub? The original spec gets this for free
  from GitHub's own audit log and issue timeline; a non-GitHub destination
  needs an explicit answer (sheet revision history, Slack's own audit log, or
  a lightweight append-only log the routine writes itself).
- Sub-issue-style duplicate linking has no direct spreadsheet or Slack
  equivalent. A parent/child column pair in the sheet, or a threaded Slack
  reply, both work but neither is as durable or as easy to query as GitHub's
  native sub-issues.
- Whether a single routine should own both stage 2 and stage 3, versus keeping
  them separate the way the original spec keeps intake (deterministic) and
  triage (agentic) as distinct automations. Keeping them separate stayed the
  right call in the port for the same reason it was right originally: token
  usage and blast radius stay smaller when parsing and idempotency checks
  don't share a run with judgment calls.
