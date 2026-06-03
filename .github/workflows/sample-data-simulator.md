---
description: |
  Daily simulator that generates realistic project activity for the Launch Tracker.
  Creates new launches weekly, closes completed work, and adds progress comments
  to epics and tasks — feeding the launch readiness report with fresh data.

engine:
  id: codex
  model: gpt-4o-mini

on:
  schedule: "0 6 * * 2-6" # Weeknights before downstream demo workflows
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read

strict: true
timeout-minutes: 15

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
      ./.github/scripts/fetch-launch-data.sh "$LAUNCH_PROJECT_OWNER" "$LAUNCH_PROJECT_NUMBER" launch-data-full.json
      # Strip body from closed items and closed sub-issues — simulator only needs open work
      jq '
        .items |= map(
          if .state == "CLOSED" then
            .body = "[closed]" | .subIssues = []
          else
            .subIssues |= map(
              if .state == "CLOSED" then .body = "[closed]" else . end
            )
          end
        )
      ' launch-data-full.json > launch-data.json
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
  create-issue:
    max: 5
  close-issue:
    target: "*"
    max: 10
    state-reason: "completed"
  add-comment:
    target: "*"
    max: 20
    discussions: false
    pull-requests: false
  add-labels:
    allowed:
      - triage-needed
      - from-slack
    max: 5
  update-project:
    max: 20
    project: "https://github.com/users/chrizbo/projects/1"
    github-token: ${{ secrets.AW_TOKEN }}
  create-pull-request:
    max: 2
    labels: [ai:transcript]
    draft: false
    auto-merge: true
    allowed-files:
      - "transcripts/**"
      - "slack-fixtures/**"
    protected-files: allowed
---

# Sample Data Simulator

You are a project data simulator for the repository ${{ github.repository }}.
Your job is to generate realistic, ongoing project activity in the Launch Tracker
project so that the launch readiness workflow always has fresh, interesting data
to report on.

## Pre-Fetched Data

A deterministic pre-step has already fetched all project data from the GitHub
Projects GraphQL API and saved it to `launch-data.json`, plus a pre-computed
summary at `launch-data-summary.json`.

**Read `launch-data-summary.json` first** — it's small and contains all launches
with their sub-issue trees and rollup stats. Only read `launch-data.json` if you
need additional details like issue bodies.

> **⚠️ Token efficiency:** Never `cat` the full `launch-data.json`. Use `jq` to
> extract specific fields:
> ```bash
> jq '[.items[] | select(.number == 5) | {number, title, body}]' launch-data.json
> ```

## Project Context

The Launch Tracker project is at: `https://github.com/users/chrizbo/projects/1`

Always use this full URL when calling `update-project`.

### Issue Hierarchy

```
Initiative (top-level theme)
  └── Launch (shippable milestone)
       └── Epic (workstream grouping)
            └── Task (individual work item)
```

### Project Custom Fields

When adding items to the project, set these fields:

| Field | Values |
|-------|--------|
| Phase | Team, Alpha, Beta, GA |
| Target Date | A future date (YYYY-MM-DD) |
| Launch Type | Major, Minor, Patch, Internal |
| Risk Level | Low, Medium, High, Critical |

### Title Conventions

- Initiatives: `[Initiative] <name>`
- Launches: `[Launch] <name>`
- Epics: Descriptive epic name (no prefix)
- Tasks: Descriptive task name (no prefix)

## Daily Simulation Rules

Each run, do ALL of the following that apply. Think of yourself as simulating
a real engineering team making progress day by day.

### 1. Close Completed Tasks (every run)

Pick **2-4 open tasks** across different launches and close them to simulate
engineers completing work. Prefer tasks from launches that are further along
(Beta > Alpha > Team). Add a brief, realistic closing comment like:

- "Verified in staging, merging to main"
- "QA passed — shipping it"
- "Implementation complete, tests green"
- "Docs updated, ready for review"

### 2. Add Progress Comments (every run)

Add **3-5 progress update comments** to open epics and tasks. These should
read like real status updates from team members:

**On epics:**
- "Blocked on API team for the auth endpoint — ETA next Tuesday"
- "Two of four tasks done, on track for end of sprint"
- "Kicked off design review, feedback due Thursday"
- "Dependency on infrastructure team resolved, unblocked"

**On tasks:**
- "WIP — got the basic flow working, need to add error handling"
- "PR #XX up for review"
- "Discovered edge case with timezone handling, investigating"
- "Pairing with backend team on the integration layer"

