# Slack Integration Plan

Future work proposal for adding Slack as a context source, lightweight trigger
surface, and update target for Agentics Beyond Code workflows.

## Goals

- Pull Slack context into artifact-centered workflows the way transcript files
  currently enrich issues.
- Let teams use emoji reactions as lightweight automation signals.
- Post selected workflow updates back to Slack when the audience naturally
  works there.
- Keep GitHub as the durable record for decisions, issues, launch status, and
  audit trails.
- Avoid broad Slack write access or hidden automations.

## Non-Goals

- Replacing GitHub issues, projects, discussions, or decision records.
- Letting the agent freely browse every Slack channel.
- Letting the agent freely post arbitrary Slack messages.
- Treating emoji reactions as final approval for sensitive decisions.

## Current MVP Decisions

- Store Slack-derived context in GitHub in three forms: a concise summary,
  selected copied context inside a collapsed details block, and links back to
  Slack permalinks.
- Use a standard emoji vocabulary for the first implementation.
- Keep emoji names configurable through repository variables so teams adapting
  the workflows can substitute their local conventions.
- Use event-driven reaction automation for the first version.
- Prove the pattern with Slack Context Processor and Slack Reaction Intake.
- Start in a dedicated test Slack workspace or isolated pilot channel before
  connecting real team channels.
- Do not add a heavy review gate before low-risk reaction intake. Create the
  GitHub issue directly and label it `from-slack` so humans can filter, audit,
  and clean up noisy captures.
- Allow any explicitly allowlisted Slack channel type in production, including
  public and private channels, as long as the Slack app has the matching scopes
  and has been added to the channel.
- Use Option A as the default GitHub issue comment format for Slack Context
  Processor, use Option B when the Slack context contains decisions or action
  items, and reserve Option C for Commitment Reconciler.

## Core Use Cases

### 1. Slack Context for GitHub Artifacts

Workflows can search or fetch Slack threads related to a GitHub artifact and use
that context as evidence.

Candidate artifacts:

- Launch issues.
- Epic and task sub-issues.
- Compliance review sub-issues.
- GTM content sub-issues.
- Decision records.
- Weekly status and leadership brief discussions.
- Commitment reconciliation reports.

Example workflow behavior:

- Find Slack messages that mention `#123`, the issue URL, or the launch title.
- Extract decisions, blockers, owner/date commitments, and open questions.
- Post a GitHub issue comment summarizing only high-confidence matches.
- Include selected source context in a collapsed `<details>` block when copying
  context is acceptable.
- Cite Slack permalink evidence for every copied or summarized source message.

### 2. Emoji-Driven Automation

Approved emoji reactions can mark Slack messages for workflow processing.

Possible reaction semantics:

| Reaction | Meaning | GitHub action |
|---|---|---|
| `:inbox_tray:` | Capture as intake. | Create or update an intake issue. |
| `:memo:` | Capture as meeting/context note. | Add summarized context to a linked issue. |
| `:pushpin:` | Capture as decision candidate. | Create a decision-log candidate issue or PR. |
| `:warning:` | Capture as risk/blocker. | Comment on a linked launch or create a blocker sub-issue. |
| `:white_check_mark:` | Mark as resolved/done signal. | Add evidence to commitment reconciliation; do not auto-close by default. |

These are the default reactions. Teams adapting the workflows can configure
different emoji names without changing the workflow semantics.

Guardrails:

- Only reactions by allowed users or groups trigger automation.
- Only allowed channels are scanned.
- Reactions create proposed actions unless the action is explicitly low-risk.
- Workflows must link back to the source Slack message.
- Repeated reactions on the same message should be idempotent.

### 3. Slack Report-Back

Some workflow outputs should be summarized back to Slack.

Good candidates:

- Launch readiness summary for a launch channel.
- Compliance review status for a domain channel.
- GTM readiness summary for a GTM channel.
- Daily standup prep for a team channel.
- Workflow health summary for an automation-maintainers channel.
- Commitment reconciliation highlights for a program channel.

Report-back messages should be short and link to the GitHub artifact as the
source of truth.

## Proposed Architecture

```
Slack messages, threads, and reactions
              |
              v
Slack MCP or deterministic Slack API pre-step
              |
              v
slack-context.json / slack-events.json
              |
              v
Agentic workflow reasoning over GitHub + Slack context
              |
              v
GitHub safe outputs for durable artifacts
              |
              v
Optional validated Slack post-back step
```

## Safe Output Strategy

