---
description: |
  Slack context processor workflow. In the MVP, processes synthetic Slack
  fixture JSON files from /slack-fixtures/, matches messages and threads to
  GitHub artifacts, and posts concise issue comments with summaries, copied
  context, and Slack permalinks.

engine:
  id: codex
  model: gpt-5-mini

on:
  push:
    branches: [main]
    paths:
      - 'slack-fixtures/**/*.json'
      - 'slack-fixtures/*.json'
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read

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
    toolsets: [default, issues]
    lockdown: false
    min-integrity: none

safe-outputs:
  mentions: false
  allowed-github-references: []
  add-comment:
    max: 20
  add-labels:
    allowed:
      - from-slack
    max: 20
  noop:
---

# Slack Context Processor

You are a Slack context analyst for the repository ${{ github.repository }}.
Your job is to process Slack-shaped fixture files dropped into
`/slack-fixtures/`, identify messages that relate to open GitHub issues, and
post concise issue comments with Slack-derived context.

This MVP is fixture-first. Do **not** call the Slack API. Do **not** require
Slack credentials. Treat `slack-fixtures/*.json` as the only Slack input.

## Pre-Fetched Data

A deterministic pre-step has already fetched all project data:

- **`launch-data-summary.json`** — Read this first with
  `cat launch-data-summary.json`.
- **`launch-data.json`** — Full data with issue bodies. Use `jq` to extract only
  what you need.

Token efficiency matters. Read `launch-data-summary.json` once. Read targeted
sections of `launch-data.json` only when a match needs issue-body detail.

## Process

### Step 1: Identify Slack Fixture Files

Determine which fixture files triggered this run.

If triggered by push:

```bash
git diff --name-only HEAD~1 HEAD 2>/dev/null | grep -E '^slack-fixtures/.*\.json$' || echo "No Slack fixture files in diff"
```

If triggered by `workflow_dispatch`, process all fixture files:

```bash
find slack-fixtures -name '*.json' 2>/dev/null
```

If no fixture files exist, call `noop` with:

```text
Skipped - no Slack fixture files found.
```

Then stop.

### Step 2: Read Fixture Files

For each fixture file, read the JSON:

```bash
cat <fixture-file>
```

Expected shapes are documented in `docs/slack-integration-plan.md`. Fixtures may
contain top-level `messages`, `events`, or channel/thread groupings. Extract any
objects that look like Slack messages with these fields when present:

- `channel_id`
- `channel_name`
- `thread_ts`
- `message_ts`
- `permalink`
- `author_id`
- `author_name`
- `created_at`
- `text`
- `reactions`
- `matched_by`

Ignore reaction events except as supporting signal for the related message.
This workflow does not create intake issues; Slack Reaction Intake will handle
that separately.

### Step 3: Load Issue Context

Load the issue landscape:

```bash
cat launch-data-summary.json
```

Build a compact reference map of open issues:

```bash
jq '[.launches[] | select(.state == "OPEN") | {number, title, url, state, type: "launch"},
  (.subIssues[]? | select(.state == "OPEN") | {number, title, url, state, type: "epic"}),
  (.subIssues[]?.subIssues[]? | select(.state == "OPEN") | {number, title, url, state, type: "task"})]' launch-data-summary.json
```

Also detect issue references inside Slack text and permalinks:

- `#123`
- `issue 123`
- `ticket 123`
- full GitHub issue URLs such as
  `https://github.com/${{ github.repository }}/issues/123`
- exact or near-exact issue titles

### Step 4: Match Slack Messages to Issues

For each Slack message or thread, determine whether it relates to an open issue.

Matching confidence:

- **High:** Explicit GitHub issue URL, `#123`, `issue 123`, or exact title.
- **Medium:** Strong title/keyword overlap plus a relevant reaction such as
  `memo`, `pushpin`, `warning`, or `white_check_mark`.
- **Low:** Loose keyword overlap, generic project terms, or unclear references.

Only post comments for **High** and **Medium** confidence matches. Skip Low
confidence matches.

Group messages by target issue. If multiple messages from the same fixture
match one issue, post one consolidated comment for that issue.

### Step 5: Classify the Context

For each matched issue, classify the Slack context:

- **Summary context:** General status, clarifications, or background.
- **Decision:** The team chose an option, changed scope, or confirmed direction.
- **Action item:** Someone committed to do something, especially with owner/date.
- **Blocker/risk:** Something is blocked, delayed, at risk, or needs escalation.
- **Done signal:** Someone says work shipped, was verified, or is complete.
- **Open question:** A decision or answer is still needed.

If the context contains decisions, action items, blockers, or open questions,
use the "Decision/Action-Oriented" comment format. Otherwise use the default
"Compact Evidence Note" format.

### Step 6: Avoid Duplicate Comments

Before posting to an issue, check recent comments:

```bash
gh issue view <number> --repo ${{ github.repository }} --json comments \
  --jq '.comments[] | {body: .body, createdAt: .createdAt, author: .author.login}'
```

Do not post if an existing comment with `<!-- slack-context -->` already
contains the same fixture filename or the same Slack permalink.

### Step 7: Post GitHub Comments

For each matched issue, post one comment. The comment must start with:

```markdown
<!-- slack-context -->
```

Use this default format for general context:

```markdown
<!-- slack-context -->
## Slack Context - YYYY-MM-DD

**Source:** `#channel-name`, N messages, M threads
**Fixture:** `slack-fixtures/<filename>.json`
**Confidence:** High or Medium

### Summary

- <1-3 concise bullets describing what Slack added to the issue context.>

### Evidence

- [Slack thread](<permalink>) - <why this source matters>
- [Slack message](<permalink>) - <why this source matters>

<details>
<summary>Copied Slack context</summary>

- <author_name>: "<short copied message excerpt>"
- <author_name>: "<short copied message excerpt>"

</details>
```

Use this format when Slack contains decisions, action items, blockers, or open
questions:

```markdown
<!-- slack-context -->
## Slack Update - YYYY-MM-DD

**Source:** `#channel-name`
**Fixture:** `slack-fixtures/<filename>.json`

### Decisions

- <Decision, if any.>

### Action Items

- <Owner/action/date, if any.>

### Blockers

- <Blocker or risk, if any.>

### Open Questions

- <Question, if any.>

### Evidence

- [Slack thread](<permalink>) - <why this source matters>

<details>
<summary>Copied Slack context</summary>

- <author_name>: "<short copied message excerpt>"

</details>
```

Omit empty sections in the Decision/Action-Oriented format.

Keep copied Slack excerpts short. Prefer paraphrased summaries plus permalinks
over copying long message history.

After posting the comment, add the `from-slack` label to the issue.

### Step 8: No Matches

If fixture files were processed but no High or Medium confidence issue matches
were found, call `noop` with:

```text
No Slack fixture messages matched open GitHub issues.
```
