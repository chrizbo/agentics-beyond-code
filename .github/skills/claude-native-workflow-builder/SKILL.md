---
name: claude-native-workflow-builder
description: >
  Use this skill when a user wants an always-on, org-owned automation built on
  Claude's own product surfaces — Claude Routines and Claude Scheduled Tasks —
  instead of GitHub Agentic Workflows, whether that means porting one or more
  of this repo's existing workflows or designing a new one from scratch, and
  whether or not GitHub is the team's system of record. Trigger on requests
  like "set this up without GitHub", "build this as a Claude Routine",
  "schedule this with Claude", "I only want this one workflow, not the whole
  repo", "make this work in Slack/Notion/Jira instead of GitHub", "show me the
  same pattern but not GitHub-specific", "turn this process into a Routine or
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

First find out which of these two conversations this is — most requests are
the first one, so check it before assuming a from-scratch design is needed:

**A. Port one or more of this repo's existing workflows.** Someone who wants
"the compliance review thing, but as a Routine" or "just the Friday trends
report, I don't want the rest of the repo" is adopting a slice of an existing,
already-designed system, not describing a new process. Don't make them
re-describe something this repo already implements.

**B. Design a new always-on automation from scratch**, for a process that
doesn't exist as a workflow here yet.

### A. Porting an existing workflow

1. Inventory the live catalog rather than recalling it from memory or from any
   previously-written example: list `.github/workflows/*.md` (agentic) and
   `.github/workflows/*.yml` (deterministic), or use the README's workflow
   tables as an index. Ask which workflow(s) they want — one, a related
   cluster (e.g. the whole customer-feedback pipeline), or "what's related to
   X problem." Adopting just one or two is a completely normal outcome; don't
   push the rest of the repo's scaffolding on someone who didn't ask for it.
2. For each selected workflow, read its **current** file directly out of the
   repo. Do not reuse a cached summary from earlier in the conversation or any
   static example doc — the whole point of reading live is that these files
   are gh-aw's real source of truth and change as the team maintains them.
3. Read `references/porting-a-workflow.md` for the field-by-field mapping from
   a gh-aw workflow's frontmatter (`on:`, `engine:`, `steps:`, `tools:`,
   `safe-outputs:`, `permissions:`, `network:`) to a Routine or Scheduled
   Task's trigger, model, prompt, and connector scope — and critically, the
   caveat about `safe-outputs:` having no structural equivalent in a Routine.