Use built-in GitHub safe outputs for GitHub-side effects:

- Creating or updating GitHub issues.
- Adding `from-slack` or `triage-needed` labels.
- Posting GitHub issue comments with Slack summaries.
- Creating PRs for synthetic `slack-fixtures/**` files.

Use custom safe outputs for real Slack-side effects:

- Posting workflow summaries back to Slack channels.
- Posting acknowledgement messages into source Slack threads.
- Adding Slack reactions as bot acknowledgements, if that is ever needed.

Do not let the agent call Slack write APIs directly. The agent should propose a
structured item such as `slack_post_back`; a custom safe-output job should
validate channel allowlists, message templates, source links, rate limits, and
secrets before calling Slack.

The sample data simulator does not need a custom Slack safe output because it
does not call Slack. It only writes synthetic JSON fixtures and GitHub issues
through built-in safe outputs.

This repo provides a reusable custom safe output at
`.github/workflows/shared/slack-safe-outputs.md`. Workflows that need Slack
post-backs can import it:

```yaml
imports:
  - shared/slack-safe-outputs.md
```

Then the agent can call `slack_post_message` with an allowlisted `channel_id`,
message `text`, required `github_source_url`, and optional `thread_ts`.

## GitHub Comment Format Options

Slack Context Processor should use one consistent GitHub issue comment format.
These are candidate formats to choose from.

### Option A: Compact Evidence Note

Best when the issue already has a lot of activity and the Slack context is
supporting evidence rather than a full meeting-note replacement.

```markdown
<!-- slack-context -->
## Slack Context - 2026-06-01

**Source:** `#proj-launch`, 3 messages, 1 thread
**Confidence:** High

### Summary

- Security review is blocked on the final data retention answer.
- Priya committed to update the launch plan by Friday.
- The team agreed to keep the Beta date but reduce the first cohort size.

### Evidence

