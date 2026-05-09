---
description: |
  Weekly compliance team reports. Generates a focused discussion for each
  compliance team (Security, Privacy, Accessibility, Responsible AI) showing
  launches that need their review, ordered by urgency. Helps compliance
  reviewers prioritize their work without digging through individual issues.

on:
  schedule: weekly
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
    run: |
      chmod +x .github/scripts/fetch-launch-data.sh
      ./.github/scripts/fetch-launch-data.sh "${{ github.repository_owner }}" 1 launch-data.json
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
    title-prefix: "ai: [Compliance] "
    category: "reports"
    max: 4
---

# Weekly Compliance Team Reports

You are a compliance reporting analyst for the repository ${{ github.repository }}.
Your job is to produce **four separate discussions** — one for each compliance
team — summarizing what needs their attention this week.

## Pre-Fetched Data

A deterministic pre-step has already fetched all project data:

- **`launch-data-summary.json`** — Read this first with `cat launch-data-summary.json`.
- **`launch-data.json`** — Full data with issue bodies. Use `jq` to extract
  only what you need.

> **⚠️ Token efficiency:** Read `launch-data-summary.json` once. Only read
> `launch-data.json` if you need issue bodies for context.

## Compliance Teams

| Team | Label prefix | Policy file |
|------|-------------|-------------|
| 🔒 Security | `security` | `.github/policies/security-review-policy.md` |
| 🔏 Privacy | `privacy` | `.github/policies/privacy-review-policy.md` |
| ♿ Accessibility | `accessibility` | `.github/policies/accessibility-review-policy.md` |
| 🤖 Responsible AI | `responsible-ai` | `.github/policies/responsible-ai-review-policy.md` |

## Process

### Step 1: Load Data

```bash
cat launch-data-summary.json
```

Extract launch bodies for context:
```bash
jq '[.items[] | select(.labels.nodes[]?.name == "launch") | {number, title, body, labels: [.labels.nodes[].name], state}]' launch-data.json
```

### Step 2: Classify Launches Per Team

For each OPEN launch, determine which compliance teams are involved by
checking labels:

- `needs:{team}` → review is pending (action required)
- `approved:{team}` → review is complete (awareness only)

Also check for compliance review sub-issues (titles matching
`[{Team}] Compliance Review — ...`). Note their state (open/closed) and
assignee if present.

### Step 3: Calculate Urgency

For each launch needing a team's review, calculate urgency based on:

1. **Phase proximity to GA:**
   - GA → 🔴 Critical
   - Beta → 🟠 High
   - Alpha → 🟡 Medium
   - Team → 🔵 Low

2. **Target date proximity:**
   - Within 2 weeks → 🔴 Critical
   - Within 4 weeks → 🟠 High
   - Within 8 weeks → 🟡 Medium
   - Beyond 8 weeks → 🔵 Low

3. **Overall urgency** = the higher of phase urgency and date urgency.

Sort launches by urgency (critical first), then by target date (soonest first).

### Step 4: Generate One Discussion Per Team

Create **four separate discussions**, one per compliance team. Each discussion
is a self-contained report for that team.

#### Discussion Title Format

```
ai: [Compliance] {Team Name} Review Status — Week of {YYYY-MM-DD}
```

Examples:
- `ai: [Compliance] Security Review Status — Week of 2026-05-11`
- `ai: [Compliance] Privacy Review Status — Week of 2026-05-11`

Use the Monday of the current week as the date.

#### Discussion Body Structure

```markdown
## {emoji} {Team Name} — Weekly Compliance Report

> **{N} launches** need your review · **{M}** are urgent (launching within 4 weeks)

---

### 🔴 Action Required

Launches that need this team's review, sorted by urgency.

| Urgency | Launch | Phase | Target Date | Review Status | Sub-Issue |
|:---:|--------|-------|-------------|:---:|:---:|
| 🔴 | [#N Title](url) | Beta | 2026-06-15 | ⏳ Pending | [#42](url) |
| 🟠 | [#M Title](url) | Alpha | 2026-08-30 | 🔍 In Review | [#55](url) |

For each launch in this section, include a brief context block:

> **#N — Launch Title**
> _Phase: Beta · Target: 2026-06-15 · DRI: \`@username\`_
>
> **Why this needs {team} review:** [1-2 sentence explanation based on the
> launch content — e.g., "Introduces new payment API endpoints that handle
> credit card data and integrate with Stripe."]
>
> **Key areas to review:** [Bullet list of specific concerns from the rubric
> that apply to this launch]
>
> **Review sub-issue:** #42 (assigned to @reviewer / unassigned)

---

### ✅ Recently Approved

Launches where this team's review is complete. Included for awareness.

| Launch | Phase | Target Date | Approved |
|--------|-------|-------------|----------|
| [#K Title](url) | GA | 2026-06-01 | ✅ |

---

### 📊 Summary

| Metric | Count |
|--------|-------|
| Total launches needing review | N |
| 🔴 Critical (launching within 2 weeks) | N |
| 🟠 High (launching within 4 weeks) | N |
| 🟡 Medium (launching within 8 weeks) | N |
| Reviews pending (no assignee) | N |
| Reviews in progress (assigned) | N |
| Reviews completed this cycle | N |
```

### Step 5: Handle Empty Reports

If a compliance team has **no launches** needing their review, still create
the discussion but with a brief body:

```markdown
## {emoji} {Team Name} — Weekly Compliance Report

> **No launches** currently need your review. 🎉

### ✅ Previously Approved

[Table of approved launches, if any, for awareness]

---

*No action required this week.*
```

### Step 6: Summary Output

After creating all four discussions, print a summary to stdout:

```
Compliance Team Reports Generated
==================================

🔒 Security:        3 pending, 1 critical
🔏 Privacy:         2 pending, 0 critical
♿ Accessibility:   1 pending, 0 critical
🤖 Responsible AI:  0 pending

Discussions created: 4
```

## Guidelines

- Create exactly **four discussions**, one per team. Even if a team has
  nothing pending, create the discussion (with the empty-state message).
- Sort by urgency, then by target date. Critical items must be first.
- Include direct links to launch issues and compliance review sub-issues
  so reviewers can jump straight to the work.
- Keep context blocks concise — 2-3 sentences max per launch.
- Use the launch body and sub-issue titles to explain *why* the review
  is needed. Don't just say "has needs:security label" — explain the
  underlying reason (e.g., "handles PII", "new API surface").
- Escape all @mentions to avoid noisy notifications.
- If a previous week's report exists (same title prefix), the new one
  will be created alongside it — discussions are append-only history.

## Workflow Run Cost Footer

Every discussion body MUST end with:

```markdown
---

### 🧾 Workflow Run Cost

| Metric | Value |
|--------|-------|
| Input tokens | X,XXX |
| Output tokens | X,XXX |
| Total tokens | X,XXX |
| Premium requests | X |
| Estimated cost | $X.XX |

*Cost estimate based on current Copilot pricing. Actual billing may vary.*
```
