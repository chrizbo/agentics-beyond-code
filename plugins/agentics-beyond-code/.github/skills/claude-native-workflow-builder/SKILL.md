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
what org governance applies. It is one of three platform builders, alongside
[`github-workflow-builder`](../github-workflow-builder/SKILL.md) and
[`productboard-agent-builder`](../productboard-agent-builder/SKILL.md): same
philosophy (living documents, artifacts over roles, the PM/owner decides),
different execution engine. Choosing which workflows to adopt, and whether
Claude is the right platform, belongs to
[`agentic-workflow-planner`](../agentic-workflow-planner/SKILL.md).

Use this skill instead of `github-workflow-builder` when the user's
system of record isn't GitHub, when they explicitly don't want a GitHub
Actions/gh-aw dependency, or when they want to see that the pattern this repo
teaches isn't tied to GitHub at all. Use `github-workflow-builder`
when GitHub Issues/Projects/Discussions are the team's actual home.


## Installed plugin context

When installed as a plugin, resolve bundled repository paths from the package
root (three directories above this `SKILL.md`), not the user's working folder.
Resolve `references/`, `prompts/`, and `assets/` relative to this skill folder.
The package is reference material; create deliverables in the user's selected
workspace and assess the user's artifacts, never the bundled demo data.
For an explicitly supplied source checkout, read that checkout's current
files. A checkout is the current working directory when it is this
repository, or a path the user gives. Never search the file system for one
(no `find /`, `mdfind`, or home-directory scans): that is slow and triggers
operating-system privacy prompts. Use the pinned source index instead. The directory plugin does not bundle runtime workflows, helper scripts,
or demo data. Before using a repository path outside this skill, read
`docs/source-access.md` at the package root. It explains how to locate and fetch
specific files from the recorded public source revision. If source access is
unavailable, request a checkout or the relevant files; do not invent a workflow
or say it was read. Blank templates and assessment references work offline.
Installing these skills does not connect services, install `gh`/`gh aw`, or
activate workflows or scheduled tasks. Check available tools before using them.

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
   State where it came from in the setup plan: a local checkout (with its
   commit, and whether it has uncommitted changes) or the plugin's pinned
   public revision. Don't write "read live" without saying which.
3. Read `references/porting-a-workflow.md` for the field-by-field mapping from
   a gh-aw workflow's frontmatter (`on:`, `engine:`, `steps:`, `tools:`,
   `safe-outputs:`, `permissions:`, `network:`) to a Routine or Scheduled
   Task's trigger, model, prompt, and connector scope — and critically, the
   caveat about `safe-outputs:` having no structural equivalent in a Routine.
4. Verify capabilities in proportion to the request, following the
   verification levels in `references/porting-a-workflow.md`. For a draft,
   work from the reference files without web lookups and label each
   capability claim as coming from the reference, with its date. Fetch
   official docs only when the user is about to create or activate
   something, asks you to verify, or the port depends on a capability the
   reference marks unverified. Never run open-ended web searches or read
   issue trackers and forums unless the user asks; mark the capability
   "unverified: confirm with a manual run" instead.
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

1. Start from a design. If `agentic-workflow-planner` already produced one,
   use it. Otherwise run its Design mode
   (`../agentic-workflow-planner/references/design.md`) briefly: problem and
   manual steps, judgment versus mechanical steps, real-life triggers, where
   the team already looks, the owner, and what a human must approve. Beyond
   that shared intake, capture the Claude-specific choice: whether the
   automation belongs to one person's Claude account or is a Team/Enterprise
   routine an admin can see and disable.
2. Read `references/routine-vs-scheduled-task.md` for the full decision
   framework, trigger mechanics, and org-governance details.
3. Design the human interpretation gate explicitly. It should live wherever
   the team already reacts to things (a Slack thread, a doc comment, a status
   column), and only an explicit human action should trigger any step that
   commits the team to work, spends money, or becomes visible outside the
   automation's own draft surface.

### Both paths

Respect an explicitly requested execution surface. A Cowork Scheduled Task and
a Claude Code Routine are different products, even when both run weekly. If the
requested surface cannot yet be verified to support the work, draft a conditional
plan for that surface and name the unresolved operations. Offer a Routine as a
separate alternative; do not substitute its setup steps or claim the prompt
works on both. Use the classification below to recommend a surface when the
user has not chosen one, or to explain an alternative's tradeoffs.

1. Classify each step as a **Routine** (needs repo/file access, connectors, or
   multi-step tool use; triggered on a schedule, an API call, or a repo event)
   or a **Scheduled Task** (a recurring prompt against connectors that reads
   and posts a result; cadence-only, no repo needed). See the decision table
   in `references/routine-vs-scheduled-task.md`.
2. Produce a setup plan, not vague advice: per step, name the trigger type,
   the connectors/access it needs, the destination it writes to, the human
   gate before anything durable happens, the org-governance control that
   applies (Team/Enterprise Owner routine toggle, or workspace-level Scheduled
   Task admin controls), **and which specific surface to create it on** — see
   the surface-selection table in `references/routine-vs-scheduled-task.md`.
   Don't just say "create a Routine"; say "`/schedule` in the CLI" or "the web
   UI at claude.ai/code/routines" based on what that step's trigger actually
   requires, since they don't have equal creation capability (the CLI, for
   example, can never generate an API trigger's token).
