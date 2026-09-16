# Cross-Channel Customer Feedback Workflow Spec

This spec describes a reusable GitHub-centered workflow for collecting customer
feedback from a hypothetical open-source repository, Discord, and Slack;
normalizing it into one deduplicated queue; and turning selected feedback into
agent-ready work items after a human PM makes the interpretation call.

The goal is to show a practical example other teams can copy: GitHub remains the
durable operating layer, external channels provide signal, and automation does
the sorting and preparation work without flattening customer language or
pretending it understands customer intent better than the PM.

## Problem

Customer feedback arrives through too many doors:

- A hypothetical open-source repository, `agentics-beyond-code-test`, where
  external users file issues, start discussions, and sometimes open PRs.
- Discord community channels.
- Slack customer, field-facing, or internal escalation channels.

That feedback is often duplicated, incomplete, emotional, channel-specific, and
phrased in language the team should not lose. PMs need a reliable queue that
preserves source evidence, specific terminology, and exact complaint/request
phrases while still grouping related signals. Engineering agents need clean work
items with clear scope, context, acceptance criteria, and privacy-safe customer
detail.

## Goals

- Normalize feedback from multiple channels into one GitHub feedback queue.
- Preserve the specific terminology, quoted phrases, and examples people use
  before any LLM-generated summary is introduced.
- Deduplicate related feedback across channels while preserving every source.
- Triage feedback for theme, severity, reach, product area, strategy alignment,
  confidence, and missing information.
- Keep the PM as the owner of interpretation, prioritization, and conversion.
- Convert PM-approved feedback into clean, agent-ready GitHub issues.
- Produce a Friday customer-feedback trends report that compares current
  feedback with active work and the strategy in `docs/strategy.md`.
- Support fixture-first demos for this repository and test accounts.
- Make live external integrations optional and narrowly scoped.

## Non-Goals

- Replacing support ticketing, CRM, community management, or customer success
  systems.
- Letting an agent freely browse every external channel or repository.
- Automatically committing the team to roadmap work.
- Automatically exposing customer-identifying details in engineering issues.
- Treating duplicate detection as a final merge decision without human review.
- Over-summarizing feedback into generic product language before preserving the
  original words.

## Human Ownership Model

The workflow has a deliberately bright line:

- Deterministic adapters collect source records, stable IDs, permalinks, and
  verbatim excerpts.
- Agents can cluster, score, draft, and recommend.
- The PM decides what the customer is really asking for.
- The PM decides whether feedback becomes an engineering work item.
- The PM decides what customer context is safe and relevant to carry forward.

This matters because raw feedback usually mixes symptoms, suggested solutions,
market pressure, account context, urgency, and emotion. The workflow should make
that interpretation easier, not hide it inside automation.

## Language Preservation Principle

The first durable artifact must retain customer language before summarization.
Every feedback intake issue should include:

- Exact phrases: the user's specific words for the pain, request, bug, or
  workaround.
- Terminology inventory: nouns, verbs, feature names, commands, error messages,
  metaphors, or labels the person used.
- Short verbatim excerpts: enough copied context to preserve meaning, with PII
  redacted where needed.
- Agent summary: clearly marked as a draft interpretation, never as the source
  of truth.

Summaries are useful for scanning. They are not allowed to replace the original
language. Dedupe and weekly reporting should quote representative phrases so the
team can notice when customers describe the product differently than the team
does.

## Core Artifacts

### Customer Feedback Project

Use a dedicated GitHub Project for the cross-channel feedback queue. The fields
below are suggested defaults, not required infrastructure. Teams should start
with the fields they already know they will use, then add more once the queue
creates real operating pressure.

Board name: `Customer Feedback Queue`

This project is separate from the existing delivery or launch tracker. Feedback
items and duplicate candidates live here while they are being interpreted.
Accepted work items can then be linked to feedback issues and added to the
existing work project already used by the repo.

Minimum useful fields:

| Field | Values |
|---|---|
| Status | New, Needs PM Review, Potential Duplicate, Needs More Info, Ready to Convert, Converted, Deferred, Duplicate |
| Source | Open Source Repo, Discord, Slack |
| Product Area | Configured by the team |
| Feedback Type | Bug, Feature Request, Usability, Docs, Performance, Reliability, Pricing, Other |

Optional fields:

| Field | Values |
|---|---|
| Severity | Low, Medium, High, Critical |
| Reach | One User, Multiple Users, Account, Segment, Unknown |
| Strategy Fit | Strong Fit, Possible Fit, Weak Fit, Conflicts, Unknown |
| Suggested Priority | P0, P1, P2, P3, Watch |
| PM Decision | Accept, Defer, Duplicate, Needs More Info, Reject |
| Confidence | Low, Medium, High |

Project setup:

- Created as a separate GitHub Project:
  [Customer Feedback Queue](https://github.com/users/chrizbo/projects/3).
- Project number: `3`.
- Owner: `chrizbo`.
- Linked to this repository.
- Future CLI changes require a GitHub token with the `project` scope. If
  `gh auth status` does not list the `project` scope, refresh auth with
  `gh auth refresh -s project`.

### Feedback Intake Issue

Each normalized feedback item becomes or updates a GitHub issue labeled
`feedback:intake`.

Suggested labels. The MVP can start with only `feedback:intake`,
`feedback:needs-pm-review`, `feedback:potential-duplicate`, `feedback:converted`,
and the source labels.

- `feedback:intake`
- `feedback:needs-pm-review`
- `feedback:potential-duplicate`
- `feedback:needs-more-info`
- `feedback:converted`
- `from-open-source-repo`
- `from-discord`
- `from-slack`

Suggested issue body:

```markdown
## Customer Language

### Exact Phrases

- "<short exact phrase>"
- "<short exact phrase>"

### Terminology

- `<term as used by the person>` - <optional context>

### Error Messages / Commands / Product Names

- `<exact string>`

## Source Evidence

- Source link: <source permalink or fixture reference>
- Source context: <short copied excerpt with private identifiers redacted when needed>

<!-- workflow-metadata
feedback_key: <source-system>:<source-id>
source_type: <issue | discussion | pull-request | discord-message | slack-message>
dedupe_key_candidates:
  - <normalized product area + problem phrase>
  - <exact customer phrase>
-->
```

The issue body intentionally avoids repeating project fields and labels such as
source, feedback type, product area, severity, reach, strategy fit, suggested
priority, and PM decision. Those values belong in the `Customer Feedback Queue`
project or labels. The body should preserve customer language and source
evidence only.

Reviewer workflows should add comments rather than pre-allocating empty
sections in the issue body. Dedupe, strategy triage, priority suggestion, PM
review, and conversion comments should each be timestamped artifacts on the
issue timeline so the team can see what changed and when.

### Duplicate Handling

When the workflow finds a likely duplicate, it should not silently merge or
close the new item. It should:

- Label the new issue `feedback:potential-duplicate`.
- Comment with the evidence for the match.
- Link the new issue to the likely canonical feedback issue.
- Make the new issue a sub-issue of the likely duplicate/canonical issue when
  GitHub sub-issues are available.
- Leave the final duplicate decision to the PM.

The canonical issue should preserve source links and exact language from every
duplicate so the team can see whether multiple users are describing the same
thing with different words.

Duplicate linking pattern:

- Choose one canonical feedback issue for the underlying customer problem.
- Add every likely duplicate as a sub-issue of that canonical issue when the
  GitHub API supports it.
- If sub-issue creation is unavailable in the current environment, add a
  durable markdown link in both directions:
  - On the duplicate: `Potential duplicate of #<canonical issue>`
  - On the canonical issue: `Related feedback signals: #<duplicate issue>`
- Preserve the source-specific exact phrases on each child/duplicate issue; do
  not collapse them into only the canonical issue.
- Use an idempotency marker in comments or hidden metadata so reruns do not add
  the same duplicate link repeatedly.
- Prefer a deterministic canonical selection rule so agents make the same choice
  over time: first issue with the same source key, otherwise oldest open
  feedback issue in the duplicate set, otherwise the issue with the richest
  source evidence.

### Agent-Ready Work Item

When a PM accepts a feedback issue, the conversion workflow creates a clean work
item labeled `agent-ready` and links it to the source feedback issue. The work
item goes into the existing work project already used by the repo, while the
feedback issue remains in the `Customer Feedback Queue` as evidence.

The work item should include:

- Problem statement.
- User impact.
- PM interpretation and rationale.
- Preserved customer terminology that should influence the spec.
- Non-goals.
- Acceptance criteria.
- Relevant product constraints.
- Redacted source evidence links.
- Test or verification notes.
- Open questions for the agent or engineering owner.

It should not include unnecessary customer names, private channel excerpts,
account-sensitive details, or raw emotional noise unless that context is
explicitly needed and safe.

## Workflow Architecture

```text
agentics-beyond-code-test issues/discussions/PRs
Discord fixture or API export
Slack fixture or API export
              |
              v
Deterministic source adapters
              |
              v
Normalized feedback event JSON with exact language
              |
              v
Feedback intake creator
              |
              v
GitHub feedback intake issues + Customer Feedback Queue project
              |
              v
Dedupe, strategy triage, and PM review workflow
              |
              v
PM interpretation decision
              |
              v
Feedback-to-work-item converter or slash command
              |
              v
Agent-ready GitHub issue in the existing work project
```

## Proposed Automations

These are the automations this feature should eventually document like the
existing workflows in `.github/workflows/`. Not every automation needs an
agentic workflow: deterministic movement of already-structured data should stay
in normal GitHub Actions, while interpretation-heavy work can use an agent.

For adoption, teams can start with a smaller set:

1. Normalize source fixtures.
2. Create feedback intake issues.
3. Run dedupe and strategy triage.
4. Convert PM-approved feedback into work items.
5. Add the Friday trends report once enough feedback volume exists.

Slack, Discord, live open-source repo ingestion, project-field updates, and
spec-driven agent kickoff can all remain optional extensions.

### Model Usage Guidance

Use models where interpretation is required, not where deterministic data
movement is enough. The intake path should keep parsing, idempotency checks,
issue creation, labels, and project-field writes in a normal GitHub Action.
This reduces token usage, avoids accidental over-summarization, and keeps
customer terminology intact.

Use a lightweight model for fixture normalization and intake orchestration.
Reserve stronger Codex/ChatGPT models for workflows that need judgment, such as
semantic dedupe, strategy-fit prioritization, Friday trend clustering, and
agent-ready work item drafting. When using a stronger model, keep prompts
outcome-oriented and provide compact source views instead of dumping full
payloads unless the exact language is needed for the decision.

### 1. Feedback Source Normalizers

Purpose: Convert channel-specific input into a shared feedback event schema
without losing exact language.

Inputs:

- `feedback-fixtures/open-source-repos/agentics-beyond-code-test/*.json`
- `feedback-fixtures/discord/*.json`
- `feedback-fixtures/slack/*.json`

Live-mode adapters can later replace or supplement fixtures:

- GitHub CLI or GraphQL for issues, discussions, and PRs in
  `agentics-beyond-code-test`.
- Discord channel export from a temporary test channel or bot-scoped API read.
- Slack event export or the existing Slack fixture pattern.

Output:

- `feedback-events/*.json`, one normalized event per source signal or batch.

The normalizers should be deterministic scripts rather than agent prompts. This
keeps parsing, idempotency, redaction, and fixture handling testable.

### 2. Feedback Intake Creator

Purpose: Create or update one GitHub feedback intake issue per unique source
signal.

Implementation: a deterministic GitHub Actions workflow,
`.github/workflows/customer-feedback-intake.yml`, runs manually for the demo.
It calls `.github/scripts/normalize-feedback-fixtures.mjs` and
`.github/scripts/apply-feedback-intake.mjs`.

Behavior:

- Reads normalized feedback event JSON.
- Computes an idempotency key per source item.
- Extracts exact phrases, terminology, error messages, commands, and product
  names before summarization.
- Checks for existing issues containing the same key.
- Creates a new intake issue only when no existing issue is found.
- Adds source labels such as `from-discord` or `from-open-source-repo`.
- Adds `feedback:needs-pm-review`.
- Adds the issue to the `Customer Feedback Queue` project.
- Refreshes generated fixture issue bodies when the old demo run left runtime
  footer text or warning text behind.

Writes:

- Create GitHub issue.
- Add or remove labels.
- Update the Customer Feedback Queue project.
- No external writes.

### 3. Feedback Dedupe, Strategy Triage, and Priority Suggestion

Purpose: Group related intake items, compare them with current strategy, and
prepare PM review with a suggested priority.

Behavior:

- Scans open `feedback:intake` issues.
- Reads `docs/strategy.md`.
- Reads current work from the existing work project and active issues.
- Compares product area, problem statement, keywords, quoted phrases, source
  links, user segment, and exact terminology.
- Marks strong duplicate candidates.
- Links duplicate candidates as sub-issues of the likely canonical feedback
  issue when possible.
- Adds a triage comment with confidence, related items, missing information,
  strategy fit, and suggested priority.
- Suggests priority from strategy fit, severity, reach, recurrence, customer
  language, and whether current work already appears to address the trend.
- Leaves final duplicate, interpretation, and prioritization decisions to the
  PM.

Suggested priority scale:

| Priority | Meaning |
|---|---|
| P0 | Immediate attention; severe customer impact or critical strategy risk. |
| P1 | Consider for next week; strong strategy fit, repeated signal, or urgent bug trend. |
| P2 | Worth shaping soon; relevant but not clearly next-week work. |
| P3 | Backlog or watch; useful signal but weak urgency or unclear strategy fit. |
| Watch | Track for more evidence before considering work. |

Useful labels:

- `feedback:potential-duplicate`
- `feedback:needs-more-info`
- `feedback:clustered`
- `strategy:strong-fit`
- `strategy:possible-fit`
- `strategy:weak-fit`
- `priority:suggested-p1`
- `priority:suggested-p2`
- `severity:high`
- `reach:segment`
- `pm-review`

### 4. PM Interpretation Gate

Purpose: Give the PM a clean place to make the product call.

This can start as comments and label transitions rather than a separate
automation. The PM records interpretation in a comment or slash-command
request, then applies one of these labels:

- `feedback:accepted`
- `feedback:deferred`
- `feedback:duplicate`
- `feedback:needs-more-info`
- `feedback:rejected`
- `feedback:ready-to-convert`

Only an explicit `/create-work-item` slash command should trigger work-item
conversion in the first implementation. The `feedback:ready-to-convert` label
can still be used as a state marker, but it should not trigger conversion by
itself until the team decides that is safe.

### 5. Feedback-to-Work-Item Converter

Purpose: Convert PM-approved feedback into an agent-ready issue.

The converter and the "agent kickoff command" are the same automation in the
MVP. The important behavior is conversion from interpreted feedback into a clean
work item, triggered by the PM's explicit slash command.

Behavior:

- Runs when a PM posts `/create-work-item` on a feedback issue.
- Reads PM review comments and slash-command context when present.
- Drafts a work item from PM-reviewed feedback when available, not from raw
  feedback alone.
- Carries forward customer terminology that should shape the spec.
- Redacts or omits sensitive customer details.
- Links back to all source feedback issues and duplicate sub-issues.
- Adds the new work item to the existing work project.
- Marks the source feedback issue as `feedback:converted`.

Safe outputs:

- Create GitHub issue with title prefix `[Feedback Work Item]`.
- Add `agent-ready` and domain labels.
- Update the existing work project.
- Comment back on the source feedback issue with the created work item link.

Slash command mechanics:

- Use the Agentic Workflows native `slash_command:` trigger rather than a custom
  `issue_comment` parser.
- Command name: `create-work-item`, invoked as `/create-work-item`.
- Restrict command events to `issues` and `issue_comment` so it only runs from
  feedback issue bodies or comments.
- Rely on Agentic Workflows' command matching rule that the slash command must
  be the first word of the body/comment.
- Use the sanitized command context exposed by Agentic Workflows rather than raw
  GitHub event fields.
- Keep the command limited to users who are allowed to operate on the repo; the
  default ChatOps posture is write-permission users, and the workflow can narrow
  or widen that later with `on.roles` if needed.
- Keep the default command reaction/status comment unless it becomes noisy in
  demos.
- Do not combine this command workflow with `bots:`; the command should be an
  explicit human action.

Frontmatter sketch:

```yaml
on:
  slash_command:
    name: create-work-item
    events: [issues, issue_comment]
```

Optional later commands:

```text
/draft-spec
/start-agent-work
```

These commands are later extensions, not separate MVP automations. They connect
the workflow to spec-driven development once the converted work item has enough
acceptance criteria and PM-approved context. The first implementation should
create a strong agent-ready issue rather than immediately opening a PR.

### 6. Friday Feedback Trends Report

Purpose: Produce a Friday report that helps the team decide what feedback-driven
work to consider next week.

Schedule:

- Fridays, after the weekly status workflow has enough current work context.

Inputs:

- Open and recently converted feedback issues.
- Potential duplicate groups and linked sub-issues.
- Exact customer phrases and terminology inventory.
- Suggested priorities from feedback triage.
- Current work from the existing work project.
- `docs/strategy.md`.
- For demos, a seeded sample set of feedback issues in the
  `Customer Feedback Queue` project.

Report output:

- GitHub Discussion, issue, or comment, depending on the repo convention used
  by the other weekly report workflows.

Report sections:

- Highest-priority feedback to consider next week.
- Top emerging bug trends.
- Top emerging request trends.
- Repeated exact phrases customers are using.
- Feedback that aligns strongly with current strategy.
- Feedback that is high-volume but weakly represented in current work.
- Active work that appears to address current feedback.
- Feedback clusters with no obvious active owner.
- Candidate work to consider next week, ranked by suggested priority,
  confidence, strategy fit, and source links.
- Items not recommended right now, with rationale.

The report should use the strategy lens twice: first when scoring individual
feedback during triage, and again when comparing weekly trends against the
portfolio of current work. The next-week recommendations should be based on the
triage priority suggestions but can raise or lower items when the weekly trend
view shows a stronger pattern than any single issue.

Demo readiness requirement:

- Before a demo Friday report runs, the repo should contain enough sample
  feedback issues in the `Customer Feedback Queue` project to produce an
  interesting report.
- The sample set should include at least one cross-channel duplicate cluster,
  one bug trend, one repeated feature request, one noisy item that should not
  become work, and one item with strong strategy fit.
- Aim for a moderate demo volume: roughly 12-18 feedback intake issues across
  sources is enough to produce an interesting Friday report without burying the
  demo in sample data.
- The sample issues should be created from fixtures through the same intake path
  the real workflow uses, so the demo proves the workflow rather than bypassing
  it.

### 7. Feedback Fixture Simulator

Purpose: Generate fixture data for demos and regression testing.

This can be a parallel workflow to `sample-data-simulator.md` or a new mode in
the existing simulator. A parallel workflow is cleaner if feedback fixtures
need different source formats, secrets, and cadence than launch/project sample
data.

Behavior:

- Creates realistic fixture files under `feedback-fixtures/**`.
- Optionally invokes the feedback intake path so demo feedback becomes real
  GitHub issues in the `Customer Feedback Queue` project before the Friday
  report runs.
- Includes at least one duplicate across channels.
- Includes at least one bug trend.
- Includes at least one repeated feature request.
- Includes at least one noisy item that should not become work.
- Includes at least one item that aligns strongly with `docs/strategy.md`.
- Avoids real PII.

## Normalized Feedback Event Schema

The fixture and live adapters should converge on this shape:

```json
{
  "source_system": "discord",
  "source_type": "message",
  "source_id": "discord:channel-id:message-id",
  "source_url": "https://example.test/source",
  "observed_at": "2026-09-15T12:00:00Z",
  "author": {
    "display_name": "safe display name",
    "role": "community member",
    "is_internal": false
  },
  "channel_or_repo": {
    "id": "channel-id-or-repo-name",
    "name": "customer-feedback",
    "kind": "discord-channel",
    "allowlisted": true
  },
  "content": {
    "text": "Raw or lightly redacted feedback text.",
    "verbatim_excerpts": [
      "exact phrase the person used"
    ],
    "terminology": [
      "term as written by the person"
    ],
    "error_strings": [
      "exact error, command, or product string"
    ],
    "redacted": false,
    "language": "en"
  },
  "product": {
    "area": "unknown",
    "feature": "unknown"
  },
  "customer_context": {
    "segment": "unknown",
    "account": "redacted or omitted",
    "plan": "unknown"
  },
  "signals": {
    "feedback_type": "bug",
    "sentiment": "negative",
    "urgency": "medium",
    "reaction_count": 3,
    "thread_reply_count": 4
  },
  "ingestion": {
    "fixture_file": "feedback-fixtures/discord/example.json",
    "idempotency_key": "feedback:discord:channel-id:message-id"
  }
}
```

## Fixture-First Plan

Because this repo uses a test account and needs portable examples, fixtures are
the default implementation path.

Suggested folder structure:

```text
feedback-fixtures/
  open-source-repos/
    agentics-beyond-code-test/
  discord/
  slack/
feedback-events/
```

Initial fixture sources:

- Open-source repo: GitHub issue, discussion, and PR fixtures from
  `agentics-beyond-code-test`, a hypothetical public repo where external
  customers file feedback.
- Discord: temporary test channel export or hand-authored Discord-shaped JSON.
- Slack: reuse the fixture style from `slack-fixtures/`.

Fixture requirements:

- Include stable source IDs.
- Include realistic source permalinks when available, or explicit fixture
  references when not.
- Avoid real customer PII.
- Include exact phrases and terminology fields.
- Include at least one duplicate across channels.
- Include at least one noisy item that should not become work.
- Include at least one high-value item that should convert cleanly.
- Include at least one item that conflicts with or sits outside current
  strategy, so the strategy triage is visible.

## Fixtures vs Live Integrations

Fixtures are not just fake data. They are the contract that live adapters must
match.

Fixtures should model:

- The source shape each platform returns.
- Stable IDs and idempotency behavior.
- Source permalinks or fixture references.
- Verbatim excerpts and terminology extraction.
- Redaction behavior.
- Duplicate examples across channels.

Live integrations add:

- Authentication.
- Pagination and rate limits.
- Channel or repository allowlists.
- Webhook or scheduled polling behavior.
- API failure handling.
- Permission and retention constraints.

Potential secrets and variables for adoption:

| Source | Secrets | Variables |
|---|---|---|
| GitHub current repo | `AW_TOKEN` if project updates need elevated access | `FEEDBACK_PROJECT_OWNER`, `FEEDBACK_PROJECT_NUMBER` |
| `agentics-beyond-code-test` repo | `FEEDBACK_GITHUB_TOKEN` if unauthenticated API limits are too low or private/internal repos are used | `FEEDBACK_SOURCE_REPOS`, `FEEDBACK_SOURCE_LABELS`, `FEEDBACK_SOURCE_DISCUSSION_CATEGORIES`, `FEEDBACK_SOURCE_INCLUDE_PRS` |
| Discord | `DISCORD_BOT_TOKEN` for live bot reads | `DISCORD_FEEDBACK_CHANNEL_IDS`, `DISCORD_GUILD_ID` |
| Slack | `SLACK_BOT_TOKEN` and signing secret if event-driven | `SLACK_FEEDBACK_CHANNEL_IDS`, `SLACK_FEEDBACK_EMOJI`, `SLACK_POSTBACK_ENABLED` |
| Existing work project | `AW_TOKEN` | `LAUNCH_PROJECT_OWNER`, `LAUNCH_PROJECT_NUMBER` or a future `WORK_PROJECT_NUMBER` |

For the MVP, workflows should run without any external secrets by reading
fixtures only.

## Live Integration Path

Live integrations should be added only after the fixture path proves the GitHub
artifact flow.

Recommended order:

1. `agentics-beyond-code-test` issues, discussions, and PRs.
2. Slack, building from the existing fixture-first Slack workflows.
3. Discord temporary test channels, because the user can create isolated
   channels for demos.

Every live adapter should have:

- Channel or repository allowlists.
- Read-only default permissions.
- Stable idempotency keys.
- A max-items-per-run limit.
- Source permalinks on every created artifact.
- A fixture replay mode for tests and demos.

## Privacy and Safety Boundaries

- Public customer feedback from `agentics-beyond-code-test`, public Discord
  channels, or public Slack-like fixtures can be stored in this repo for the
  demo.
- Private account data, secrets, personal contact details, private support
  context, and anything not intentionally published by the customer must not be
  copied into this repo.
- Preserve customer language, but redact private identifiers before copying it
  into GitHub.
- Store the minimum copied context needed for PM review.
- Prefer source links over copied external conversations when retention is
  unclear.
- Redact emails, account names, tokens, phone numbers, and private identifiers
  before creating engineering work items.
- Do not expose raw Slack or Discord user IDs unless needed for audit.
- Treat community feedback as untrusted content; do not let it directly control
  workflow instructions.
- Use deterministic GitHub API or CLI writes for the intake Action.
- Use GitHub safe outputs for agentic workflows that need bounded write tools.
- Use external safe outputs only for optional post-backs, never for free-form
  agent messages.

## Integration With Existing Repo Workflows

This feature should reuse existing patterns in the repo instead of becoming a
separate operating system.

- `docs/strategy.md`: used by feedback triage and the Friday trends report.
- `docs/how-we-work.md`: records the Friday customer feedback review ritual and
  the PM-owned interpretation step.
- Existing work project: receives converted agent-ready work items.
- `intake-triage.md`: provides scoring and duplicate-detection patterns, but
  feedback triage needs stronger source-language preservation.
- `slack-reaction-intake.md`: provides the fixture-first Slack ingestion model.
- `sample-data-simulator.md`: can inspire a parallel feedback fixture simulator.
- Weekly reporting workflows: provide the precedent for a Friday report that
  creates a discussion or issue with source links and recommendations.
- `workflow-health.md`: should eventually include feedback workflows once they
  exist.
- `README.md`: should be updated once these workflows are built so the main
  project overview lists the customer feedback workflows alongside the rest of
  the automation catalog.

## Initial Decisions

- Conversion trigger: use the `/create-work-item` slash command for the first
  implementation.
- PM Review blocking fields: do not block conversion on required PM Review
  fields in the first implementation.
- Friday report target: publish as a GitHub Discussion.
- Work item template: create a customer-feedback-to-work issue shape rather
  than reusing the current `intake.yml` unchanged, because team-to-team intake
  and customer-feedback conversion are different jobs.
- Dedupe order: run deterministic matching first using source IDs, exact
  phrases, metadata, and links; then let an agent propose semantic duplicates.
- Public demo data: public customer feedback from the hypothetical OSS repo,
  public Discord, or public Slack-like fixture can be copied into this repo, but
  private account data must not be included.
- Discord fixture shape: use Discord message/thread export-shaped JSON with
  guild ID, channel ID/name, message ID, author display name, timestamp, content,
  reactions, reply/thread references, attachments metadata, and permalink when
  available.
- Hypothetical open-source source repo: `agentics-beyond-code-test`.
- Project fields: keep the minimum useful field set for the demo and treat more
  subjective fields as optional.

## Future Considerations

- Add minimum PM Review fields once the team knows which fields are genuinely
  needed to prevent bad conversions.
- Introduce a team taxonomy or customer/internal vocabulary map for semantic
  dedupe, because customers may use different terminology than the internal
  team.
- Revisit whether `/draft-spec` or `/start-agent-work` should become follow-on
  commands after `/create-work-item` proves useful.

## MVP Implementation Slices

### Slice 1: Spec and Fixture Shape

- Create this spec.
- Add fixture folders and one sample fixture per source.
- Add normalized feedback event examples with exact phrases and terminology.
- Decide the feedback issue body format.

### Slice 2: Fixture Normalizers

- Add deterministic scripts that convert source fixtures into normalized
  feedback events.
- Add basic tests for idempotency keys, terminology extraction, exact phrase
  preservation, and redaction.

### Slice 3: Intake Creator Workflow

- Add a fixture-first deterministic GitHub Action that creates feedback intake
  issues from normalized events.
- Use direct GitHub issue and Project v2 API writes.
- Add issues to the `Customer Feedback Queue` project.
- Validate with duplicate source IDs.

### Slice 4: Dedupe, Strategy Triage, and PM Review Workflow

- Add a scheduled or manual workflow that reviews open feedback intake issues,
  proposes duplicate candidates, links duplicates as sub-issues, and labels
  items for PM review.
- Check feedback against `docs/strategy.md`.
- Keep duplicate and interpretation decisions human-owned.

### Slice 5: Friday Feedback Trends Report

- Add a Friday workflow that analyzes current feedback trends, current work,
  and `docs/strategy.md`.
- Publish a weekly report with bug trends, request trends, exact customer
  terminology, active-work coverage, and candidate next-week work.

### Slice 6: Work Item Converter and Agent Kickoff

- Add one workflow that converts PM-approved feedback into `agent-ready` issues.
- Trigger conversion with `/create-work-item`.
- Do not require PM Review fields before conversion in the first
  implementation.
- Link feedback issues and duplicate sub-issues to the created work item.
- Add the work item to the existing work project.

### Slice 7: Optional Live Adapters

- Add live ingestion for `agentics-beyond-code-test` issues, discussions, and
  PRs.
- Add Slack live ingestion using the existing Slack patterns.
- Add Discord test-channel ingestion.

## Demo Story

The demo should show one feedback theme arriving through multiple places:

1. A GitHub Discussion asks for a clearer onboarding checklist.
2. An external open-source repo issue says setup has "no visible progress" and
   "just hangs after auth."
3. A Discord user says setup "gets stuck after login."
4. A Slack field note mentions a customer blocked during rollout.
5. The workflow creates normalized feedback intake artifacts while preserving
   those exact phrases.
6. The dedupe workflow proposes a potential duplicate group, linking newer
   items as sub-issues of the likely canonical feedback issue.
7. The triage workflow checks the cluster against `docs/strategy.md` and active
   work.
8. The Friday report calls out the trend: repeated setup-progress complaints are
   not clearly represented in current work.
9. The PM writes the interpretation: "The real problem is not documentation
   length; it is lack of setup progress visibility and recovery guidance."
10. The PM comments `/create-work-item`.
11. The converter creates an agent-ready issue with acceptance criteria,
   preserved customer terminology, and privacy-safe source links.

That story keeps the magic in the right place: automation assembles the room,
and the PM makes the call.
