---
description: Field-by-field mapping from a gh-aw workflow's frontmatter to a Claude Routine or Scheduled Task, the capability gaps to actively look for, and the safety-model gap to flag when porting.
disable-model-invocation: true
---

# Porting a gh-aw Workflow to a Routine or Scheduled Task

Use this after `claude-native-workflow-builder` has read the current
`.github/workflows/<name>.md` or `.yml` file for the workflow being ported.
Read the actual source file for this task: the user-provided checkout when
available, otherwise the recorded public source revision via `docs/source-access.md`
as described in `SKILL.md`.
Do not describe a bundled file as current upstream. This reference explains
what to do with the source you find.

## Verification levels

Reference last updated: 2026-09-29. Update this line whenever you re-verify
a capability against official docs, and correct the table if it changed.

Match verification effort to the request:

| Request | Web lookups |
|---|---|
| Draft or plan only (the default) | None. Use this file and `routine-vs-scheduled-task.md`. Label claims "per reference, updated 2026-09-29" and list what to confirm before creation. |
| The port depends on a capability this file marks "no equivalent" or "check the current UI" | At most one fetch of that surface's official docs page. |
| About to create or activate, or the user asks you to verify | Fetch the official docs for the specific capabilities this port uses. |

Official sources only: [Claude Routines docs](https://code.claude.com/docs/en/routines),
[Cowork scheduled tasks](https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork),
and the gh-aw docs. Do not run general web searches or read issue trackers
and forums unless the user asks. If official docs don't settle a question
(for example, whether a connector's write tool is available in scheduled
runs), don't keep searching: mark it "unverified: confirm with a manual run"
under "Before this will work."

Read the source workflow file itself for gh-aw behavior. Fetch gh-aw docs only
for a frontmatter key or safe output the table below doesn't cover.

## Why this file can go stale

The table below is this skill's current understanding, not a guarantee. Both
sides of this port are products that change on their own schedule, not on this
repo's: Claude Routines is explicitly labeled "research preview — behavior,
limits, and the API surface may change" in its own docs, and gh-aw ships new
releases regularly (this repo pins a specific gh-aw version for exactly that
reason). That is why every claim taken from this file is labeled with its
date, and why creation-time verification matters.

When a verification level above calls for a lookup, use:

- **Claude Routines**: fetch [code.claude.com/docs/en/routines](https://code.claude.com/docs/en/routines)
  (and linked pages like cloud environments, MCP connectors, or desktop
  scheduled tasks, if relevant to the specific workflow) rather than trusting
  this file's summary of what it supports.
- **gh-aw**: for the specific feature the workflow being ported actually uses
  (a particular `safe-outputs:` type, a particular `on:` trigger, a particular
  tool), check the matching upstream gh-aw doc (the `agentic-workflows` skill
  routes to these when present; otherwise fetch them from `github/gh-aw`,
  e.g. `safe-outputs-automation.md`, `safe-outputs-content.md`,
  `github-agentic-workflows.md`) or [github.github.io/gh-aw](https://github.github.io/gh-aw/),
  not just this table's one-line summary of it.

Keep research bounded to decisions that affect this port. Start with the
selected surface's official documentation and available tool schemas; consult
another surface only when evaluating a relevant alternative. Reuse current
sources already read in this task. Stop when a capability is verified or a
specific unresolved prerequisite can be stated. Issue reports can identify
possible limitations but do not establish supported behavior; do not pursue
unrelated issues or broad product surveys for a draft plan.

Don't treat the table as exhaustive, either. gh-aw adds new `safe-outputs:`
types, new `on:` triggers, and new tool integrations over time, and Routines'
own feature set changes independently. If the workflow being ported uses
something not listed below, that's a signal to go check both docs, not a
signal that no gap exists. When you find a capability the workflow relies on
that Routines/Scheduled Tasks can't currently do — not just the ones
enumerated here — name it explicitly to the user the same way the
`safe-outputs:` gap is named below, rather than silently dropping or
approximating the behavior.

## Source, access, and plan consistency

### Identify the source without inventing a compatibility failure

Name the source path and whether it came from a checkout or installed package.
For an installed plugin, read `.claude-plugin/build-info.json` and
`source-index.json` at the package root when present. The build record identifies
packaged skill bytes; the source index identifies external workflow files at a
recorded repository revision. Keep those two kinds of provenance distinct.
Report the actual workflow source path and revision retrieved, and whether it
came from the user's checkout instead. An installed folder lacking `.git` does
not mean there is no recorded source commit. Do not describe remote workflow
files as bundled or infer freshness from deterministic ZIP timestamps.
This repository tracks its upstream skill snapshot separately from its installed
CLI, setup version, and generated workflow action versions (see `docs/skills.md`).
Different version numbers alone do not establish incompatibility or a stale
compiled workflow. Report a mismatch as a defect only when a relevant check or
specific unsupported feature demonstrates it. Keep incidental version details
out of the user-facing plan unless they affect implementation. Say versions
"can differ," not that drift is required or proof of compatibility. For a
version-explanation request, answer that question without proposing upgrades or
downgrades unless there is a demonstrated defect or the user requests migration.
Before giving migration commands, verify the selected release, supported flags,
and compatibility; an unpinned upgrade does not promise a particular version.
Do not recommend recompiling newer workflow syntax with an older CLI without
checking that it supports the features used.

### Verify capabilities at the operation level

Check the available tools and current official documentation for the selected
surface. A connector's name does not establish that it can create a Google Doc,
read project fields, or publish a GitHub Discussion. Missing access in the
current session does not prove that the product cannot support the operation.
If the needed operation cannot be verified, mark it unresolved and describe
what must be checked before activation. Do not infer a user's complete account
configuration from tools visible in one session. Report "no GitHub connector
was available in this session" when that is all the evidence establishes.
Use that same bounded wording in the summary, recommendation, and prerequisites,
not only the capability table. A directory search with no results does not establish absence from the account
or platform. Current-session shell access or credentials also do not establish
what a future scheduled run will have; verify persistence separately.
Cite capability evidence actually inspected in this task (or already available
in its context). Merely appending documentation links is not verification. If
live lookup is unavailable or the user prohibits it, mark volatile claims as
unverified rather than presenting remembered product behavior as established.

Verify timezone and daylight-saving behavior, permission controls, and task
ownership for the actual creation surface. Do not translate a local-time request
to fixed UTC cron unless that surface requires it; when it does, explain the
seasonal difference. Distinguish connector scope enforced by the service from
prompt-only restrictions, and verify the former rather than assuming it exists.

### Preserve the workflow's contract

- Name the original input sources, output destination, allowed writes, human
  decision gate, and active trigger. Read the source as
  [reading workflow sources](../../agentic-workflow-planner/references/reading-workflow-sources.md)
  describes: a `(disabled — re-enable …)` schedule is the intended cadence,
  paused for the demo repository, so port it turned off with guidance for
  turning it on.
- If the requested surface lacks an operation, describe the missing access and
  offer the smallest viable alternatives. Moving a report to another service
  or retaining GitHub Actions for exports is an architectural choice, not an
  automatic consequence of requesting a port.
- Identify new policy choices (such as freshness limits and duplicate handling)
  as proposed defaults. Do not describe them as constraints inherited from the
  original workflow.
- Check success, empty-input, and incomplete outcomes in the source. A check
  for an output record is not necessarily a check that a report was published;
  valid no-op or incomplete records can also satisfy it. Distinguish producing
  a record, passing an individual check, and the final job result. Do not claim
  an incomplete result succeeds or fails the run without inspecting the relevant
  generated handling or version-specific documentation; otherwise leave the
  final run status unverified.

### Reconcile setup steps with the final prompt

Before handing over a runnable prompt, check that every consumed file or field
has a producer or a named prerequisite. Use the same names in export steps,
setup instructions, and the prompt; include relationship data such as duplicate
clusters, not just the main records. If an export step is new, label it as work
still to implement rather than suggesting the original scripts already do it.

Replace demo repository URLs, project numbers, and folder names with supplied
targets or clearly marked placeholders. Retain original record URLs when
available rather than reconstructing them against the example repository.
Adapt strategy-document assumptions to the target: read its actual tradeoffs,
headings, and identifiers rather than copying a demo count, numbering scheme,
or example priorities. If the target document is unavailable, leave its content
unresolved and require that read before ranking; do not invent tradeoffs.

Do not invent sample exports or imply that raw fixtures already match a fetched
project-data schema. State any transformation needed for a meaningful first test.

### Review the final prompt as an executable procedure

Choose one implementation path for each prompt and name its prerequisites.
A connector-based plan must use verified connector operations; it cannot quietly
require a shell token, cloning, or `gh`. If the path is undecided, label the
prompt conditional on a specific path or give separate alternatives. Do not
present a mixture as ready to run.

For shell-based prompts, define editable values once using named variables,
such as REPO_OWNER, REPO_NAME, FEEDBACK_PROJECT_NUMBER, and LAUNCH_PROJECT_NUMBER.
Derive combined values such as REPO from those variables and reference them in
every command. Export variables when child scripts consume them. Do not scatter
repeated numeric placeholders or alternate spellings of the same target through
the prompt. A dry review that changes only the configuration block must redirect
all reads and writes to the intended sandbox targets. Keep local scratch-file
writes distinct from external publication when reporting outcomes.

Keep the product name consistent in the recommendation, creation steps, prompt
heading, and prerequisites. If the requested surface's capabilities remain
unknown, provide a conditional procedure and the checks needed to finish it;
do not describe it as ready to execute. Check that pause/activation instructions
match the verified creation controls before promising it can be created paused.

Walk through the instructions in order before delivering them:

- Every placeholder has one consistent name and a configuration source. Account
  for script dependencies, working directories, arguments, and credential
  environment variables. Read the scripts to establish their actual interfaces.
- Commands contain valid shell syntax. Put explanatory prose outside command
  lines or in shell comments. Check syntax locally when feasible, without
  executing network calls, installing tools, or publishing anything for a
  draft-only request. State which runtime prerequisites remain untested.
- Empty-input checks occur immediately after the required read, before analysis
  or any write. Duplicate checks stop before publishing. Ensure each branch
  terminates with a defined outcome, including any newly proposed duplicate skip.
- Keep each outcome as visible as it was in the original. If the original made
  failure visible (a failing run, or an explicit "report incomplete" call),
  the port must too: post a short "could not run this week: <reason>" message
  to the destination or notify the owner. Never turn a visible failure into a
  silent stop. Empty input may end quietly only if the original also ended
  quietly (for example, recorded a no-op without posting).
- Success, empty input, duplicate skip (if present), and incomplete paths agree
  with the final outcome list. A failure after an attempted write must report
  whether the write happened or is uncertain, not claim nothing was created.
- After a timeout or ambiguous create response, reconcile against the destination
  using the intended unique marker or exact title before considering a retry.
  If the object exists, report its link without creating another. If the result
  remains uncertain, stop with an uncertain-write outcome and no retry. Retry
  only when non-creation is confirmed or a verified idempotency mechanism makes
  the retry safe; a fixed retry count alone does not prevent duplicates.
- A search-before-create duplicate check is best effort, not an enforced
  concurrency guarantee. Do not describe prompt rules as mechanical limits.

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

This table names exact gh-aw frontmatter fields because that's what makes it
useful as a lookup. **Don't carry those field names into anything shown to
the user.** Someone asking to port a workflow may have never heard of gh-aw —
translate each row into what the original automation actually did and why it
mattered, not its config syntax. See the plain-language rule in `SKILL.md`'s
Output standard for examples of the translation.

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
select, and the full prompt text with every write limit and scope restated in
plain language. Include a short **Capability gaps** note listing anything the
original workflow could do that the port can't do the same way — the
enforced-writes gap if relevant, plus anything else found by checking live
docs per the section above. Don't present a port as a clean equivalent when it
isn't one, and don't make understanding the gap depend on already knowing
gh-aw — describe what could go wrong now that couldn't before, in behavior
terms a first-time reader can follow.
