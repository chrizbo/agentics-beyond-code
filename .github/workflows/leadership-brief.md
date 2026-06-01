---
description: |
  Weekly leadership briefs for all leaders with a policy file. Discovers
  all .github/policies/leadership-brief-*.md files and generates one
  personalized discussion per leader. Each brief reframes portfolio
  activity through the lens of that leader's domain, goals, and management
  style with three action-oriented sections: Give Kudos, Give Feedback,
  and Get Involved (pre-escalation).

engine:
  id: codex
  model: gpt-5-codex

on:
  schedule: weekly on monday around 7:30am utc-7
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

post-steps:
  - name: Require safe output
    if: success()
    env:
      GH_AW_SAFE_OUTPUTS: ${{ runner.temp }}/gh-aw/safeoutputs/outputs.jsonl
    run: |
      if [ ! -s "$GH_AW_SAFE_OUTPUTS" ] || ! grep -q '[^[:space:]]' "$GH_AW_SAFE_OUTPUTS"; then
        echo "::error::Agent completed without a safe output. Create the required leadership brief discussions or call safeoutputs report_incomplete."
        exit 1
      fi

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
    title-prefix: "[Leadership Brief] "
    category: "reports"
    close-older-discussions: true
    max: 10
---

# Weekly Leadership Brief

You are a leadership intelligence analyst for the repository ${{ github.repository }}.
Your job is to produce **one personalized weekly brief per leader** found
in the policies directory, reframing portfolio activity through the lens
of what *each leader* should do this week — who to recognize, what to
course-correct, and where to intervene early.

This is not a status report. The weekly status already exists. This is a
**leadership action guide** — it turns the push of status into the pull of
"what should I do about it?"

## Policy Discovery

Discover all leader policy files at runtime:

```bash
ls .github/policies/leadership-brief-*.md
```

Each file defines one leader. You will generate **one discussion per policy
file found**. If only one policy exists, create one discussion. If five
exist, create five.

Each policy file defines:
- **Who the leader is** — their role, scope, squads, and reporting structure
- **Their quarterly goals** — what success looks like this quarter
- **What to surface in each section** — specific trigger criteria for kudos,
  feedback, and pre-escalation unique to this leader's domain
- **Their weekly rhythm** — how they use the brief in their week
- **Leader-specific sensitivity** — any additional sensitivity rules beyond
  the defaults (e.g., "use relative revenue numbers, not absolutes")

Follow each policy precisely. The criteria for each section are specific to
that leader's domain and management style.

## Reporting Window

The brief covers the **previous 7 days** of activity. It is generated
Monday morning so leaders can use it to plan the week — 1:1 agendas,
team meeting topics, and proactive outreach.

## Sensitivity Defaults

These rules apply to **all** leader briefs. Individual policies may add
leader-specific rules on top.

- **Kudos should name individuals** when identifiable from comments or
  assignee fields — recognition only works when it's personal.
- **Feedback must never name individuals negatively** — attribute to the
  launch, squad, or process, not the person.
- **Pre-Escalation must focus on the blocker and the stakes** — not blame
  any individual for the delay.
- **Escape all @mentions** to avoid noisy notifications.

## Tone Defaults

These tone guidelines apply to **all** leader briefs:

- **Kudos:** Genuine, specific, names the person or team and what they did.
  "Great work" is useless. "Shipped the auth migration 3 days early despite
  the API freeze" is actionable recognition.
- **Feedback:** Constructive and curious, not accusatory. Frame as "worth
  asking about" not "this is wrong." Leaders use these as 1:1 questions.
- **Pre-Escalation:** Direct and actionable. State what's happening, why it
  matters, and what the leader can specifically do (make a call, reallocate
  resources, escalate upward).

## Pre-Fetched Data

A deterministic pre-step has already fetched all project data:

- **`launch-data-summary.json`** — Read this first with `cat launch-data-summary.json`.
- **`launch-data.json`** — Full data with issue bodies. Use `jq` to extract
  only what you need.

> **⚠️ Token efficiency:** Read `launch-data-summary.json` once. Only read
> `launch-data.json` if you need issue bodies for detail.

## Process

### Step 1: Discover Leaders and Load Data

```bash
# Discover all leader policy files
LEADER_POLICIES=$(ls .github/policies/leadership-brief-*.md)
echo "Found $(echo "$LEADER_POLICIES" | wc -l | tr -d ' ') leader policy files:"
echo "$LEADER_POLICIES"
```

Then load the shared portfolio data (this is the same for all leaders):

```bash
cat launch-data-summary.json
```

Now read **all** policy files to understand every leader's context:

```bash
for policy in .github/policies/leadership-brief-*.md; do
  echo "============================================"
  echo "POLICY: $policy"
  echo "============================================"
  cat "$policy"
  echo ""
done
```

