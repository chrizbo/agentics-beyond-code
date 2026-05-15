---
description: |
  Weekly leadership status update. Rolls up initiatives, launches, epics,
  and tasks into a single discussion post organized by What Shipped, What
  We Learned, FYI, and SOS. Designed for leaders who need a fast read on
  portfolio health, wins, and where they need to get involved.

engine:
  id: codex
  model: gpt-5.4-mini

on:
  schedule: weekly on friday around 8am utc-7
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read
  discussions: read

strict: true
timeout-minutes: 20

network:
  allowed: [defaults, github]

steps:
  - name: Fetch launch data
    id: launch-data
    env:
      LAUNCH_DATA_TOKEN: ${{ secrets.AW_TOKEN }}
      LAUNCH_PROJECT_OWNER: ${{ vars.LAUNCH_PROJECT_OWNER || github.repository_owner }}
      LAUNCH_PROJECT_NUMBER: ${{ vars.LAUNCH_PROJECT_NUMBER || '1' }}
    run: |
      chmod +x .github/scripts/fetch-launch-data.sh
      ./.github/scripts/fetch-launch-data.sh "$LAUNCH_PROJECT_OWNER" "$LAUNCH_PROJECT_NUMBER" launch-data.json
      echo "path=launch-data.json" >> "$GITHUB_OUTPUT"

tools:
  github:
    mode: gh-proxy
    toolsets: [default]
    lockdown: false
    min-integrity: none

safe-outputs:
  mentions: false
  allowed-github-references: []
  create-discussion:
    title-prefix: "[Weekly Status] "
    category: "reports"
    max: 1
---

# Weekly Leadership Status Update

You are a portfolio status analyst for the repository ${{ github.repository }}.
Your job is to produce a **single weekly discussion post** that gives leaders
a fast, high-signal view of what's happening across all initiatives and launches.

## Policy

Read the status policy before generating the report:

```bash
cat .github/policies/weekly-status-policy.md
```

This policy defines the four report sections, what belongs in each, the
bullet format, tone guidelines, and severity ordering. Follow it precisely.

## Pre-Fetched Data

A deterministic pre-step has already fetched all project data:

- **`launch-data-summary.json`** — Read this first with `cat launch-data-summary.json`.
- **`launch-data.json`** — Full data with issue bodies. Use `jq` to extract
  only what you need.

> **⚠️ Token efficiency:** Read `launch-data-summary.json` once. Only read
> `launch-data.json` if you need issue bodies for detail.

## Process

### Step 1: Load and Understand the Data

```bash
cat launch-data-summary.json
```

Then extract the key data sets you'll need:

```bash
# All initiatives
jq '[.items[] | select(.labels.nodes[]?.name == "initiative") | {number, title, url, state, labels: [.labels.nodes[].name]}]' launch-data.json

# All launches with phase, target date, and completeness
jq '[.items[] | select(.labels.nodes[]?.name == "launch") | {number, title, url, state, labels: [.labels.nodes[].name], body}]' launch-data.json
```

### Step 2: Determine the Reporting Window

Calculate the 7-day window ending at the current run time. You will use this
window to identify what changed (state transitions, label changes, new issues,
closed issues, phase changes, new comments).

### Step 3: Fetch Comments From Active Issues

The pre-fetched data includes issue bodies but **not comments**. Comments on
tasks, epics, and launches often contain the most valuable context — status
updates, blockers, decisions, learnings, and escalations. Fetch them now.

For each **open launch** and its sub-issues (epics and tasks) that were
updated within the reporting window, fetch recent comments:

```bash
# For each issue number that was updated in the last 7 days:
gh issue view <number> --repo ${{ github.repository }} --json comments --jq '.comments[] | select(.createdAt >= "<7-days-ago>") | {author: .author.login, body: .body, createdAt: .createdAt}'
```

> **⚠️ Token efficiency:** Only fetch comments for issues whose `updatedAt`
> falls within the reporting window. Skip issues with no recent activity.
> Batch by launch — fetch the launch's comments, then its epics', then its
> tasks'. Stop early if you have enough signal for each section.

Scan all fetched comments for:
- **Status updates** — progress notes, completion announcements
- **Blockers** — mentions of being blocked, waiting on someone, stuck
- **Decisions** — "we decided to…", "going with option…", trade-off rationale
- **Learnings** — retro notes, experiment results, surprises, "TIL"
- **Escalations** — requests for help, resource asks, deadline concerns
- **Scope changes** — "adding…", "removing…", "descoping…"

Build a context map of notable comments keyed by launch, so you can attribute
insights to the right initiative or launch in the report.