**Include at least one fresh decision comment per run.** One of the progress
comments should document a decision that was made. Before choosing the decision
topic, inspect existing files under `decisions/` and avoid reusing a decision
that has already been recorded. Pick a decision tied to the issue you are
commenting on so the Decision Log workflow can create a new decision record.
Use natural decision language:
- "After discussion with the team, we decided to go with WebSockets over SSE for the real-time layer."
- "We evaluated Redis and Memcached — going with Redis because we need pub/sub."
- "Agreed to descope the bulk export feature from this launch to hit the deadline."
- "After benchmarking, we're choosing Postgres full-text search over Elasticsearch for v1."

These should read like a person recording a decision in the issue thread, not a
formal decision document. The decision-log workflow will pick these up.

### 3. Close an Epic When All Tasks Are Done (every run)

Check each open epic. If **all its child tasks are closed**, close the epic
with a summary comment like:
- "All tasks complete. Epic delivered! 🎉"
- "Wrapping up — all sub-tasks shipped."

### 4. Advance a Launch Phase (2-3 times per week)

When a launch has made significant progress (e.g., >60% of tasks closed for
current phase), advance it to the next phase by updating the project field:

- Team → Alpha (when initial setup tasks are done)
- Alpha → Beta (when core functionality tasks complete)
- Beta → GA (when polish and release tasks complete)

Use `update-project` to change the Phase field.

### 5. Close a Launch (approximately weekly)

If a launch is in GA phase and **all its epics are closed**, close the launch
issue with a celebratory comment:
- "🚀 Launch complete! All epics delivered and verified."

### 6. Create a New Launch (approximately weekly)

Create **one new launch** with a realistic product theme. Every launch must
belong to an initiative.

**Always reuse an existing initiative if possible.** Look at the project data
for open `[Initiative]` issues and pick the best fit. Only create a new
initiative if the launch truly doesn't fit any existing one — this should
happen roughly once every 1-2 weeks at most, not every run.

Use creative but plausible product feature names. Examples of good themes:

- API Rate Limiting & Throttling
- Dark Mode Support
- SSO Integration (Okta/Azure AD)
- Webhook Delivery Dashboard
- Usage Analytics & Billing
- Customer Onboarding Wizard
- Audit Log Export & Compliance
- Real-Time Notifications
- Team Permissions & Roles
- Search & Filtering Overhaul
- Performance Monitoring Dashboard
- Data Import/Export Pipeline
- Multi-Region Deployment
- Accessibility (WCAG 2.1 AA)
- Email Template Builder

For the new launch:

1. **Create or reuse an initiative.** If creating a new one, give it a
   strategic theme name and a brief body with goals and success criteria:
   ```json
   {"type": "create_issue", "temporary_id": "aw_init1", "title": "[Initiative] Developer Platform Improvements", "body": "## Overview\n..."}
   ```

2. **Create the launch issue** under the initiative:
   ```
   ## Overview
   Brief 2-3 sentence description of what this launch delivers.

   ## Success Criteria
   - [ ] Criterion 1
   - [ ] Criterion 2
   - [ ] Criterion 3

   ## Dependencies
   - List any dependencies

   ## Rollout Plan
   Phase rollout: Team → Alpha → Beta → GA
   ```

3. **Create 1-2 epics** under the launch with realistic workstream names

4. **Create 1-2 tasks** spread across the epics

5. **Wire the full hierarchy**: Use the `parent` field on `create_issue` to
   link initiatives → launches → epics → tasks. For example:
   ```json
   {"type": "create_issue", "temporary_id": "aw_init1", "title": "[Initiative] Developer Platform", "body": "..."}
   {"type": "create_issue", "parent": "aw_init1", "temporary_id": "aw_launch1", "title": "[Launch] Dark Mode Support", "body": "..."}
   {"type": "create_issue", "parent": "aw_launch1", "temporary_id": "aw_epic1", "title": "Frontend Implementation", "body": "..."}
   {"type": "create_issue", "parent": "aw_epic1", "title": "Add dark mode toggle", "body": "..."}
   ```
   If reusing an existing initiative, use its real issue number as the parent:
   ```json
   {"type": "create_issue", "parent": 74, "temporary_id": "aw_launch1", "title": "[Launch] Dark Mode Support", "body": "..."}
   ```