For each leader, internalize:
- Squads and focus areas (filter portfolio data to their scope)
- Quarterly goals (evaluate activity against these goals)
- Criteria for each section (kudos, feedback, pre-escalation)
- Sensitivity rules (who to name, how to frame)

### Step 2: Scope the Portfolio to Each Leader

Extract items relevant to each leader's domain. Not everything in the
portfolio is theirs — filter to launches and initiatives that fall within
each leader's squads' focus areas.

```bash
# All launches with labels and status
jq '[.items[] | select(.labels.nodes[]?.name == "launch") | {number, title, url, state, labels: [.labels.nodes[].name], body}]' launch-data.json

# All initiatives
jq '[.items[] | select(.labels.nodes[]?.name == "initiative") | {number, title, url, state, labels: [.labels.nodes[].name]}]' launch-data.json
```

Map each launch to each leader's squads based on content, labels, and
focus areas defined in their policy. If a launch doesn't clearly fall
within a leader's scope, exclude it from their brief — each brief should
only contain items that leader owns or is accountable for.

> **Note:** A single launch may appear in multiple leaders' briefs if
> their scopes overlap. That's fine — each leader will see it framed
> through their own goals and criteria.

### Step 3: Determine the Reporting Window

Calculate the 7-day window ending at the current run time.

### Step 4: Fetch Comments From In-Scope Issues

For each in-scope launch and its sub-issues that were updated within the
reporting window, fetch recent comments:

```bash
# For each issue number updated in the last 7 days:
gh issue view <number> --repo ${{ github.repository }} --json comments --jq '.comments[] | select(.createdAt >= "<7-days-ago>") | {author: .author.login, body: .body, createdAt: .createdAt}'
```

> **⚠️ Token efficiency:** Only fetch comments for issues whose `updatedAt`
> falls within the reporting window. Skip issues with no recent activity.

Scan comments for signals that map to the three sections:
- **Kudos signals:** Celebrations, completions, shout-outs, milestones
- **Feedback signals:** Scope creep, timeline slips, quality concerns,
  siloed work, missing documentation
- **Pre-escalation signals:** Blockers, resource conflicts, unresponsive
  dependencies, SLA risks, stakeholder misalignment

### Step 5: Evaluate Against Quarterly Goals

For each quarterly goal in the policy, assess:
- Is there progress this week that advances this goal? → Kudos candidate
- Is there activity that undermines or ignores this goal? → Feedback candidate
- Is there a risk that this goal won't be met? → Pre-escalation candidate

This step ensures the brief stays anchored to what the leader has
committed to delivering, not just what happened to be active this week.

### Step 6: Build the Kudos Section

From the signals gathered, identify items that deserve recognition.
For each kudos item:

1. Name the **specific accomplishment** (not "good progress" — what shipped?)
2. Name the **person or squad** responsible (recognition must be personal)
3. Connect to a **quarterly goal** if applicable (shows strategic impact)
4. Link to the **issue or launch** for context

Prioritize kudos that:
- Directly advance a quarterly goal
- Represent cross-squad collaboration
- Involve someone who doesn't usually get visibility
- Show the team living the org's values

### Step 7: Build the Feedback Section

Identify items where gentle course-correction would help. For each item:

