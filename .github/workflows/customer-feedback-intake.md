---
description: |
  Fixture-first customer feedback intake workflow. Normalizes feedback fixtures
  from the hypothetical agentics-beyond-code-test repo, Discord, and Slack;
  creates deduplicated GitHub feedback intake issues; and adds them to the
  Customer Feedback Queue project.

engine:
  id: codex
  model: gpt-5-mini

on:
  push:
    branches: [main]
    paths:
      - 'feedback-fixtures/**/*.json'
      - '.github/scripts/normalize-feedback-fixtures.mjs'
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read

strict: true
timeout-minutes: 20
max-ai-credits: 1000

network:
  allowed: [defaults, github]

steps:
  - name: Normalize feedback fixtures
    id: normalize-feedback
    run: |
      node .github/scripts/normalize-feedback-fixtures.mjs --write > feedback-normalizer-output.json

tools:
  github:
    mode: gh-proxy
    toolsets: [default, issues]
    lockdown: false
    min-integrity: none

safe-outputs:
  mentions: false
  allowed-github-references: []
  create-issue:
    max: 20
    labels:
      - feedback:intake
      - feedback:needs-pm-review
      - from-open-source-repo
      - from-discord
      - from-slack
  update-project:
    max: 20
    project: "https://github.com/users/chrizbo/projects/3"
    github-token: ${{ secrets.AW_TOKEN }}
  noop:
---

# Customer Feedback Intake

You are a customer feedback intake analyst for the repository
`${{ github.repository }}`. Your job is to create GitHub feedback intake issues
from normalized fixture events and add those issues to the Customer Feedback
Queue project.

This MVP is fixture-first. Do **not** call Slack, Discord, or the source repo
APIs. Treat `feedback-events/normalized-feedback-events.json`, created by the
deterministic pre-step, as the source of truth.

## Project

Customer Feedback Queue:

```text
https://github.com/users/chrizbo/projects/3
```

Use this full URL when calling `update_project`.

## Step 1: Load Normalized Feedback Events

Read the generated normalized events file:

```bash
jq '{event_count: (.events | length), fixture_files, events: [.events[] | {source_system, source_type, source_id, idempotency_key: .ingestion.idempotency_key, title: .intake.title, labels: .intake.labels, project_fields: .intake.project_fields}]}' feedback-events/normalized-feedback-events.json
```

If the file is missing, malformed, or contains zero events, call `noop` with a
brief explanation and stop.

## Step 2: Idempotency

For each event, use the exact idempotency key at:

```text
event.ingestion.idempotency_key
```

Before creating an issue, search all open and closed issues for that exact key:

```bash
gh issue list --repo ${{ github.repository }} --state all \
  --search "<idempotency-key>" \
  --json number,title,state,url
```

If any existing issue contains that key, skip creating a duplicate. If it is
open and not obviously in the project, you may call `update_project` for that
existing issue with the event's project fields.

## Step 3: Create Feedback Intake Issues

For each unique event without an existing issue:

1. Create one issue using `event.intake.title`, `event.intake.body`, and
   `event.intake.labels`.
2. After the issue is created, note the returned issue number.
3. Add the created issue to the Customer Feedback Queue project using
   `update_project` and `event.intake.project_fields`.

Use JSON safe-output calls for complex payloads:

```bash
printf '{"title":"...","body":"...","labels":["feedback:intake","feedback:needs-pm-review","from-open-source-repo"]}' \
  | safeoutputs create_issue .
```

Then:

```bash
printf '{"issue_number":123,"project":"https://github.com/users/chrizbo/projects/3","fields":{"Source":"Open Source Repo","Product Area":"Setup","Feedback Type":"Bug","Severity":"High","Reach":"Multiple Users"}}' \
  | safeoutputs update_project .
```

Do not manually summarize over the customer language. Use the preformatted body
from the normalized event so exact phrases and terminology are preserved.

## Step 4: Completion

When all unique events have either been skipped as existing or emitted as
safe-output issue creations, stop. If no new issues were needed, call `noop`
with:

```text
No new customer feedback intake issues found; all normalized fixture events already have issues.
```
