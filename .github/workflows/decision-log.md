---
description: |
  Daily decision log workflow. Scans comments on initiatives, launches, epics,
  and tasks for decision signals. Also checks new transcripts in /transcripts/
  for decisions discussed in meetings. Creates a PR with individual markdown
  files in /decisions/ for each decision detected.

engine:
  id: codex
  model: gpt-4o

on:
#  schedule: (disabled — re-enable to run on a schedule) "0 7 * * 2-6"
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read

strict: true
timeout-minutes: 20
max-ai-credits: 2000

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

imports:
  - shared/freshness-check.md

tools:
  github:
    mode: gh-proxy
    toolsets: [default, issues]
    lockdown: false
    min-integrity: none

safe-outputs:
  mentions: false
  allowed-github-references: []
  create-pull-request:
    title-prefix: "[Decision Log] "
    draft: false
    auto-merge: true
    max: 1
---

# Decision Log Workflow

You are a decision analyst for the repository ${{ github.repository }}.
Your job is to scan issue comments and meeting transcripts for decisions,
then create a PR that adds individual decision record files to `/decisions/`.

## Pre-Fetched Data

A deterministic pre-step has already fetched all project data:

- **`launch-data-summary.json`** — Read this first with `cat launch-data-summary.json`.
- **`launch-data.json`** — Full data with issue bodies. Use `jq` to extract
  only what you need.

> **⚠️ Token efficiency:** Read `launch-data-summary.json` once. Only read
> `launch-data.json` if you need issue bodies for detail.

## What Counts as a Decision

A decision is a choice that was made — not a question, not a suggestion,
not a status update. Look for these signals in comments:

- **Explicit markers:** "we decided to…", "going with…", "the decision is…",
  "agreed to…", "we're choosing…", "after discussion, we will…"
- **Trade-off resolution:** "option A vs B — we picked A because…",
  "we considered X but went with Y"
- **Direction changes:** "we're pivoting to…", "descoping X in favor of Y",
  "reversing the earlier decision to…"
- **Approval/sign-off:** "approved the approach to…", "greenlit…",
  "signing off on…"

Do **NOT** log these as decisions:
- Open questions ("should we…?", "what if…?")
- Status updates ("started work on…", "completed the migration")
- Opinions without resolution ("I think we should…" with no follow-up agreement)
- Routine task assignments

## Process

### Step 1: Load Data and Identify Active Issues

```bash
cat launch-data-summary.json
```

Extract all active issues (initiatives, launches, epics, tasks) that were
updated in the last 24 hours:

```bash
jq '[.launches[] | select(.state == "OPEN") | {number, title, url, subIssues: [.subIssues[] | {number, title, state, subIssues: [.subIssues[]? | {number, title, state}]}]}]' launch-data-summary.json
```

### Step 2: Fetch Recent Comments

For each issue updated in the last 24 hours, fetch comments from the
past 24 hours:

```bash
# Calculate 24 hours ago
SINCE=$(date -u -v-24H '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -u -d '24 hours ago' '+%Y-%m-%dT%H:%M:%SZ')

# For each active issue number:
gh issue view <number> --repo ${{ github.repository }} --json comments --jq ".comments[] | select(.createdAt >= \"$SINCE\") | {author: .author.login, body: .body, createdAt: .createdAt}"
```

> **⚠️ Token efficiency:** Only fetch comments for issues whose `updatedAt`
> falls within the last 24 hours. Skip issues with no recent activity.
> Process in batches — launches first, then their epics, then tasks.

### Step 3: Check for New Transcripts

Look for transcript files in `/transcripts/` that were added or modified
in the last 24 hours:

```bash
# Find recently modified transcript files
find transcripts/ -name '*.txt' -o -name '*.vtt' 2>/dev/null | while read f; do
  # Check if modified in last 24 hours
  if [ "$(find "$f" -mtime -1 2>/dev/null)" ]; then
    echo "$f"
  fi
done
```

For each new transcript:
1. Read the file content
2. Scan for decision signals (same markers as issue comments)
3. Also look for patterns common in meeting transcripts:
   - "Let's go with…", "The consensus is…", "We're aligned on…"
   - Action items that imply a decision was made
   - Speaker turns where a conclusion is stated after discussion

### Step 4: Extract and Classify Decisions

For each decision found (from comments or transcripts), extract:

1. **Title** — A concise summary of what was decided (< 80 characters)
2. **Decision** — The actual choice that was made (1-2 sentences)
3. **Context** — Why this decision came up, what problem it solves
4. **Options considered** — What alternatives were discussed (if visible)
5. **Rationale** — Why this option was chosen over others
6. **Source** — The issue number and comment URL, or transcript filename
7. **Participants** — Who was involved in the decision (comment authors or
   speakers in transcript)