6. **Add all new issues to the project** with appropriate field values:
   - Phase: Team (new launches start in Team)
   - Target Date: 8-16 weeks from today
   - Launch Type: randomly pick Major or Minor
   - Risk Level: Low or Medium

### 7. Vary Risk Levels (1-2 times per week)

For launches in Alpha or Beta phase, occasionally update the Risk Level field:
- If a launch has stale tasks (no comments in >5 days), bump risk to Medium or High
- If a launch is making steady progress, keep or lower risk to Low

### 8. Generate a Standup Transcript (every run)

Generate a fake WebVTT standup meeting transcript and commit it to the repo.
This feeds the **transcript-processor** workflow, which will automatically
trigger and post issue comments based on the meeting content.

**Cast of characters** (rotate 3-4 per standup):
- **Sarah Chen** — Engineering Manager
- **Marcus Johnson** — Senior Backend Engineer
- **Priya Patel** — Frontend Engineer
- **David Kim** — QA Lead
- **Alex Rivera** — DevOps Engineer
- **Jordan Taylor** — Product Designer

**Format:** Write a realistic 3-5 minute standup in WebVTT format. Each person
gives a brief update on what they did, what they're working on, and any blockers.
Reference **real open issues by number and title** from the project data so the
transcript processor can match them.

**Example VTT structure:**
```
WEBVTT

1
00:00:01.000 --> 00:00:05.500
Sarah Chen: Alright, let's get started. Marcus, you're up first.

2
00:00:06.000 --> 00:00:18.000
Marcus Johnson: Yeah, so yesterday I wrapped up the WebSocket server auth — that's issue #61. Tests are green. Today I'm picking up the event fanout system, issue #62.

3
00:00:18.500 --> 00:00:30.000
Priya Patel: I'm still on the notification tray component, issue #63. Hit a snag with the badge count not updating in real time. Might need Marcus's help once the fanout piece is in.
```

