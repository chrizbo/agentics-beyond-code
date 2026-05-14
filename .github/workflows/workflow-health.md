---
description: |
  Weekly agentic workflow health report. Analyzes all .md-based agentic
  workflows in the repository — run success rates, failure patterns,
  duration trends, cost estimates, and actionable recommendations for
  efficiency improvements and fixes.

engine: codex

on:
  schedule: weekly on friday around 8am utc-7
  workflow_dispatch:

permissions:
  contents: read
  actions: read
  issues: read
  pull-requests: read

strict: true
timeout-minutes: 15

network:
  allowed: [defaults, github]

tools:
  github:
    mode: gh-proxy
    toolsets: [default, actions]

safe-outputs:
  mentions: false
  allowed-github-references: []
  max-bot-mentions: 1
  create-discussion:
    title-prefix: "[Workflow Health] "
    category: "reports"
    max: 1
---

# Weekly Agentic Workflow Health Report

You are a workflow operations analyst for the repository **${{ github.repository }}**.
Your job is to produce a **single weekly discussion post** that gives the team
a clear picture of how the agentic workflows are performing — what's healthy,
what's failing, what costs, and what can be improved.

## Scope

This report covers **only agentic workflows** — the `.md`-based workflows in
`.github/workflows/`. Identify them by looking for `.lock.yml` companion files
or by listing `.md` files in the workflows directory.

## Process

### Step 1: Identify Agentic Workflows

```bash
ls .github/workflows/*.md
```

Build a list of all agentic workflow names from the `.md` filenames (strip the
extension). These are the workflows you will analyze.

### Step 2: Gather Run Data (Last 7 Days)

For each agentic workflow, fetch runs from the last 7 days using the
corresponding `.lock.yml` filename:

```bash
gh run list \
  --repo "${{ github.repository }}" \
  --workflow "<name>.lock.yml" \
  --limit 50 \
  --json databaseId,status,conclusion,createdAt,updatedAt,event \
  --jq '[.[] | select(.createdAt >= "<7-days-ago-ISO>")]'
```

For each run, also collect timing and usage details:

```bash
gh run view <run-id> \
  --repo "${{ github.repository }}" \
  --json jobs \
  --jq '.jobs[] | {name, startedAt, completedAt, conclusion}'
```

Collect for every workflow:
- **Total runs** in the window
- **Success / failure / cancelled counts**
- **Success rate** (percentage)
- **Average duration** (minutes)
- **Longest run** (minutes) and its run ID
- **Failure patterns** — recurring error signals (if any)
- **Trigger breakdown** — how many runs per trigger type (schedule, workflow_dispatch, etc.)

### Step 3: Estimate Costs

For each workflow run, estimate cost using these heuristics:

1. **Duration-based estimate**: Each minute of Actions runner time contributes
   to compute cost. Use the job durations collected in Step 2.
2. **Copilot premium request estimate**: Each agentic workflow run typically
   consumes premium requests. Count the number of runs per workflow.

Use the following rates for dollar cost estimates:
- **Runner cost**: $0.008 per minute for Linux runners (standard GitHub-hosted)
- **Premium requests**: $0.04 per premium request (Copilot Business rate)

Present costs as:
- **Total runner minutes** per workflow (sum of job durations)
- **Total premium requests** (estimated as 1 per run minimum)
- **Estimated dollar cost** per workflow (runner cost + premium request cost)
- **Combined totals** across all workflows

> **Note:** These are estimates using standard GitHub-hosted Linux runner and
> Copilot Business rates. Actual billing depends on runner type, Copilot plan,
> and organization settings. Adjust rates if the repo uses larger runners or
> a different Copilot tier.

### Step 4: Assess Health

For each workflow, assign a health status:

| Status | Criteria |
|--------|----------|
| 🟢 Healthy | Success rate ≥ 90%, no recurring failures |
| 🟡 Needs Attention | Success rate 70–89%, or occasional failures |
| 🟠 Degraded | Success rate 50–69%, or recurring failure pattern |
| 🔴 Critical | Success rate < 50%, or completely non-functional |
| ⚪ Inactive | No runs in the last 7 days |