- [Slack thread](https://workspace.slack.com/archives/C123/p1710000000000000) - blocker and owner/date commitment
- [Slack message](https://workspace.slack.com/archives/C123/p1710000300000000) - Beta scope decision

<details>
<summary>Copied Slack context</summary>

- Priya: "I'll update the launch plan by Friday once Legal confirms retention."
- Marcus: "Let's keep Beta on June 14 but cap the cohort at 20 accounts."

</details>
```

### Option B: Decision/Action-Oriented

Best when Slack context should update the working state of the issue.

```markdown
<!-- slack-context -->
## Slack Update - 2026-06-01

**Source:** `#proj-launch`
**Related thread:** https://workspace.slack.com/archives/C123/p1710000000000000

### Decisions

- Keep the Beta date unchanged.
- Reduce the initial Beta cohort to 20 accounts.

### Action Items

- Priya to update the launch plan by Friday.
- Legal to confirm retention language before the next readiness review.

### Blockers

- Security approval is waiting on the final retention answer.

<details>
<summary>Copied Slack context</summary>

Selected messages copied from Slack for review.

</details>
```

### Option C: Artifact Reconciliation

Best when the workflow is comparing Slack against GitHub artifact state.

```markdown
<!-- slack-context -->
## Slack Context Reconciliation - 2026-06-01

| Signal | Slack evidence | GitHub state | Suggested follow-up |
|---|---|---|---|
| Owner/date commitment | [Priya update](https://workspace.slack.com/archives/C123/p1710000000000000) | No owner/date in issue body | Add owner and target date |
| Scope change | [Beta cohort thread](https://workspace.slack.com/archives/C123/p1710000300000000) | Issue still says 100-account Beta | Confirm and update rollout plan |

<details>
<summary>Copied Slack context</summary>

Selected messages copied from Slack for review.

</details>
```

Default decision: Option A for Slack Context Processor, with Option B used when
the Slack context contains decisions or action items, and Option C reserved for
Commitment Reconciler.

## Event Bridge Options

Slack reaction automation needs a small bridge because Slack Events API sends
HTTP callbacks to an app-owned Request URL, while GitHub Actions runs from
GitHub events.

### Option 1: Slack app calls `workflow_dispatch`

The bridge receives `reaction_added`, verifies the Slack signature, then calls
GitHub's workflow dispatch REST endpoint for a specific workflow file.

Use when:

- One Slack event should trigger one known workflow.
- The workflow needs typed `workflow_dispatch` inputs.
- Returning the GitHub run URL to Slack matters.

Tradeoffs:

- Requires a GitHub token with Actions write permission.
- Inputs are limited and workflow-specific.
- The event is not durable unless the workflow writes it somewhere.

### Option 2: Slack app calls `repository_dispatch`

The bridge receives the Slack event, verifies it, then calls GitHub's repository
dispatch REST endpoint with an `event_type` such as `slack_reaction_added` and a
`client_payload`.

Use when:

- Multiple workflows may care about the same Slack event type.
- The bridge should stay generic.
- The payload should look like an external event rather than a manual workflow
  run.

Tradeoffs:

- Requires a GitHub token with repository contents write permission.
- The workflow file must exist on the default branch.
- The event is still not durable unless the workflow writes it somewhere.

### Option 3: Bridge commits durable event files

The bridge writes event JSON into a path such as
`slack-events/inbox/YYYY/MM/DD/<event_id>.json`, then a push-triggered workflow
processes those files.

Use when:

- Auditability and replay matter more than immediacy.
- Event deduplication should be visible in git.
- The team wants test fixtures and production events to use the same shape.

Tradeoffs:

- Requires repository contents write permission.
- Adds git noise.
- Needs rules to avoid storing sensitive Slack data unnecessarily.

Recommended MVP: Option 1 for Slack Reaction Intake, because it is focused and
easy to reason about. Use Option 3 for test fixtures and later consider it for
production if replay/audit becomes important.

## Slack App Permissions

Use the smallest scope set for the phase being piloted. Prefer installing the
app only into allowed test or pilot channels. Production can support any
explicitly allowlisted channel type, but the required scopes differ by channel
type.

### Phase 1: Context Reads

Required for public channel context:

- `channels:history` - read messages in public channels the app can access.

Required for private channel context:

- `groups:history` - read private channels the app has been added to.

Add only if needed:

- `im:history` - read direct messages.
- `mpim:history` - read multi-person direct messages.

Recommended MVP: `channels:history` for a public test channel. Add
`groups:history` when the pilot needs private channels.

### Phase 2: Reaction Events

Required:

- `reactions:read` - receive and inspect emoji reaction events such as
  `reaction_added`.

Often paired with:

- `channels:history` - fetch the original message after receiving a reaction in
  a public channel.
- `groups:history` - fetch the original message in a private channel where the
  app is a member.

Recommended MVP: `reactions:read` plus the matching history scope for each
allowed channel type.

### Phase 4: Slack Report-Back

Required:

- `chat:write` - post messages as the Slack app in approved channels and
  conversations.

Avoid for MVP unless specifically needed:

- `chat:write.public` - post in all public channels without joining them.
- `chat:write.customize` - post as another user or with customized identity.

Recommended MVP: no Slack write scopes until report-back work starts. When it
does, use `chat:write` only and invite the app to explicit channels.

## Data Model

Use compact JSON files as the boundary between deterministic fetch steps and the
agent.

### `slack-context.json`

For artifact-linked context pulls:

```json
{
  "artifact": {
    "type": "issue",
    "number": 123,
    "url": "https://github.com/org/repo/issues/123",
    "title": "Launch title"
  },
  "messages": [
    {
      "channel_id": "C123",
      "channel_name": "proj-launch",
      "thread_ts": "1710000000.000000",
      "message_ts": "1710000000.000000",
      "permalink": "https://workspace.slack.com/archives/C123/p1710000000000000",
      "author_id": "U123",
      "created_at": "2026-06-01T16:00:00Z",
      "text": "Message text or redacted summary.",
      "reactions": ["memo"],
      "matched_by": ["issue_url", "issue_number"]
    }
  ]
}
```

### `slack-events.json`

For reaction-driven automation:

```json
{
  "events": [
    {
      "event_id": "Ev123",
      "type": "reaction_added",
      "reaction": "inbox_tray",
      "user_id": "U123",
      "channel_id": "C123",
      "message_ts": "1710000000.000000",
      "thread_ts": "1710000000.000000",
      "permalink": "https://workspace.slack.com/archives/C123/p1710000000000000",
      "received_at": "2026-06-01T16:05:00Z"
    }
  ]
}
```

## Workflow Candidates

### Slack Context Processor

Scheduled or manually dispatched workflow that scans allowed channels for
GitHub-linked messages and posts issue comments with relevant context.

This is closest to the existing Transcript Processor pattern.

### Slack Reaction Intake

Triggered by a Slack event bridge. Converts configured reaction events into
GitHub intake issues or proposed issue updates.

Start with `:inbox_tray:` for intake because it is low-risk and easy to review.
Reaction-created issues should include the `from-slack` label and the source
Slack permalink in the issue body.

### Slack Commitment Reconciler

Extends the existing Commitment Reconciler by reading Slack messages and
threads in addition to transcripts and issue comments.

This should probably be the first existing workflow to enhance once the fetch
pattern is proven.

### Slack Report-Back

Small post-processing job that posts links and summaries for selected workflow
outputs to configured Slack channels.

This should come after read-only Slack ingestion so the team can tune noise
before adding writes.

## Configuration

Use repository variables and secrets rather than hardcoding workspace details.

Suggested variables:

- `SLACK_ALLOWED_CHANNEL_IDS`
- `SLACK_ARTIFACT_CHANNEL_MAP`
- `SLACK_REACTION_INTAKE` default: `inbox_tray`
- `SLACK_REACTION_CONTEXT` default: `memo`
- `SLACK_REACTION_DECISION` default: `pushpin`
- `SLACK_REACTION_RISK` default: `warning`
- `SLACK_REACTION_DONE` default: `white_check_mark`
- `SLACK_ALLOWED_TRIGGER_USERGROUPS`
- `SLACK_POSTBACK_ENABLED`

Suggested secrets:

- `SLACK_BOT_TOKEN`
- `SLACK_SIGNING_SECRET` if using event ingestion.

## Phased Rollout

### Phase 0: Test Slack Workspace

- Create a dedicated Slack workspace or isolated pilot channel for integration
  development.
- Use synthetic launch, intake, blocker, and decision conversations.
- Add a small set of known GitHub issue links and issue-number mentions.
- Confirm app permissions, event delivery, idempotency, and GitHub output shape
  before connecting real team channels.

### Phase 1: Slack Context Processor

- Add a deterministic Slack fetch script or Slack MCP configuration.
- For the MVP, read synthetic `slack-fixtures/*.json` files before adding real
  Slack API access.
- Use `.github/workflows/slack-fixture-fetcher.yml` to manually fetch recent
  messages from allowlisted Slack channels into a `slack-fixtures/*.json` pull
  request.
- When real Slack access is added, fetch messages only from allowlisted
  channels.
- Match on GitHub issue URLs, issue numbers, and exact artifact titles.
- Produce `slack-context.json`.
- Add a new Slack Context Processor workflow that comments on GitHub issues.
- Format GitHub comments with a short summary, Slack permalinks, and copied
  context in a collapsed `<details>` block.

### Phase 2: Slack Reaction Intake

- Add an event bridge for Slack `reaction_added` events.
- Support one low-risk reaction such as `:inbox_tray:`.
- Create intake issues with Slack permalink evidence and the `from-slack`
  label.
- Add idempotency so the same message cannot create repeated issues.

### Phase 3: Commitment Reconciliation

- Feed Slack context into Commitment Reconciler.
- Surface promised-but-untracked work, stale commitments, and done-but-open
  signals from Slack.
- Keep all outputs in GitHub.

### Phase 4: Focused Report-Back

- Post short links to GitHub-generated artifacts in mapped Slack channels.
- Start with manual opt-in per workflow.
- Include duplicate suppression and per-run post limits.

### Phase 5: Expanded Reaction Semantics

- Add configured reactions for decision candidates, blockers, context notes, and
  done signals.
- Require review for high-impact actions such as closing issues, changing
  launch phase, or declaring compliance approval.

## Risks and Guardrails

- Slack messages can contain sensitive, informal, or ephemeral context. Avoid
  copying long threads into GitHub unless the workspace explicitly accepts that.
- Emoji reactions are ambiguous. Treat them as intent signals, not approval
  signals, unless policy says otherwise.
- Slack search can return noisy matches. Require high-confidence matching before
  posting to GitHub artifacts.
- Slack channels often have different audiences than GitHub repositories. Use
  explicit channel allowlists and artifact-channel maps.
- Agentic workflows should not have broad Slack write access. Post-back should
  be handled by deterministic validation after the agent proposes a message.

## Discussion Questions

- What should the default GitHub issue comment format look like for summarized
  Slack context plus copied context in `<details>`?
- Should production reaction intake eventually use durable event files, or is
  direct `workflow_dispatch` enough after the MVP?
- Should Slack post-backs be enabled per workflow, per artifact type, or both?
- Should Slack acknowledgement replies use the same `slack_post_message` safe
  output, or a separate narrower thread-reply safe output?