4. Before finalizing, verify the specific capabilities this workflow actually
   uses against **live docs**, not just that reference file's table — fetch
   the current [Claude Routines docs](https://code.claude.com/docs/en/routines)
   and, for whichever gh-aw features this workflow relies on, the matching
   upstream doc the `agentic-workflows` skill already routes to. Both products
   change independently of this repo (Routines is an explicitly-labeled
   research preview; gh-aw is on a pinned, upgradeable version) — treat the
   reference file as a starting checklist, not the final word.
5. Produce the ported prompt text per workflow (see Output standard) —
   labeled with which repo workflow it came from, the trigger to configure,
   and every safe-outputs constraint restated explicitly since nothing
   enforces it automatically the way gh-aw does. Include a **Capability gaps**
   note: anything the original workflow could do that this port can't do the
   same way, whether or not it's one of the gaps already named in
   `porting-a-workflow.md`. Don't present a port as equivalent when it isn't.
6. If the requested workflow doesn't exist yet in this repo, say so and either
   route to `B` below or point at `docs/workflow-ideas.md` if it's a known
   future idea.

### B. Designing a new automation

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
3. Design the human interpretation gate explicitly. It should live wherever
   the team already reacts to things (a Slack thread, a doc comment, a status
   column), and only an explicit human action should trigger any step that
   commits the team to work, spends money, or becomes visible outside the
   automation's own draft surface.

### Both paths

1. Classify each step as a **Routine** (needs repo/file access, connectors, or
   multi-step tool use; triggered on a schedule, an API call, or a repo event)
   or a **Scheduled Task** (a recurring prompt against connectors that reads
   and posts a result; cadence-only, no repo needed). See the decision table
   in `references/routine-vs-scheduled-task.md`.
2. Produce a setup plan, not vague advice: per step, name the trigger type,
   the connectors/access it needs, the destination it writes to, the human
   gate before anything durable happens, and the org-governance control that
   applies (Team/Enterprise Owner routine toggle, or workspace-level Scheduled
   Task admin controls).
3. If the user wants it actually created, point them at the real mechanism
   rather than editing files on their behalf: the `/schedule` command or
   `claude.ai/code` web UI for Routines, and the Claude Cowork UI or
   scheduled-tasks tools for Scheduled Tasks. This skill produces the plan and
   the prompt text to use there; it does not fabricate a live routine by
   writing repo files, because there is no file-based equivalent of a Routine
   or Scheduled Task the way a `.md` workflow file is the source of truth for
   gh-aw. Hand over the prompt text as a copy-paste block in the response
   itself (see Output standard) — do not write it to a new file in this repo.
   Nothing in this repo executes it, so a checked-in copy just becomes a second
   version to keep in sync with whatever actually gets pasted into the
   product. If the user wants a durable, reviewable copy anyway, ask first and
   say where it will go before creating it.
4. If the user's actual system of record is GitHub and they have no objection
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

When the user asks to actually build it, write the exact prompt text for the
Routine or Scheduled Task (what to read, what judgment to apply, what to write
and where, what never to do without a human saying so) directly into the
response, in a fenced code block labeled with its destination — e.g.
"Routine prompt — paste into `/schedule` or claude.ai/code" — so it can be
copied straight into the setup surface. Do not create a new file in the repo
for this by default.

When porting an existing repo workflow (path A), produce one labeled block per
workflow: name the source file it came from, the trigger to configure, and
restate every write limit from that file as explicit prompt instructions,
since a Routine has no structural equivalent that enforces them.

**Write every user-facing explanation in plain language, not gh-aw
terminology.** Someone asking for this may have no gh-aw background at all —
don't assume they know what `safe-outputs:`, `workflow_dispatch`,
`on.issues`, or "the agent's token" mean. `references/porting-a-workflow.md`'s
field-mapping table uses exact frontmatter names because that's what makes it
useful as an internal lookup — but translate before it reaches the response.
Describe *behavior*, not *config syntax*: instead of "the original had
`safe-outputs.add-comment: max 15`," say "the original limited it to 15
comments per run and checked every write in a separate step before it went
out." Instead of "`on: workflow_dispatch`," say "the original only ran when
someone triggered it manually." Use Claude-side product terms freely (Routine,
Scheduled Task, connector, trigger, environment) since those are what the
person will actually click on — the plain-language rule is specifically about
not requiring gh-aw fluency to understand what changed and why it matters.

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
- Default to handing over Routine/Scheduled Task prompt text inline, in the
  response, not as a new repo file. It's product configuration to paste
  elsewhere, not something this repo runs — treat it like an answer, not a
  deliverable that belongs in version control, unless the user says otherwise.
- Always read a workflow's current file when porting it, never a memorized or
  previously-written description of it. A written example goes stale the
  moment the source workflow changes and nothing regenerates it — this repo's
  own ["Living Documents"](../../../README.md#living-documents) philosophy is
  the argument against keeping one. The live `.github/workflows/*.md`/`.yml`
  files are already the thing the team keeps current; read those instead of
  reproducing them elsewhere.
- Reactive triggers (a GitHub event, an API call fired by something else) are
  not free just because they're not on a clock — they still draw down the
  daily routine run cap every time they fire. When designing a demo or a
  not-yet-production setup, default to creating the trigger disabled/paused
  and only enabling it while actively demoing, the same discipline this repo
  already applies to its scheduled gh-aw workflows (see the README's pause
  notice). Say this explicitly in the setup plan rather than assuming it's
  obvious.
- Never present a port as a clean, capability-equivalent swap. gh-aw and
  Claude Routines/Scheduled Tasks are different products built by different
  teams on different release cadences, so there will always be things one can
  do that the other can't yet, in both directions. Actively check for these
  gaps against live docs — this skill's own reference material is a starting
  point, not a permanent source of truth, exactly like the frozen example doc
  this skill used to lean on before it was replaced with reading live repo
  files. Name every gap found, not just the ones already documented.
