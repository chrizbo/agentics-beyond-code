# Reading a workflow source

How to read one of this repository's `.github/workflows/*.md` files before
porting it to any platform. Builders use this to extract the workflow
contract. Read the parts in this order; earlier parts carry more of the
workflow's meaning.

## 1. Purpose and output contract (the body)

The markdown body below the frontmatter is the real specification. Extract:

- the artifact it produces and its template (headings, tables, fields)
- rules the body marks as important, required, or "always" (for example
  "always populate Impact"). These are hard rules; port them or list them as
  broken.
- what counts and what doesn't (inclusion and exclusion criteria)
- the empty and no-op outcome (for example "call `noop`" or "No new decisions
  detected"), and whether that outcome writes anything
- human review wording (for example "review each decision")

## 2. Triggers, including paused schedules

Read the `on:` block.

- **Active triggers** are the uncommented ones: `workflow_dispatch`, `issues`,
  `issue_comment`, `push`, labels, and so on.
- **Paused schedules.** This repository is a demo: its reporting workflows
  have their schedule commented out with a marker such as
  `#  schedule: (disabled — re-enable to run on a schedule) "0 7 * * 2-6"`.
  They were paused so the demo repo doesn't run automations all the time.
  The pause is not the workflow's design. Treat the commented cadence as the
  **intended trigger**:
  - port that cadence, and keep `workflow_dispatch` as the manual trigger
  - ship the schedule turned off or disabled
  - tell the user the source paused it for the demo, and give "Turning on the
    schedule" guidance in the deliverable (see below)
- **Paused with a readiness reason.** A marker that gives a condition, such
  as `(disabled — re-enable once signal quality is validated)`, is a real
  caveat. Carry the condition into the "Turning on the schedule" guidance as
  a prerequisite, not just a switch.
- **Commented out with no marker.** Treat it as inactive and ask whether the
  team wants it.

### Turning on the schedule

When a port's schedule starts off, include a short section with:

- why it is off: paused in the source repo for the demo, or the stated
  readiness condition
- what to check first: the first test passed, the owner is named, run volume
  fits any quota or credit limits, and the destination is the real one rather
  than a test space
- exactly how to turn it on and off on the target platform
- what one run costs (runs, credits, or notifications), so the owner knows
  what "on" means

Never turn a schedule on as part of drafting. Turning it on needs the user's
explicit authorization, as with any deployment.

## 3. Inputs: pre-fetch steps, scripts, and imports

- `steps:` run before the agent. Read any script they call (for example
  `.github/scripts/fetch-launch-data.sh`) and name the fields it produces
  (phase, target date, risk level, sub-issue tree). Those fields are inputs
  the port must reproduce or list as missing.
- `imports:` pull in shared instructions. Read each one:
  - `shared/freshness-check.md` is **demo scaffolding**. It skips runs when
    the sample-data simulator is paused, and its own note says to remove it
    in live deployments. Drop it and say why.
  - `shared/*-safe-outputs.md` files (Slack, calendar) carry write limits.
    Treat them like the `safe-outputs` block.
- Fixture folders (`google-calendar-fixtures/`, `google-docs-fixtures/`,
  `slack-fixtures/`, `feedback-fixtures/`) and the sample-data simulator are
  demo inputs. Use them for walkthroughs; never port them as the team's data.

## 4. Writes and limits: `safe-outputs`

This block is the enforced boundary on what the workflow may change.
Translate each entry into behavior, not configuration names:

- which kinds of write, and how many per run (`max: 1` becomes "at most one
  review PR per run")
- `auto-merge: true` with `draft: false` means **no human gate** before the
  write lands. Don't invent one, but you may offer one as a new choice.
- `mentions: false` means don't notify people by name
- title prefixes and allowed labels are exact values to keep

## 5. Downstream consumers

Artifacts in this repo feed other workflows. Before finishing the contract,
find what reads this workflow's output:

- In a checkout, search other workflow files for the output path or the
  field names (for example `decisions/` is read by Adversarial PM, Strategy
  Alignment, Chaos Monkey, and Daily Standup Prep).
- In plugin mode, check the source index descriptions, and mark consumers you
  could not confirm as unverified.

Name each consumer and the fields it depends on. If the port changes the
destination or drops a field those consumers need, list that under **Before
this will work**. It is a broken dependency, not a detail.

## 6. What to ignore or describe only briefly

These are runtime settings of GitHub Agentic Workflows, not workflow meaning:
`engine` and `model`, `timeout-minutes`, `strict`, `network`, `permissions`,
`tools`, and the generated `.lock.yml` (read it only as implementation
evidence). When listing what was dropped, describe the behavior they gave, not
their names:

| Instead of | Write |
|---|---|
| `max-ai-credits: 2000` | a per-run spending cap |
| `safe-outputs.create-pull-request` with `max: 1` | at most one review PR per run |
| `permissions: issues: read` | read-only access to issues |
| `timeout-minutes: 20` | a 20-minute run limit |
| `network: allowed: [github]` | network access limited to GitHub |
