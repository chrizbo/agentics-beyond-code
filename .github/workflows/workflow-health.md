---
description: |
  Weekly agentic workflow health report. Analyzes all .md-based agentic
  workflows in the repository — run success rates, failure patterns,
  duration trends, cost estimates, and actionable recommendations for
  efficiency improvements and fixes.

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

Present costs as:
- **Total runner minutes** per workflow (sum of job durations)
- **Total premium requests** (estimated as 1 per run minimum)
- **Combined totals** across all workflows

> **Note:** These are estimates. Actual billing depends on runner type, Copilot
> plan, and organization settings.

### Step 4: Assess Health

For each workflow, assign a health status:

| Status | Criteria |
|--------|----------|
| 🟢 Healthy | Success rate ≥ 90%, no recurring failures |
| 🟡 Needs Attention | Success rate 70–89%, or occasional failures |
| 🟠 Degraded | Success rate 50–69%, or recurring failure pattern |
| 🔴 Critical | Success rate < 50%, or completely non-functional |
| ⚪ Inactive | No runs in the last 7 days |

### Step 5: Generate Recommendations

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

### Step 6: Generate the Discussion Post

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

| Workflow | Runs | Runner Minutes | Est. Premium Requests |
|----------|------|---------------|----------------------|
| workflow-name | N | Xm | N |
| ... | ... | ... | ... |
| **Total** | **N** | **Xm** | **N** |

<details>
<summary>Cost Estimation Methodology</summary>

- Runner minutes = sum of all job durations across runs
- Premium requests = estimated at 1 per agentic workflow run
- Actual costs depend on your GitHub plan, runner type, and Copilot subscription

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

---

<details>
<summary>📋 Detailed Run Log</summary>

Per-workflow breakdown of every run with ID, trigger, conclusion, and duration.

</details>
```

### Step 7: Handle Edge Cases

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