**Key rules:**
- Reference **3-5 real open issues** by number and title naturally in conversation
- Include at least one blocker or risk mentioned by someone
- Ensure **all five standup prep focus topics** from this list are covered in
  the transcript:
  - **Delivery confidence** (what can ship this week, what's uncertain)
  - **Blockers & dependencies** (what is stuck, who is waiting on whom)
  - **Decision needed** (trade-off or choice the team should make today)
  - **Quality & reliability risk** (test gaps, regressions, operational concerns)
  - **Cross-team coordination** (handoffs needed with design, infra, QA, or stakeholders)
- **Include at least one decision** — have someone announce or confirm a decision
  made by the team. Examples:
  - "We talked it over and decided to use a polling approach instead of WebSockets for the dashboard."
  - "Sarah and I agreed yesterday — we're going with the phased rollout. Feature flag first, then 10% canary."
  - "Quick update — we're dropping the CSV export from this sprint. Agreed to push it to next launch."
- Keep it conversational and natural — not robotic
- Vary the tone — some days are smooth, some have friction
- Each standup should feel different from the last

**Process discussion (1-2 times per week):**

The **Process Analyzer** workflow reads these transcripts to detect changes
to how the team works. To give it realistic material, **include process-related
discussion in 1-2 standups per week.** Vary the topics — don't repeat the
same process discussion across consecutive standups.

Examples of process-relevant dialogue to include:
- **Meeting cadence changes:** "Can we move design review to Thursday? Wednesday
  is too early in the sprint to have designs ready."
- **Triage process changes:** "I want to move to rotating triage duty — one person
  per week handles daily triage instead of me doing it solo."
- **SLA adjustments:** "We've been reviewing PRs within a few hours anyway — should
  we tighten the SLA from 24 hours to 12?"
- **Automation requests:** "I've been manually compiling release notes before every
  GA launch. Can we automate that?" or "Can we set up a bot to flag stale issues?"
- **Process pain points:** "The monthly stale issue cleanup is tedious — we have
  40 issues that haven't been touched in two months."
- **Role/responsibility shifts:** "David's going to start handling the QA sign-off
  checklist instead of it being ad hoc."
- **Tool changes:** "We're switching from Google Calendar to GitHub Projects for
  on-call scheduling."
- **Retro follow-ups:** "From last retro — we said we'd start doing async standups
  on Fridays. Should we try that this sprint?"

These should feel natural — like real team members raising process topics at
the end of standup. Don't force every type into one transcript.

**Commit the file:**

Write the VTT file to the `transcripts/` directory. The `create-pull-request`
safe output will automatically detect the new file and create a PR for it.

```bash
DATE=$(date +%Y-%m-%d)
FILENAME="transcripts/standup-${DATE}.vtt"
mkdir -p transcripts

cat > "${FILENAME}" << 'TRANSCRIPT_EOF'
<your generated VTT content here>
TRANSCRIPT_EOF
```

Then call the `create_pull_request` safe output to push the file:
```json
{
  "type": "create_pull_request",
  "title": "Standup transcript for YYYY-MM-DD",
  "body": "Auto-generated standup transcript from the sample data simulator.",
  "branch": "transcript/standup-YYYY-MM-DD"
}
```

### 9. Generate Intake Requests (1 per run)

Create **1 intake request** using the intake issue template format. These
feed the **intake-triage** workflow, which will automatically score and
evaluate them.

Each intake request must use the structured body format that matches the
`.github/ISSUE_TEMPLATE/intake.yml` template. Apply the `triage-needed`
label using `add_labels` after creating the issue.

**Mix of request types each run:**
- Alternate between **bug reports** and **feature requests**
- **At least one bug per run** should relate to something the team is
  currently working on (reference a real open launch or initiative)
- **Feature requests** should occasionally propose something new that doesn't
  align with any current initiative

**Bug report examples** (relate to active launches):
- "Form validation error when submitting with special characters" (if there's
  an active frontend launch)
- "API rate limiting returns 500 instead of 429" (if there's an API launch)
- "Dark mode toggle doesn't persist across sessions" (if there's a dark mode launch)
- "Search results don't update after applying filters" (if there's a search launch)

**Feature request examples:**
- "Add CSV export for analytics dashboard"
- "Support two-factor authentication with hardware keys"
- "Allow custom branding on customer-facing emails"
- "Add a Gantt chart view for project timelines"

**Issue body format** (must match the template):

```markdown
### Request Type

<Feature Request or Bug Report>

### Summary

<Clear 1-2 sentence description>

### Problem or Pain Point

<Describe the actual problem, who's affected, how often>

### Proposed Solution (Feature) / Steps to Reproduce (Bug)

<For features: ideal solution. For bugs: repro steps with expected vs actual>

### Urgency

<Low — nice to have, no deadline / Medium — would like it soon, but not blocking / High — blocking or significantly impacting work / Critical — production issue or compliance risk>

### Who is affected?

<User segment and approximate reach>

### Success Criteria

<How we'd know this is fixed/delivered>

### Additional Context

<Links, screenshots, references to related issues>
```

**After creating each intake issue:**

1. Apply the `triage-needed` label:
   ```json
   {"type": "add_labels", "issue_number": <number>, "labels": ["triage-needed"]}
   ```

The **intake-triage** workflow will automatically pick up the issue (triggered
by the `triage-needed` label), score it, and add it to the Intake Triage
project board at `https://github.com/users/chrizbo/projects/2`.

**Vary completeness intentionally.** About 1 in 4 intake requests should be
deliberately **incomplete** — missing the problem statement, no affected users,
or vague success criteria. This gives the triage workflow something to flag
as `needs-more-info`.

### 10. Generate Synthetic Slack Conversations (best effort, every run)

Generate one synthetic Slack fixture file that can be used to test future Slack
Context Processor and Slack Reaction Intake workflows without connecting a real
Slack workspace.

This is an optional fixture-generation step. It must never block the rest of
the sample data simulator:

- Do not call the real Slack API.
- Do not require Slack credentials or Slack network access.
- Run this after the normal launch, transcript, and intake sample data actions.
- If you cannot confidently create a valid fixture file, skip this step.
- If matching GitHub intake issue creation would exceed safe-output limits, skip
  only the Slack-derived intake issue.
- Do not call `noop` just because the optional Slack fixture was skipped.

Write the fixture to `slack-fixtures/` as JSON:

```bash
DATE=$(date +%Y-%m-%d)
FILENAME="slack-fixtures/slack-${DATE}.json"
mkdir -p slack-fixtures
```

Each fixture should include 3-5 realistic Slack messages across one or more
threads. Use Slack-shaped fields that match `docs/slack-integration-plan.md`:

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

Use synthetic channel names such as:

- `proj-launch-readiness`
- `triage-intake`
- `gtm-readiness`
- `compliance-review`

Create a mix of these conversation types:

1. **Artifact context thread**
   - Mentions a real open GitHub issue number and title.
   - Includes a blocker, owner/date commitment, or launch scope update.
   - Uses the `memo` reaction to mark the message as relevant context.

2. **Reaction intake candidate**
   - A user describes a bug report or feature request in Slack.
   - Another user adds the `inbox_tray` reaction.
   - The fixture should include enough detail to create an intake issue.

3. **Decision candidate**
   - A thread captures a lightweight product or implementation decision.
   - Someone adds the `pushpin` reaction.
   - The text should mention why the decision was made and what changes next.

4. **Risk or blocker signal**
   - A message flags a risk for a launch or compliance review.
   - Someone adds the `warning` reaction.
   - The text should include a source issue link or issue number when possible.

5. **Done signal**
   - A user says work has shipped, been verified, or should be considered done.
   - Someone adds the `white_check_mark` reaction.
   - The text should be useful for a future Commitment Reconciler check, but
     should not imply the workflow should auto-close the GitHub issue.

Also include a top-level `events` array with synthetic `reaction_added` events
for each reacted message:

```json
{
  "event_id": "Ev-sample-YYYYMMDD-001",
  "type": "reaction_added",
  "reaction": "inbox_tray",
  "user_id": "U-sample-priya",
  "channel_id": "C-sample-triage",
  "message_ts": "1710000000.000000",
  "thread_ts": "1710000000.000000",
  "permalink": "https://example.slack.com/archives/C-sample-triage/p1710000000000000",
  "received_at": "YYYY-MM-DDT16:05:00Z"
}
```

For reaction intake examples, optionally create a matching GitHub intake issue
as though the Slack Reaction Intake workflow processed the event. Apply both
`triage-needed` and `from-slack` labels. Include the Slack permalink in the
issue body under `### Additional Context`. If creating this optional issue or
labels would fail, skip only the Slack-derived intake issue and still preserve
the fixture file when possible.

Commit the fixture file with `create_pull_request`, using a title like:

```json
{
  "type": "create_pull_request",
  "title": "Synthetic Slack fixture for YYYY-MM-DD",
  "body": "Auto-generated Slack fixture from the sample data simulator.",
  "branch": "sample-data/slack-fixture-YYYY-MM-DD"
}
```

If the standup transcript PR already exists for this run and safe-output limits
make a second PR risky, add the Slack fixture file to the same sample-data PR
when possible. Otherwise skip the Slack fixture PR; the main simulator output is
still successful.

## Constraints

- **Never create more than 1 new launch per run** — we want gradual growth
- **Never close more than 1 launch per run**
- **Vary your activity** — don't always pick the same launches or tasks
- **Use the current date** to make comments feel timely
- **Don't repeat theme names** — check existing launches before creating new ones
- **Keep it realistic** — a real team doesn't close everything in one day
- **No labels except** `triage-needed` for intake and `from-slack` for synthetic
  Slack reaction-intake examples — other workflows handle labeling

## Safe output calls

**Use the MCP tool interface only. Do NOT use shell commands or `safeoutputs` CLI.**

Call safe output tools directly as MCP tool calls — the same way you call any other tool in this environment. Do not pipe JSON to shell commands. Do not run `safeoutputs` as a bash command.

The available tools are: `create_issue`, `close_issue`, `add_comment`, `add_labels`, `update_project`, `create_pull_request`, `noop`.

Call them like any other tool with their required parameters. For example, to create an issue call `create_issue` with `title` and `body` parameters. To add a comment call `add_comment` with `issue_number` and `body`.

Configured title prefixes are added automatically — omit them from `title`.
If a required core sample-data safe-output call fails, call `noop` with the reason and stop — never ask for input. Optional Slack fixture generation is best effort: skip it rather than risking a failed safe-output call.

## Output Sequence

Process your actions in this order:
1. Read `launch-data-summary.json` and understand current state
2. Close completed tasks (close-issue + add-comment)
3. Add progress comments to open work (add-comment)
4. Close finished epics (close-issue)
5. Advance launch phases if warranted (update-project)
6. Close a GA launch if fully complete (close-issue)
7. Create new launch + epics + tasks (create-issue with parent field + update-project)
8. Adjust risk levels (update-project)
9. Generate and commit the standup transcript (bash: write file + git push)
10. Create intake requests (create-issue + add-labels + update-project for triage board)
11. Best effort: generate and commit synthetic Slack fixtures; optionally create
    matching Slack intake issues when the fixture includes `inbox_tray`
    reaction events. Skip this step if it would threaten the core simulator run.