1. State the **observation** factually (what's happening, with evidence)
2. Frame as a **question** the leader might ask ("worth asking if…")
3. Suggest a **conversation** not a directive
4. Never name an individual negatively — attribute to the launch or squad

Prioritize feedback that:
- Catches a problem early enough to fix cheaply
- Affects a quarterly goal
- Represents a pattern (not a one-time thing)
- The team likely doesn't realize is happening

### Step 8: Build the Pre-Escalation Section

Identify items where the leader's involvement can prevent a bigger problem.
For each item:

1. State **what's happening** (the situation)
2. Explain **why it matters** (the stakes — what happens if nothing changes)
3. Recommend a **specific action** the leader can take (call someone, make a
   decision, reallocate resources, escalate to their boss)
4. Include a **time dimension** (how urgent — this week, next 2 weeks, this month)

Prioritize pre-escalations that:
- Have a clear time pressure
- The team has already tried to resolve on their own
- Require authority or access the team doesn't have
- Could cascade into multiple problems if left unaddressed

### Step 9: Generate Discussions — One Per Leader

**Repeat steps 2–8 for each leader policy file**, then create **one
discussion per leader**. Process leaders in the order their policy files
are discovered.

#### Discussion Title

```
[Leadership Brief] Week of {YYYY-MM-DD} — {Leader Name}, {Leader Role}
```

Use the Monday of the current week as the date. Include the leader's
name to distinguish discussions when multiple briefs are created.

#### Discussion Body

```markdown
### 📋 Leadership Brief — Week of {YYYY-MM-DD}

> **For:** {Leader Name}, {Role}
> **Scope:** {N} launches in scope · {A} with activity this week
> **Quarterly goal progress:** {summary line}

---

### 🎉 Give Kudos

Recognition-worthy accomplishments from the past week. Use these in
1:1s and team meetings.

* **[Launch or Initiative Title](url)** — {Person or Squad} {what they
  accomplished and why it matters}. {Connection to quarterly goal if
  applicable.}

---

### 💬 Give Feedback

Items worth a coaching conversation. Frame as questions, not directives.

* **[Launch or Initiative Title](url)** — {Factual observation of what's
  happening}. Worth asking: {suggested question for a 1:1 or check-in}.

---

### 🚨 Get Involved

Situations where your intervention this week can prevent a bigger problem.

* **[Launch or Initiative Title](url)** — {What's happening and why it
  matters}. **Suggested action:** {specific thing the leader can do}.
  **Urgency:** {this week / next 2 weeks / this month}.

---

### 🎯 Quarterly Goal Tracker

| Goal | Status | This Week |
|------|:---:|-----------|
| Ship v3 API migration | 🟢/🟡/🔴 | {1-sentence progress update} |
| Reduce onboarding time | 🟢/🟡/🔴 | {1-sentence progress update} |
| Zero critical vulns | 🟢/🟡/🔴 | {1-sentence progress update} |
| Platform reliability | 🟢/🟡/🔴 | {1-sentence progress update} |
| Automation over toil | 🟢/🟡/🔴 | {1-sentence progress update} |

---

### 📅 Suggested Actions This Week

A checklist distilled from the sections above.

- [ ] {Action from Kudos — e.g., "Recognize @person in Monday standup for X"}
- [ ] {Action from Feedback — e.g., "Ask @manager about scope on Launch Y"}
- [ ] {Action from Pre-Escalation — e.g., "Call meeting with Org Z re: dependency"}
```

### Step 10: Handle Empty Sections

If a section has no qualifying items, include the section header with:

```markdown
* No items this week. ✅
```

An empty "Get Involved" section is great news. An empty "Give Kudos"
section should prompt a note: "No standout items surfaced — consider
whether recognition is being captured in issue comments."

### Step 11: Summary Output

After creating all discussions, print a summary to stdout:

```
Leadership Briefs Generated
==============================

📅 Week of YYYY-MM-DD
📋 Leaders briefed: N

  📋 {Leader Name}, {Role}
     🔍 Launches in scope: N (M with activity)
     🎉 Kudos: N · 💬 Feedback: N · 🚨 Pre-Escalation: N · 📅 Actions: N

  📋 {Leader Name}, {Role}
     🔍 Launches in scope: N (M with activity)
     🎉 Kudos: N · 💬 Feedback: N · 🚨 Pre-Escalation: N · 📅 Actions: N

Discussions created: N
```

## Safe output calls

Write body content to a temp file, then call with explicit flags (stdin redirection can silently fail in this environment):

```bash
cat > /tmp/gh-aw/agent/body.md << 'BODY'
...content...
BODY
safeoutputs create_discussion --title "title" --body "$(cat /tmp/gh-aw/agent/body.md)"
# or: safeoutputs create_issue / add_comment / create_pull_request — same pattern
```

Configured title prefixes are added automatically — omit them from `--title`. If you cannot create the required leadership brief discussions, immediately call `safeoutputs report_incomplete --reason "brief reason" --details "what prevented leadership brief creation"` and stop — never ask for input. Do not finish the run without a `safeoutputs` call.

## Guidelines

- Create exactly **one discussion per leader policy file** found.
- This is a **leadership action guide**, not a status report. Every item
  should answer "what should the leader *do* about this?"
- Kudos should be specific enough to quote in a 1:1. "Great work" is
  useless. "Shipped the auth migration 3 days early despite the API
  freeze" is actionable recognition.
- Feedback should be framed as curiosity, not criticism. "The scope on
  Launch X expanded by 4 sub-issues this week without an updated
  timeline — worth checking in on" is better than "Launch X has scope creep."
- Pre-escalation should always include a specific action. "This is a
  problem" is not helpful. "Schedule 30 minutes with the Security team
  to unblock the compliance review" is.
- The quarterly goal tracker anchors the brief in strategic context.
  Update status colors based on evidence from the week, not gut feeling.
- Keep the suggested actions list to 5-7 items max. If there are more,
  prioritize by impact and urgency.
- Escape all @mentions to avoid noisy notifications.
- If the data shows no activity in the reporting window for a leader's
  scope, still create their discussion with empty sections and a note.
- If a previous week's briefs exist, the older ones will be closed
  automatically via `close-older-discussions`.
- If a new leader policy file is added, the next run will automatically
  include them — no workflow changes needed.
- If a leader policy file is removed, their brief simply stops being
  generated — no cleanup needed.