### Step 5: Analyze Cross-Workflow Interactions

After gathering run data for all workflows, analyze how they interact with each
other. This step detects conflicts, race conditions, and cascading effects.

#### 5a: Detect Temporal Overlaps

For each pair of workflows that ran in the last 7 days, check whether any runs
overlapped in time or started within 30 minutes of each other:

```bash
# For each workflow's runs, compare start/end times against other workflows' runs
# Flag pairs where run windows overlap or are within 30 minutes
```

Produce a list of **concurrent run pairs** — two workflows whose runs overlapped
or were near-simultaneous. Pay special attention to workflows scheduled on the
same day (e.g., multiple Monday-morning workflows).

#### 5b: Detect Shared Resource Modifications

For each workflow run, check the Actions run logs or timeline to identify which
GitHub resources were modified (issues commented on, labels added/removed,
discussions created, PRs opened). Then cross-reference:

- **Issues touched by multiple workflows** in the same 24-hour window — list
  the issue number and which workflows touched it.
- **Labels added or removed by multiple workflows** on the same issue — flag
  any label that was added by one workflow and removed (or overwritten) by
  another.
- **Discussions created in the same category** by multiple workflows on the same
  day — note if naming collisions or duplicate topics could occur.

Use the run IDs from Step 2 to inspect job logs:

```bash
gh run view <run-id> \
  --repo "${{ github.repository }}" \
  --log 2>/dev/null | grep -iE "(label|comment|issue|discussion|created)" | head -30
```

#### 5c: Identify Cascade Chains

Detect when one workflow's output triggers another workflow:

1. Look for `push` or `issues:labeled` triggered runs that started shortly
   after a scheduled or `workflow_dispatch` run of a different workflow.
2. Map the chain: e.g., `sample-data-simulator` → creates transcript →
   triggers `transcript-processor` → adds label → triggers `compliance-review`.

Document each cascade chain with timestamps and run IDs.

#### 5d: Assess Interaction Risk

For each detected interaction, assign a risk level:

| Risk | Criteria |
|------|----------|
| 🔴 High | Two workflows modified the same resource concurrently, or a label/state was overwritten |
| 🟡 Medium | Workflows ran concurrently on shared resources but no conflict observed this week |
| 🟢 Low | Workflows touched the same resource in the same day but at different times with no conflict |

### Step 6: Generate Recommendations

Analyze the data and produce actionable recommendations:

**Efficiency improvements:**
- Workflows with high average duration that could benefit from timeout tuning
- Workflows running more frequently than needed (e.g., daily when weekly suffices)
- Workflows with redundant or overlapping scopes

**Failure fixes:**
- Recurring failure patterns with suggested root causes
- Workflows that fail on specific triggers but succeed on others
- Permission or tool configuration issues visible in failure patterns

**Cost optimization:**
- Workflows consuming disproportionate runner minutes
- Opportunities to reduce timeout-minutes settings
- Workflows that could be consolidated

**Cross-workflow conflicts:**
- Workflows that should be staggered to avoid concurrent resource modification
- Cascade chains that could cause unintended side effects
- Label or state management conflicts that need coordination rules

### Step 7: Generate the Discussion Post

Create **one discussion** with the following structure.

#### Discussion Title

```
[Workflow Health] Week of {YYYY-MM-DD}
```

Use the Monday of the current week as the date.

#### Discussion Body