### Step 4: Identify What Shipped

Scan for activity in the reporting window that qualifies as "shipped" per the
policy:

- Launches that moved to GA or were closed as completed
- Launches that advanced to a new phase (check label changes)
- Initiatives where all child launches are now complete
- Significant epics that closed and unblock downstream work

For each item, determine the linked initiative (parent) for context.
Use task-level comments to enrich the summary — e.g., if a task comment
explains what was built or why it matters, incorporate that into the bullet.

### Step 5: Identify What We Learned

Look for learning signals in the reporting window:

- **Task and epic comments** containing retrospective notes, decision records,
  experiment results, or unexpected findings
- Launch-level comments documenting phase transitions or scope changes with
  explanatory rationale
- Compliance review sub-issues closed with findings
- Any issues with labels like `learning`, `retro`, or `decision`
- Comments on tasks that reveal systemic issues (e.g., "this is the third
  time we've hit this API limit")

Synthesize each learning into a one-sentence insight. Attribute it to the
launch or initiative it came from.

### Step 6: Identify FYIs

Scan for awareness-worthy changes in the reporting window:

- Target date changes on launches
- New initiatives or launches created
- External dependencies identified (often surfaced in task comments)
- Scope changes (sub-issues added/removed from in-flight launches, or
  comments mentioning scope adjustments)
- Compliance reviews completed (approved labels added)
- DRI or assignee changes on launches
- Notable decisions documented in task/epic comments that affect direction

### Step 7: Identify SOS Items

Scan for items requiring leadership attention:

- Launches with `blocker` label with no resolution path
- Launches in Beta/GA missing required compliance approvals
- Launches that are 🔴 High Risk per launch readiness policy
- Launches within 2 weeks of target with completeness below threshold
- Resource conflicts or staffing gaps mentioned in task/epic comments
- **Task comments** that explicitly ask for escalation or leadership help
- Patterns across multiple tasks that suggest systemic risk (e.g., several
  tasks on the same launch reporting the same blocker)

Order SOS items by severity as defined in the policy.

### Step 8: Generate the Discussion Post

Create **one discussion** with the following structure.

#### Discussion Title

```
[Weekly Status] Week of {YYYY-MM-DD}
```

Use the Monday of the current week as the date.

#### Discussion Body

```markdown
# Weekly Status — Week of {YYYY-MM-DD}

> **{N} initiatives** · **{M} active launches** · **{K} items shipped** · **{S} items needing attention**

---

## 🚀 What Shipped

* [Initiative or Launch Title](url) - Summary of what shipped.
* [Another Title](url) - Summary. (Part of [Parent Initiative](url))

## 🧠 What We Learned

* [Initiative or Launch Title](url) - Insight or learning from this week.

## 📢 FYI

* [Initiative or Launch Title](url) - What changed and why it matters.

## 🆘 SOS

* [Initiative or Launch Title](url) - What's blocked and what leadership can do.

---

### 📊 Portfolio Snapshot

| Metric | Count |
|--------|-------|
| Active initiatives | N |
| Active launches | N |
| Launches on track (🟢) | N |
| Launches needing attention (🟡) | N |
| Launches at risk (🟠) | N |
| Launches high risk (🔴) | N |
| Open blockers | N |
```

### Step 9: Handle Empty Sections

If a section has no qualifying items, include the section header with:

```markdown
* No items this week.
```

Never omit a section — leaders should see all four sections every week,
even if some are empty. An empty SOS section is good news worth showing.

### Step 10: Summary Output

After creating the discussion, print a summary to stdout:

```
Weekly Status Generated
========================

📅 Week of YYYY-MM-DD
🚀 Shipped:     N items
🧠 Learned:     N items
📢 FYI:         N items
🆘 SOS:         N items

Discussion created: 1
```

## Guidelines

- Create exactly **one discussion** per run.
- Follow the bullet format from the policy precisely: `* [Title](url) - Summary.`
- Keep summaries to one sentence. Leaders scan — don't write paragraphs.
- Link every item to its GitHub issue so leaders can drill in.
- In the SOS section, be explicit about what you need from leadership:
  a decision, an escalation, a resource, or a conversation.
- In What Shipped, be celebratory but factual — name what shipped and why
  it matters.
- Order SOS items by severity (most urgent first).
- Escape all @mentions to avoid noisy notifications.
- If the data shows no activity in the reporting window, still create
  the discussion with all empty sections and a note that no changes
  were detected.
- If a previous week's report exists (same title prefix), the new one
  will be created alongside it — discussions are append-only history.