3. If the user wants it actually created, default to handing over the plan and
   the prompt text as a copy-paste block (see Output standard) rather than
   writing repo files — there is no file-based equivalent of a Routine or
   Scheduled Task the way a `.md` workflow file is the source of truth for
   gh-aw, and a checked-in copy just becomes a second version to keep in sync
   with whatever actually gets pasted into the product. If the user wants a
   durable, reviewable repo copy anyway, ask first and say where it will go.

   Separately, if a `schedule` skill/command is available in this session
   (it creates real cloud routines conversationally — this is what `/schedule`
   does), **offer** to invoke it directly with the finished plan instead of
   making the user paste it in themselves. Always ask before doing this rather
   than doing it automatically: a routine is persistent, org-visible
   configuration the moment it's created, not a reversible local edit, so it
   belongs in the same "ask first" category as any other standing automation
   this skill designs. If no such skill/command is available, point at the
   real setup surfaces instead: the `/schedule` command or `claude.ai/code`
   web UI for Routines, the Claude Cowork UI or scheduled-tasks tools for
   Scheduled Tasks.
4. If the user's actual system of record is GitHub and they have no objection
   to GitHub Actions, say so and route to `github-workflow-builder`
   instead — don't force the non-GitHub
   answer on a team for whom GitHub already works.

## Port fidelity and practical checks

Preserve the user's system of record and output destination where feasible.
If missing access requires a different destination or an export pipeline,
present that as an option with its added setup and maintenance, not an assumed
choice. For a plan-only request, a conditional plan is sufficient; do not
connect services, schedule work, or require a decision before drafting it.

Before calling a plan ready to use, follow the source, capability, and input
checks in `references/porting-a-workflow.md`. Verify specific read and write
operations, not just connector names. Distinguish unavailable in this session,
unsupported by the product, and not yet verified. Keep target repository URLs,
project IDs, folders, and schedules configurable; do not silently adopt demo
values. Preserve source URLs from input records where possible. Keep research
focused on decisions needed for the port, and review the final prompt against
one stated implementation path, valid commands, and all terminating outcomes
using the reference's executable-procedure checks.

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

Every prompt block must be complete enough to paste and run. Write out the
workflow's reasoning steps in full; never leave a placeholder such as
"[steps 1-6 go here]" or "restated in full when this is built". The only
placeholders allowed are target-specific values (channel, repo, project
number), marked in capitals. If you offer two surfaces, give one complete
block for the requested surface and describe the alternative in a few
sentences, rather than two partial blocks.

Before sending, reread the response for gh-aw config names in backticks
(`safe-outputs`, `timeout-minutes`, `max-ai-credits`, `network.allowed`,
`permissions`, `on:`) and rewrite each as the behavior it produced.

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
This includes the **Capability gaps** lists and the **Connectors**/**Tools**
row of the setup plan, which are the easiest places for it to slip back in.
For example, write "the original was hard-limited to one post per run", not
`safe-outputs: create-discussion: max: 1`; write "the original stopped after
20 minutes and had a per-run spending cap", not `timeout-minutes` or
`max-ai-credits`. For the Connectors row, say what the original could
access and how (e.g. "everything here was plain command-line GitHub access, not a
separate integration"), not the literal config field names for how gh-aw
expressed that.

Structure the setup plan so it's usable by someone who has never opened the
Routines UI before:

- **A numbered "do this" sequence**, not just a facts table, starting from the
  specific surface named in step 2 above (`/schedule` vs. the web UI — they
  produce different first steps). Web UI: open claude.ai/code/routines → New
  routine → paste the prompt into Instructions → add the named repo(s) → set
  the model → add/remove the named connectors → set the trigger → add any
  named environment variables → Create. CLI: run `/schedule`, describe the
  cadence and prompt when asked, confirm the repo Claude selects → if an API
  or GitHub trigger is also needed, finish that specific step on the web
  (name the exact page). Someone should be able to follow it top to bottom
  without translating a table into clicks themselves.
- **A safe first test**, stated explicitly, before "point this at everything
  in production": e.g. "first click Run now and, if the routine accepts
  optional input, target one low-stakes item you don't mind it touching,
  before running it unscoped."
- **Capability gaps split into two tiers**, not one flat list: "Before this
  will work" (missing credentials/scopes, anything that blocks the routine
  from running at all — put these first, they're not optional reading) versus
  "Things to be aware of" (reduced enforcement, missing concurrency
  protection, cost-model differences — real, but not blockers). Don't bury a
  blocking prerequisite in a list of nice-to-know caveats.

## Important defaults

- Don't assume GitHub is the wrong choice by default — ask. This skill exists
  for when GitHub genuinely isn't the team's surface, not to talk every user
  out of `github-workflow-builder`.
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
  do that the other can't yet, in both directions. Name every gap found, not
  just the ones already documented. The reference files are dated snapshots:
  say when a claim relies on them, and verify against official docs at
  creation time rather than on every draft.
