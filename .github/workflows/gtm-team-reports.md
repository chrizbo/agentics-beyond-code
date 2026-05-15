---
description: |
  Weekly GTM team report. Generates a discussion summarizing launches that
  need go-to-market action — missing changelog drafts, missing roadmap items,
  content that needs refreshing, and upcoming launches that need GTM readiness.
  Helps the GTM team prioritize their work without digging through individual issues.

engine:
  id: codex
  model: openai/gpt-5-mini

on:
  schedule: weekly on monday around 8am utc-7
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
    title-prefix: "[GTM] "
    category: "reports"
    max: 1
---

# Weekly GTM Team Report

You are a go-to-market reporting analyst for the repository ${{ github.repository }}.
Your job is to produce a weekly report for the GTM team showing which launches
need their attention — missing content, stale drafts, and upcoming deadlines.

## Pre-Fetched Data

A deterministic pre-step has already fetched all project data:

- **`launch-data-summary.json`** — Read this first with `cat launch-data-summary.json`.
- **`launch-data.json`** — Full data with issue bodies. Use `jq` to extract
  only what you need.

> **⚠️ Token efficiency:** Read `launch-data-summary.json` once. Only read
> `launch-data.json` if you need issue bodies for context.

## GTM Content Types to Track

| Content Type | Sub-issue title pattern | Required from phase |
|---|---|---|
| 📣 Changelog draft | `[GTM] Changelog draft — ...` | Alpha |
| 🗺️ Roadmap item | `[GTM] Roadmap item — ...` | Team |

## Process

### Step 1: Load Data

```bash
cat launch-data-summary.json
```

Then extract launch details including sub-issue titles (to find existing GTM content):
```bash
jq '[.items[] | select(.labels.nodes[]?.name == "launch") | {number, title, body, labels: [.labels.nodes[].name], state}]' launch-data.json
```

### Step 2: Inventory GTM Content Per Launch

For each OPEN launch, check its sub-issues for existing GTM content:

1. **Changelog draft:** Does a sub-issue titled `[GTM] Changelog draft — ...` exist?
   - If yes, is it open or closed? When was it last updated?
2. **Roadmap item:** Does a sub-issue titled `[GTM] Roadmap item — ...` exist?
   - If yes, is it open or closed? When was it last updated?

Classify each launch's GTM readiness:
- ✅ **Complete** — All required content exists and is up to date
- ⏳ **In Progress** — Some content exists but is incomplete or stale
- ❌ **Missing** — Required content does not exist yet
- ➖ **Not Yet Required** — Launch is too early for this content type

### Step 3: Calculate Urgency

For each launch with GTM gaps, calculate urgency based on:

1. **Phase proximity to GA:**
   - GA → 🔴 Critical (content should be finalized)
   - Beta → 🟠 High (drafts should exist and be near-final)
   - Alpha → 🟡 Medium (initial drafts should be created)
   - Team → 🔵 Low (only roadmap item needed)

2. **Target date proximity:**
   - Within 2 weeks → 🔴 Critical
   - Within 4 weeks → 🟠 High
   - Within 8 weeks → 🟡 Medium
   - Beyond 8 weeks → 🔵 Low

3. **Content staleness:**
   - GTM sub-issue not updated in 3+ weeks → bump urgency one level

4. **Overall urgency** = the highest of phase urgency, date urgency,
   and staleness urgency.

Sort launches by urgency (critical first), then by target date (soonest first).

### Step 4: Generate the Discussion

Create **one discussion** with the full GTM readiness report.

#### Discussion Title Format

```
[GTM] Go-to-Market Readiness — Week of {YYYY-MM-DD}
```

Use the Monday of the current week as the date.

#### Discussion Body Structure

```markdown
### 🚀 GTM Team — Weekly Readiness Report

> **{N} launches** need GTM action · **{M}** are urgent (launching within 4 weeks)

---

### 🔴 Action Required

Launches that are missing GTM content or have stale drafts, sorted by urgency.

| Urgency | Launch | Phase | Target Date | Changelog | Roadmap | Gap |
|:---:|--------|-------|-------------|:---:|:---:|-----|
| 🔴 | [#N Title](url) | GA | 2026-06-01 | ❌ Missing | ✅ #42 | Changelog needed before launch |
| 🟠 | [#M Title](url) | Beta | 2026-07-15 | ⏳ Stale | ✅ #55 | Changelog not updated in 4 weeks |

For each launch in this section, include a context block:

> **#N — Launch Title**
> _Phase: Beta · Target: 2026-07-15 · DRI: \`@username\`_
>
> **What's needed:** [Specific GTM actions — e.g., "Changelog draft needs to
> be created. Launch introduces new payment methods that customers need to
> know about."]
>
> **Key messaging points:** [2-3 bullet points about what makes this launch
> notable for customers, derived from the launch body and sub-issues]
>
> **Existing GTM content:** Roadmap item #55 (last updated 2026-05-01)

---

### ✅ GTM Ready

Launches where all required GTM content exists and is current.

| Launch | Phase | Target Date | Changelog | Roadmap |
|--------|-------|-------------|:---:|:---:|
| [#K Title](url) | Beta | 2026-08-30 | ✅ #60 | ✅ #61 |

---

### 📅 Upcoming Deadlines

Launches with target dates in the next 4 weeks that the GTM team should
be aware of, regardless of content status.

| Launch | Phase | Target Date | Days Until Launch | GTM Status |
|--------|-------|-------------|:-:|---|
| [#N Title](url) | GA | 2026-05-20 | 11 | ⚠️ Changelog needs final review |

---

### 📊 Summary

| Metric | Count |
|--------|-------|
| Total active launches | N |
| Launches needing GTM action | N |
| 🔴 Critical (launching within 2 weeks) | N |
| 🟠 High (launching within 4 weeks) | N |
| Missing changelog drafts | N |
| Missing roadmap items | N |
| Stale GTM content (3+ weeks old) | N |
| GTM-ready launches | N |
```

### Step 5: Handle Empty Reports

If **no launches** need GTM action, still create the discussion:

```markdown
### 🚀 GTM Team — Weekly Readiness Report

> **All launches** have up-to-date GTM content. 🎉

### ✅ GTM Ready

[Table of all launches with their GTM content status]

---

*No action required this week.*
```

### Step 6: Summary Output

After creating the discussion, print a summary to stdout:

```
GTM Team Report Generated
===========================

🔴 Critical:    1 launch (missing changelog, launching in 11 days)
🟠 High:        2 launches (stale content)
🟡 Medium:      1 launch (missing roadmap item)
🔵 Low:         0 launches

GTM-ready:      3 launches
Discussion created: 1
```

## Guidelines

- Create exactly **one discussion** with the complete GTM readiness report.
- Sort by urgency, then by target date. Critical items must be first.
- Include direct links to launch issues and GTM sub-issues so the team
  can jump straight to the work.
- Keep context blocks concise — 2-3 sentences max per launch.
- Derive messaging points from the launch body and sub-issue titles.
  Don't just say "changelog is missing" — explain *why* it matters
  (e.g., "customers need to migrate their API calls before GA").
- Escape all @mentions to avoid noisy notifications.
- If a previous week's report exists (same title prefix), the new one
  will be created alongside it — discussions are append-only history.
