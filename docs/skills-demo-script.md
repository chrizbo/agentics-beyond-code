# Skills demo script

A walkthrough for showing the Agentics Beyond Code skills to an audience in
about 25 minutes. It follows the same path the skills do: **assess → design →
build**, and then builds one design on each of three platforms.

The demo uses this repository's **simulated organization** as its "team." The
issues, feedback items, Slack exports, transcripts, and decision records here
are fixture data made for demos. Say this up front so nobody mistakes them for
a real backlog.

## Before you start

**Pick a runtime.**

- **Repo checkout (recommended):** open Claude Code, Codex, or Copilot in a
  checkout of this repo. All five skills are discoverable from
  `.github/skills/`, `.claude/skills/`, or `.agents/skills/`, and the skills
  can read workflows and demo data locally.
- **Claude plugin:** install `agentics-beyond-code` (see the
  [plugin guide](claude-cowork-plugin.md)). It ships five skills (no
  `agentic-workflows`). Workflow sources are fetched from the pinned public
  revision, so network access is needed. Prompts that say "this repo" need
  a checkout; use the plugin variants where a scene gives one.

**Check readiness (5 minutes before).**

- [ ] Fresh session, so earlier conversation doesn't steer skill choice.
- [ ] `gh auth status` works if you want live GitHub issue reads in Scene 1.
      Add project scope so the assessment can see the Customer Feedback Queue
      board: `gh auth refresh -s read:project`.
- [ ] An empty scratch folder is selected as the writable workspace (Scene 3).
- [ ] Browser signed in to Productboard only if you plan the optional deploy
      in Scene 5. Otherwise keep that scene draft-only.
- [ ] Nothing in this script activates a schedule, creates a Routine, or
      writes to Productboard. Keep it that way unless you've planned cleanup.

**One-slide framing** (say it or show it):

```text
agentic-workflow-planner          github-workflow-builder
  Assess -> Design  ───────────>  claude-native-workflow-builder
  (platform-neutral)              productboard-agent-builder
```

> "The thinking is the same everywhere: understand how the team works, pick
> the smallest useful set of workflows, and put a human decision point in each.
> Only the last step depends on where your team's work lives."

---

## Scene 1: Assess (planner, ~5 min)

**Goal:** show that the planner reads real work artifacts and says what's
broken *before* recommending automation.

**Prompt (repo checkout):**

```text
Use agentic-workflow-planner to assess how this team handles customer
feedback. Look at the last 30 days of issues labeled feedback:intake in this
repo, plus docs/how-we-work.md and docs/strategy.md. Give me a readiness
readout before recommending any workflows.
```

**Prompt (plugin in an empty folder):** there is no local repo, so name
the GitHub repo. Approve the `gh` permission prompts when they appear; if a
prompt times out, the skill reports the gap and stops.

```text
Use agentic-workflow-planner to assess how the team in the GitHub repo
chrizbo/agentics-beyond-code handles customer feedback. Use gh to read the
last 30 days of issues labeled feedback:intake, and read docs/how-we-work.md
and docs/strategy.md from that repo. Give me a readiness readout before
recommending any workflows.
```

If `gh` isn't authenticated, export issues first and attach the file instead:
`gh issue list -R chrizbo/agentics-beyond-code -l feedback:intake -s all -L 50 --json number,title,labels,state,createdAt,closedAt,comments > feedback.json`.

**What should happen**

- It names its sources and time window.
- It separates **observations** (counts, labels) from **inferences** (likely
  causes, with confidence levels).
- It produces a readiness ladder. Example signals from the fixture data:
  many items tagged `feedback:potential-duplicate`, many `needs-pm-review`
  waiting, and items arriving from Slack, Discord, and open-source repos.

**Point out**

- "Missing access is a finding, not a failure." If `gh` isn't authenticated,
  it should say what it couldn't see instead of guessing.
- It won't judge individuals from sparse data.

---

## Scene 2: Design (planner, ~5 min)

**Goal:** show pain points becoming a small workflow set, with a platform
recommendation.

**Prompt (same session):**

```text
Now switch to design. The PM wants duplicates merged, a weekly themes report
stakeholders will actually read, and no work item created without their
approval. The team lives in Slack more than GitHub. Recommend workflows and
where they should run.
```

**What should happen**

- It picks existing workflows first, such as `feedback-dedupe-triage.md` and
  `friday-feedback-trends-report.md`, and marks each as a port.
- Each workflow gets a trigger, an artifact, a destination, and an explicit
  **human gate** (the PM approves before anything becomes committed work).
- It names an owner and an off switch.
- It recommends a platform per workflow, with a one-line reason. After Scene
  1 showed the queue and strategy doc living in GitHub, expect it to keep the
  analysis on GitHub (`github-workflow-builder`) and use Slack as the delivery
  surface, naming Claude-native as the alternative. Without that evidence,
  "we live in Slack" usually leads to `claude-native-workflow-builder`.
- It keeps approvals deliberate: a written command such as
  `/create-work-item`, not an emoji reaction, per
  `docs/slack-integration-plan.md`.
- It ends with the handoff contract a builder can start from.

**Point out**

- Living documents come before automation. It should mention strategy and
  how-we-work docs as what the workflows reason over.
- It separates *where the analysis runs* from *where people read it*. That's
  "Your habits are already triggers" without moving the system of record.

---

## Scene 3: Build on GitHub (~4 min)