8. **Impact** — Which launches, epics, or initiatives are affected
9. **Date** — When the decision was made

### Step 5: Check for Existing Decision Records

Before creating new files, scan what already exists in `/decisions/`:

```bash
ls decisions/ 2>/dev/null || echo "No decisions directory yet"
```

If the directory has files, read their frontmatter to build an index of
previously recorded decisions:

```bash
for f in decisions/*.md; do
  echo "=== $(basename "$f") ==="
  head -20 "$f"
  echo ""
done 2>/dev/null
```

Use this index to:

1. **Skip duplicates** — If a decision about the same topic from the same
   source (same issue number or transcript) already exists, do not create
   a new file.
2. **Amend existing decisions** — If you find new information that adds to
   or refines an existing decision (e.g., a follow-up comment with updated
   rationale, a reversal, or additional options considered), update the
   existing file rather than creating a new one. Add an "## Amendments"
   section at the bottom with the date and new information.
3. **Flag reversals** — If a new decision contradicts a previous one,
   create a new decision file but reference the original (e.g.,
   "Supersedes `decisions/2026-05-01-use-redis.md`") and update the
   original's Status from "Accepted" to "Superseded by YYYY-MM-DD-<slug>".

### Step 6: Generate Decision Files

Create the `/decisions/` directory if it doesn't exist. For each new decision,
create a markdown file with this naming convention:

```
decisions/YYYY-MM-DD-<slug>.md
```

Where `<slug>` is a kebab-case version of the decision title (max 50 chars).

**Decision file template:**

```markdown
# <Decision Title>

| Field | Value |
|-------|-------|
| **Date** | YYYY-MM-DD |
| **Status** | Accepted |
| **Source** | [#<issue>](<url>) or `transcripts/<filename>` |
| **Participants** | @author1, @author2 |
| **Impact** | #<launch>, #<initiative> |

## Context

<Why this decision came up. What problem or question prompted it.>

## Decision

<What was decided. Be specific and unambiguous.>

## Options Considered

### Option A: <name>

<Brief description. Pros and cons if discussed.>

### Option B: <name>

<Brief description. Pros and cons if discussed.>

## Rationale

<Why the chosen option was selected. What trade-offs were accepted.>
```

If some fields aren't available from the source material (e.g., no
alternatives were discussed), include the section with a note like
"Not discussed in source material."

**Important — always populate Impact:** The Impact field is critical for
downstream workflows (e.g., Adversarial PM, Strategy Alignment) that need
to post feedback on relevant issues. When a decision comes from a transcript,
search `launch-data-summary.json` for issues related to the topics discussed
and list them in Impact. A decision with no Impact issues is invisible to
the review pipeline.

### Step 7: Create the Pull Request

Create a single PR that adds all new decision files. The PR should:

- Branch from the default branch
- Include all new decision files in `/decisions/`
- Have a clear PR body summarizing what was found

**PR body format:**

```markdown
## 📋 Decision Log — YYYY-MM-DD

This PR records **N decision(s)** detected from issue comments and
meeting transcripts in the last 24 hours.

### Decisions Recorded

| Decision | Source | Impact |
|----------|--------|--------|
| <title> | #<issue> | #<launch> |
| <title> | `transcripts/<file>` | #<epic> |

### Sources Scanned

- **Issues scanned:** N issues with recent activity
- **Transcripts checked:** N files in /transcripts/
- **Decisions found:** N new decisions

---

*Auto-generated by the Decision Log workflow. Review each decision
file for accuracy before merging.*
```

### Step 8: Handle No Decisions Found

If no decisions are detected in any source, do **not** create a PR.
Print a brief summary to stdout:

```
Decision Log Scan Complete
===========================

📅 Scan window: YYYY-MM-DD HH:MM to YYYY-MM-DD HH:MM UTC
📝 Issues scanned: N
📄 Transcripts checked: N
🔍 Decisions found: 0

No new decisions detected. No PR created.
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

Configured title prefixes are added automatically — omit them from `--title`. If a call fails, immediately call `safeoutputs noop --message "reason"` and stop — never ask for input.

## Guidelines

- Be conservative: only log things that are clearly decisions, not
  suggestions or open discussions.
- Each decision gets its own file — don't bundle multiple decisions
  into one file.
- If a decision references a previous decision being reversed or
  modified, note the relationship in the Context section.
- Preserve the original language where possible. Quote the key
  decision statement rather than paraphrasing loosely.
- Don't create decision records for routine operational choices
  (e.g., "assigned this to @person"). Focus on product, technical,
  and strategic decisions.
- If the same decision appears in both an issue comment and a
  transcript, use the issue comment as the primary source (it's
  more canonical) and note the transcript as additional context.
- Escape all @mentions to avoid notifications.