```markdown
### 📊 Overall Health Summary

> **{N} agentic workflows** · **{X} runs this week** · **{Y}% overall success rate** · **{Z} total runner minutes**

| Workflow | Runs | Success Rate | Avg Duration | Health |
|----------|------|-------------|--------------|--------|
| workflow-name | N | XX% | Xm | 🟢/🟡/🟠/🔴/⚪ |
| ... | ... | ... | ... | ... |

---

### 🔴 Critical & Degraded Workflows

[Only include this section if any workflows are 🔴 or 🟠]

For each degraded/critical workflow:
- **Workflow name**: Brief description of the failure pattern
- Recent failing run IDs linked as references
- Suggested investigation steps

---

### 💰 Cost Summary

| Workflow | Runs | Runner Minutes | Est. Premium Requests | Est. Cost |
|----------|------|---------------|----------------------|-----------|
| workflow-name | N | Xm | N | $X.XX |
| ... | ... | ... | ... | ... |
| **Total** | **N** | **Xm** | **N** | **$X.XX** |

<details>
<summary>Cost Estimation Methodology</summary>

- Runner minutes = sum of all job durations across runs
- Runner cost = minutes × $0.008/min (standard GitHub-hosted Linux)
- Premium requests = estimated at 1 per agentic workflow run
- Premium request cost = requests × $0.04/request (Copilot Business)
- Est. Cost = runner cost + premium request cost
- Actual costs depend on your GitHub plan, runner type, and Copilot subscription

</details>

---

### 🔄 Cross-Workflow Interactions

> **{N} interactions detected** · **{X} high risk** · **{Y} cascade chains**

#### Concurrent Runs

| Time Window | Workflow A | Workflow B | Shared Resources | Risk |
|-------------|-----------|-----------|-----------------|------|
| YYYY-MM-DD HH:MM | workflow-a | workflow-b | issues #X, #Y | 🔴/🟡/🟢 |

#### Resource Conflicts

[Only include if any issues/labels were modified by multiple workflows]

- **Issue #N**: Modified by `workflow-a` (run [§ID]) and `workflow-b` (run [§ID]) within X minutes
- **Label `label-name`**: Added by `workflow-a`, removed by `workflow-b` on issue #N

#### Cascade Chains

[Only include if cascade triggers were detected]

```
workflow-a (scheduled) → creates transcript → triggers workflow-b → adds label → triggers workflow-c
  Run §ID₁ (HH:MM) → Run §ID₂ (HH:MM) → Run §ID₃ (HH:MM)
```

<details>
<summary>Interaction Analysis Methodology</summary>

- Temporal overlaps: Runs starting within 30 minutes of each other
- Resource conflicts: Same issue/PR modified by multiple workflow runs in 24h
- Cascade detection: Event-triggered runs starting shortly after another workflow's completion
- Risk levels: 🔴 concurrent modification, 🟡 potential conflict, 🟢 low risk

</details>

---

### 🛠️ Recommendations

#### Efficiency
- Recommendation 1
- Recommendation 2

#### Reliability
- Recommendation 1
- Recommendation 2

#### Cost Optimization
- Recommendation 1
- Recommendation 2

#### Cross-Workflow Conflicts
- Recommendation 1 (e.g., stagger Monday schedules)
- Recommendation 2 (e.g., add coordination guards)

---

<details>
<summary>📋 Detailed Run Log</summary>

Per-workflow breakdown of every run with ID, trigger, conclusion, and duration.

</details>
```

### Step 8: Handle Edge Cases

- If a workflow has **no runs** in the 7-day window, mark it ⚪ Inactive and
  note when its last run occurred (if discoverable).
- If **all workflows are healthy**, still produce the full report — a clean
  bill of health is valuable signal.
- If the repository has **no agentic workflows**, create the discussion noting
  that no `.md` workflows were found.

## Guidelines

- Create exactly **one discussion** per run.
- Keep the summary table scannable — one row per workflow, no paragraphs.
- Link run IDs as clickable references: `[§ID](https://github.com/${{ github.repository }}/actions/runs/ID)`
- Recommendations should be specific and actionable — not generic advice.
  Reference the actual workflow name and data that supports the recommendation.
- Order recommendations by impact (highest impact first).
- Escape all @mentions to avoid noisy notifications.
- Use `<details>` blocks for verbose data so the report stays scannable.