**Goal:** show the same design built as gh-aw files. Keep it draft-only.

**Prompt:**

```text
Use github-workflow-builder to set up just the decision log workflow for a new
team in my scratch folder. Include blank strategy and how-we-work docs and the
folders it needs. Don't touch GitHub, create labels, or create project boards.
```

**What should happen**

- It creates `docs/strategy.md`, `docs/how-we-work.md`, `decisions/`,
  `transcripts/`, and an adapted `.github/workflows/decision-log.md` in the
  scratch folder. No fictional people or dates are copied.
- Because you said no project boards, it adapts the workflow to drop its
  GitHub Projects pre-step (`fetch-launch-data.sh`), or asks, rather than
  copying the script and listing a board as a prerequisite.
- It copies no `.lock.yml`; that's generated by `gh aw compile` in the
  target.
- It lists the workflow's dependencies and what the owner must fill in.
- It runs `gh aw compile --strict` if gh-aw is installed, or says it didn't.

**Point out**

- Only the files that workflow needs, not the whole repo.
- On the plugin, it fetches gh-aw authoring guidance from `github/gh-aw`
  because `agentic-workflows` isn't packaged.

---

## Scene 4: Build on Claude (~5 min)

**Goal:** show a port to Claude Routines or Scheduled Tasks, including an
honest list of gaps.

**Transition:** if Scene 2 recommended GitHub, say: "Same design, but suppose
this team had no GitHub at all." That's the Slack-native comparison the
planner offered.

**Prompt:**

```text
Use claude-native-workflow-builder to port the Friday Feedback Trends Report
to a Cowork Scheduled Task that posts to a Slack channel. Read the current
workflow file. Draft only; don't create or activate anything.
```

**What should happen**

- It reads `.github/workflows/friday-feedback-trends-report.md` directly (or
  the pinned source on the plugin) and says which revision it read.
- It keeps the requested surface (a Scheduled Task, not a Routine), and
  may explain why a Routine would be a more faithful port (repo access for
  the live strategy doc and the original fetch scripts) without switching.
- Expect blockers such as: GitHub Project fields may not be readable through
  a connector, so it falls back to labels; the strategy doc has to be pasted
  into the task because Scheduled Tasks can't read repo files.
- It produces a labeled prompt block to paste, a numbered "do this" setup
  sequence, and a safe first test.
- **Capability gaps** come in two tiers: "Before this will work" (blockers)
  and "Things to be aware of." Expect the loss of gh-aw's enforced write
  limits to be called out and restated as explicit prompt instructions.
- Explanations are in plain language, not gh-aw config syntax.
- Because it's a draft, it doesn't search the web. Capability claims are
  labeled as coming from the skill's dated reference, and anything
  unsettled is listed as "confirm with a manual run." Add "verify against
  the current docs" to the prompt to see it fetch official docs.

**Point out**

- "It never pretends a port is equivalent." That's the trust move.
- It offers `/schedule` but asks first, because a routine is persistent.

---

## Scene 5: Build on Productboard (~4 min)

**Goal:** show a Spark skill draft that keeps evidence and human decisions.

**Prompt:**

```text
Use productboard-agent-builder to adapt Assumption Surfacer into a Productboard
Spark skill named assumption-surfacer. Read the source workflow. Analyze a
brief supplied in chat and return grounded questions without changing product
records. Show the instructions; do not deploy yet.
```

**What should happen**

- It reads `.github/workflows/assumption-surfacer.md` and records the source.
- It translates GitHub-only writes and explains anything it dropped.
- It returns Spark instructions and doesn't deploy.

**Optional live deploy** (only if planned, with a signed-in browser):
follow the "create it" prompt in [skills.md](skills.md#using-the-productboard-agent-builder).
Use Personal visibility and no schedule, and delete the test skill afterward.

**Point out**

- Drafting is not permission to deploy. Deployment and scheduling are
  separate, explicit requests.

---

## Closer: one prompt, whole path (~2 min)

If time allows, show the planner routing on its own:

```text
We're a 6-person product ops team. Decisions get lost in meetings and nobody
reads the weekly status. Our work is in GitHub. Where do we start?
```

Expect a short assessment of what it can see, a design with
`decision-log.md`, `transcript-processor.md`, and `weekly-status.md`,
living docs first, and a handoff to `github-workflow-builder`.

## Troubleshooting

| Symptom | Fix |
|---|---|
| The wrong skill loads | Name the skill in the prompt, or start a fresh session. Old names (`org-work-sensing`, `non-coder-agentic-workflow-builder`) no longer exist; use the planner. |
| Plugin can't read workflows | It needs network access to the pinned revision, or a checkout. It should say so rather than invent a port. |
| Assessment has no data | In an empty folder, "this repo" means nothing; use the plugin prompt that names `chrizbo/agentics-beyond-code`. Otherwise check `gh auth status` or attach an issue export. A missing-access finding is still a valid demo moment. |
| `gh aw compile` unavailable | Fine for a demo. The builder should report that validation was skipped. |
| Productboard draft tries to deploy | Stop it and restate "do not deploy." Deployment always needs an explicit request. |

## Resetting after the demo

- Delete the scratch folder from Scene 3.
- Confirm no Routines or Scheduled Tasks were created (`/schedule` list, or
  the Cowork scheduled tasks view).
- If you deployed to Productboard, delete the test skill and any automation.
