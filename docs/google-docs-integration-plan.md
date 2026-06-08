# Google Docs Integration Plan

Future work proposal for using Google Docs as a bounded context source and a
validated update target for Agentics Beyond Code workflows.

## Why Google Docs

The repository currently demonstrates how agentic workflows reason over
GitHub-native artifacts, transcripts, and Slack context. Many teams also keep
important narrative context in Google Docs: product briefs, customer research,
policy drafts, launch plans, and cross-functional status notes.

The integration should make that context available without giving the agent
broad Drive access or permission to freely rewrite human-owned documents.

## Goals

- Pull context from one explicitly configured Drive scope: either a shared
  drive or a shared folder in My Drive.
- Normalize selected Google Docs into compact, locally readable snapshots
  before the agent runs.
- Let workflows cite Google Docs as evidence when evaluating decisions.
- Support narrow Google Docs updates through custom safe outputs.
- Keep GitHub Actions runs and GitHub artifacts as the durable audit trail.
- Start with synthetic documents and staged writes before using real team docs.

## Non-Goals

- Searching a user's entire Google Drive.
- Giving the agent direct Google write credentials.
- Replacing GitHub decision records or workflow-generated reports.
- Arbitrary document creation, deletion, moving, sharing, or full-body rewrite.
- Editing Docs based only on fuzzy title matching.

## Recommended MVP Decisions

- Use a fixture-first corpus under `google-docs-fixtures/`.
- Model the fixture corpus as a fake Google Docs scope with stable document
  IDs, metadata, source links, and exported Markdown content.
- Use the same read and write contracts for a configured shared folder or
  shared drive; isolate their API-specific lookup behavior in the adapter.
- For real reads, use a deterministic pre-step that fetches only allowlisted
  document IDs and writes normalized snapshots into the runner workspace.
- Do not expose Google credentials or a broad Google Drive MCP server to the
  reasoning agent in the first production iteration.
- For real writes, distinguish review comments, bounded appends, and new
  generated documents instead of exposing a generic edit action.
- Make the first write operation `google_docs_add_comment`, followed by
  `google_docs_append_update` only for documents with an explicit
  automation-owned update section.
- Keep every write allowlisted, source-linked, idempotent, volume-limited, and
  staged by default.
- Treat Google Docs as the source of truth for the human-owned narrative they
  contain; treat GitHub as the source of truth for workflow audit and review.

## Proposed Architecture

```text
Allowlisted Google Docs scope
                 |
                 v
Deterministic Drive/Docs fetch pre-step
                 |
                 v
Normalized manifest + Markdown snapshots
                 |
                 v
Agent reasons over GitHub + document context
                 |
                 +--------------------------+
                 |                          |
                 v                          v
GitHub safe outputs               narrow Google Docs
for durable review                custom safe output jobs
                                            |
                                            v
                               Validated Google Docs API write
```

The deterministic read pre-step is the recommended first real integration. A
read-only Google Workspace MCP server could be evaluated later when workflows
need exploratory search, but it should still be restricted to the configured
folder or shared drive and narrow tools.

## Fixture-First Data Model

The fake Google Docs scope lives at `google-docs-fixtures/`:

```text
google-docs-fixtures/
  README.md
  manifest.json
  documents/
    product-council-audit-export-decision-brief.md
    customer-advisory-atlas-bank-notes.md
    security-data-retention-policy-draft.md
    audit-export-launch-plan.md
    weekly-program-brief.md
```

`manifest.json` represents the metadata a real fetch step should produce:

- Stable Google document ID.
- Configured scope type and root identity.
- Document title and source URL.
- Allowed use: context input, safe-output target, or both.
- Artifact type and owning function.
- Freshness metadata.
- Local snapshot path.

Fixtures should remain human-readable Markdown, even though a real Google Docs
fetch would use the Docs API document structure. The fetch adapter is
responsible for converting headings, paragraphs, lists, and tables into a
compact normalized representation.

## Initial Demo Scenarios

### 1. Decision Context Pack

**Question:** Should the Audit Log Export launch ship with 30-day retention or
wait for configurable 365-day retention?

The workflow reads:

- Product Council decision brief.
- Atlas Bank customer advisory notes.
- Security data retention policy draft.
- Current launch plan.

It produces a GitHub decision-readiness comment or issue containing facts,
conflicts, missing evidence, a recommendation, confidence, and links to every
source document.

This demonstrates that important decision context can live outside GitHub
without becoming invisible to GitHub-centered workflows.

### 2. Decision Brief Review Comment

After producing the Decision Context Pack in GitHub, the agent proposes an
unanchored review comment on the Product Council decision brief. The comment
summarizes the unresolved conflict and links to the full GitHub artifact.

This demonstrates the lowest-impact write mode: the workflow participates in
the human review conversation without changing document content.

### 3. Launch Plan Report-Back

After a launch-readiness workflow runs, the agent proposes a short update to
the Audit Export Launch Plan. The custom safe output validates and appends a
dated block containing:

- Readiness state.
- New blocker or resolved risk.
- Required GitHub source URL.
- Workflow run URL.
- Idempotency marker.

This demonstrates a useful Google Docs write without allowing arbitrary edits.

### 4. Weekly Program Brief Update

The Weekly Status workflow proposes a concise cross-functional update for the
Weekly Program Brief. The safe output appends at most one update per run and
requires the GitHub discussion URL as the durable source.

This demonstrates report-back to an audience that works in Docs while keeping
the full reasoning and history in GitHub.

### 5. Collaborative Weekly Status Draft

The Weekly Status workflow creates a short-lived Google Doc from an allowlisted
template instead of publishing its first synthesis as the final report.

The handoff from agent draft to human shaping is explicit:

1. The workflow creates a draft in a dedicated `Status Drafts` folder.
2. The draft includes source links, uncertain claims, and a review deadline.
3. The workflow posts one GitHub issue or discussion comment containing the
   document link, requested reviewers, and finalization deadline.
4. A short Slack report-back may notify the team, but the GitHub artifact is
   the durable coordination record.
5. Humans edit the document directly and resolve review comments during the
   shaping window.
6. A human marks the draft ready using an explicit GitHub command or label.
7. A separate finalization workflow reads the shaped document and publishes
   the official status report.

This demonstrates Google Docs as a temporary collaborative draft layer between
agent synthesis and durable publication.

## Draft-to-Shaping Handoff

The transition from agent-generated draft to human collaboration should not be
implicit. Creating a document is insufficient; the workflow must create a
clear invitation, route it to the right people, and establish how the draft
will leave review.

### Draft Document Contract

Every collaborative draft should contain:

- `Status: Needs team shaping`
- Purpose and intended audience.
- Draft owner.
- Review deadline.
- Final publication target.
- Source GitHub artifact and workflow-run URL.
- Sections where the agent is uncertain or explicitly requests human input.
- A note that direct edits are expected and that the final durable report will
  be published elsewhere.

Suggested header:

```text
Status: Needs team shaping
Owner: Sarah Chen
Review by: 2026-06-11 3:00 PM PT
Final destination: GitHub Discussion
Coordination issue: https://github.com/owner/repo/issues/123
```

### Coordination Artifact

Create or update one GitHub issue for the shaping window:

```text
[Status Draft] Weekly Product Status - 2026-06-08
```

The issue should include:

- Google Doc link.
- Review deadline.
- Requested reviewers or represented functions.
- Specific questions needing human judgment.
- Draft lifecycle state.
- Final report URL once published.

Recommended lifecycle labels:

```text
status-draft:shaping
status-draft:ready
status-draft:published
status-draft:expired
```

The issue gives the temporary document a durable owner, state machine, and
audit trail without forcing the actual collaborative editing into GitHub.

### Notification

After creating the Doc and coordination issue:

- Post a concise Slack message linking to both.
- State what kind of contribution is requested, not merely that a draft exists.
- Include the deadline and owner.
- Do not require people to reply in Slack; edits belong in the Doc and state
  transitions belong in GitHub.

Example:

```text
Weekly status draft is ready for team shaping.
Please edit the sections for your area and resolve assigned comments by
Thursday 3 PM PT.

Draft: <Google Doc URL>
Coordination and open questions: <GitHub issue URL>
```

### Opening the Shaping Window

The draft-creation workflow is complete only when all of these are true:

- Google Doc creation succeeded in the allowlisted drafts folder.
- Template placeholders were populated.
- The coordination issue exists and links to the Doc.
- The issue is labeled `status-draft:shaping`.
- The requested reviewers and deadline are visible.
- Notification was sent or a notification failure was recorded.

This prevents an orphaned Google Doc from counting as a successful handoff.

### Closing the Shaping Window

Use an explicit human-controlled signal for the MVP:

- Apply the `status-draft:ready` label to the coordination issue, or
- Comment `/finalize-status` on the coordination issue.

Do not infer readiness merely because the deadline passed or document activity
stopped. A scheduled reminder can flag overdue drafts, but final publication
should initially require an affirmative human signal.

Before finalizing, the workflow should verify:

- The triggering user is allowlisted to finalize.
- The Google Doc still belongs to the expected folder.
- The document was modified after the agent created it.
- Required sections are non-empty.
- No unresolved workflow-created review comments remain.
- The final report has not already been published.

### Ownership Model

- **Agent owns:** collecting evidence, generating the first draft, flagging
  uncertainty, routing the draft, and publishing the shaped result.
- **Draft owner owns:** getting appropriate reviewers involved and deciding
  when the report is ready.
- **Contributors own:** editing their areas and resolving factual questions.
- **GitHub coordination issue owns:** lifecycle state and audit trail.
- **Google Doc owns:** the temporary collaboratively shaped narrative.
- **Published report owns:** the official status communicated to its audience.

## Real Read Path

### Authentication

Use a dedicated Google principal for automation and grant it access only to the
configured folder or shared drive.

For read, comment, and append operations, a service account or
workload-identity-backed principal can work when it has been explicitly shared
onto the target scope.

For creating new Docs in a regular My Drive shared folder, use an authenticated
automation user when ownership or storage-quota rules prevent a service account
from creating the file. Shared drives manage ownership differently and are
usually friendlier to service-account-created files.

Store the minimum required authentication material as GitHub environment
secrets. Prefer an environment such as `google-docs-demo` so repository
environment protection can gate access.

### Configured Scope

Configure exactly one scope:

```text
GOOGLE_DOCS_SCOPE_TYPE=folder
GOOGLE_DOCS_SCOPE_ROOT_ID=<folder-id>
```

or:

```text
GOOGLE_DOCS_SCOPE_TYPE=shared_drive
GOOGLE_DOCS_SCOPE_ROOT_ID=<shared-drive-id>
```

Optional narrower controls:

- `GOOGLE_DOCS_ALLOWED_DOCUMENT_IDS`: explicit document IDs that may be read.
- `GOOGLE_DOCS_WRITABLE_DOCUMENT_IDS`: explicit document IDs that may receive
  comments or appends.
- `GOOGLE_DOCS_DRAFTS_FOLDER_ID`: folder where new collaborative drafts may be
  created.

For a folder scope, the adapter verifies that each document is the root folder
or a descendant of it. For a shared-drive scope, the adapter verifies that each
document belongs to the configured shared drive. The agent receives the same
normalized manifest either way.

`GOOGLE_DOCS_DRAFTS_FOLDER_ID` must be the configured folder itself or a
descendant of the configured scope. This keeps newly created weekly drafts
inside the same bounded collaboration area.

Explicit document IDs are safer and simpler for the first real run.

### Fetch Adapter

Add a deterministic script such as:

```text
.github/scripts/fetch-google-docs-context.mjs
```

Responsibilities:

1. Read the document allowlist.
2. Fetch file metadata through the Drive API.
3. Verify every file belongs to the configured folder tree or shared drive.
4. Fetch document structure through the Docs API.
5. Normalize supported content into Markdown and a compact manifest.
6. Enforce per-document and total-size limits.
7. Write snapshots to a temporary runner directory, not the repository.
8. Fail closed when a document is outside the allowlist or cannot be verified.

The agent receives the normalized snapshots, not Google credentials.

## Choosing the Write Mode

Google Docs writes should reflect the type of artifact and the human
expectation around it. There should not be one general-purpose edit tool.

| Mode | Best use | Main benefit | Main risk | MVP recommendation |
|---|---|---|---|---|
| Add comment | Review findings, questions, decision gaps, policy concerns | Lowest-impact participation in a human-owned document | Comments can become noisy; API-created anchored comments are not reliably shown inline by Google editors | **First write mode and default for human-owned docs** |
| Append update | Recurring status, launch readiness, dated evidence log | Simple, visible, and easy to make idempotent | Document can accumulate clutter | **Allow only on docs with an explicit `Agentics Updates` section** |
| Replace managed section | Maintain one current status block or generated summary | Keeps a document concise and current | Text indexes shift during collaboration; replacement can overwrite human edits | Later, only between explicit automation-owned markers with revision checks |
| Create new doc | New decision pack, report, meeting brief, or generated artifact | Avoids modifying a human-authored source document | Creates document sprawl and requires folder, naming, sharing, and lifecycle rules | Add after comments/appends, using templates and a dedicated output folder |
| Full document rewrite | Reauthor or normalize an existing document | Maximum flexibility | Excessive blast radius and poor ownership boundaries | **Do not support** |

Recommended policy:

- **Comment** when the workflow is advising, reviewing, questioning, or asking
  a human to make a decision.
- **Append** when the document is a living log and explicitly opts into
  automation-written updates.
- **Create** when the workflow owns the resulting artifact and people need a
  standalone Google Doc.
- **Replace a managed section** only when humans have clearly delegated that
  section to automation.

Comments should initially be unanchored. The Drive API accepts anchored comment
metadata, but Google Workspace editor apps may still treat API-created anchored
comments as unanchored, so exact inline placement should not be an MVP promise.

## Lessons From Built-In Safe Outputs

The Google Docs integration should follow the design of GitHub Agentic
Workflows safe outputs rather than simply wrapping the Drive and Docs APIs.
Built-in safe outputs expose bounded collaboration operations, keep the agent
read-only, and apply policy in a separate write-capable job.

The most useful patterns to carry over are:

| Built-in safe-output pattern | Google Docs equivalent |
|---|---|
| `create-discussion` and `create-pull-request` represent purposeful artifact creation | Create a collaborative draft from an allowlisted template in a configured drafts folder |
| `add-comment` and PR review comments separate review from mutation | Add an unanchored review comment without changing document content |
| `update-discussion` enables only explicitly configured fields | Permit only named managed-section or lifecycle-field updates |
| PR protected files constrain sensitive changes | Protect human-owned document sections and allow mutation only in automation-owned sections |
| Title prefixes, allowed labels, and fixed targets constrain agent choice | Configure title prefixes, template IDs, target folders, and document allowlists outside the agent request |
| `max`, expiration, grouping, and deduplication bound recurring output | Limit writes, expire drafts, and deduplicate by lifecycle key |
| Staged mode previews writes before applying them | Render the proposed Doc creation, comment, append, or managed-section replacement in the Actions summary |
| Safe-output replay retries failed writes | Make every Docs write idempotent so replay cannot duplicate documents, comments, or appended updates |
| Environment protection controls access to write credentials | Keep Google write credentials in a protected GitHub environment |
| Safe-output concurrency queues write jobs | Serialize writes by configured scope or document to avoid conflicting updates |
| `noop`, `missing-tool`, and `missing-data` make non-action explicit | Report when no Doc write is needed or when required source documents are unavailable |

The key design rule is:

> Expose collaboration intent, not raw API capability.

An agent should request "create a weekly status collaboration draft," not
"create file, move file, grant permission, insert text, and add comments."

## Reference Safe-Output Surface

A reusable Google Docs adapter should expose a small semantic toolset. Each tool
should have a narrow collaboration purpose and its own policy.

### `google_docs_create_collaboration_draft`

Creates a short-lived draft from a configured template. This is the Google Docs
equivalent of creating a draft PR or discussion.

Suggested agent inputs:

```json
{
  "type": "google_docs_create_collaboration_draft",
  "title_suffix": "Weekly Product Status - 2026-06-08",
  "week_of": "2026-06-08",
  "owner": "Sarah Chen",
  "review_deadline": "2026-06-11T15:00:00-07:00",
  "github_source_url": "https://github.com/owner/repo/discussions/123",
  "lifecycle_key": "weekly-status:2026-06-08"
}
```

Policy-owned configuration:

- Template document ID.
- Drafts folder ID.
- Required title prefix.
- Required body fields.
- Maximum drafts per run.
- Expiration period.
- Default collaborators or notification route.

The agent must not choose an arbitrary template, destination folder, or sharing
policy.

Keep tool inputs flat and narrow. Custom safe-output job schemas support
`string`, `boolean`, and `choice` inputs, so complex configuration and trusted
metadata should remain in repository variables or the safe-output job rather
than being passed as nested agent-authored objects.

### `google_docs_add_comment`

Adds review feedback to an allowlisted document without changing its content.
This is the default write for human-owned documents.

### `google_docs_append_update`

Adds a source-linked, dated entry to an explicit automation-owned update log.
This resembles append-only safe-output status comments.

### `google_docs_update_managed_section`

Replaces one configured automation-owned section with revision checking. This
resembles an explicitly enabled `update-discussion` field or a PR change
restricted away from protected files.

This tool should not be part of the first implementation.

### `google_docs_finalize_collaboration_draft`

Marks a workflow-created draft as finalized after an explicit human-controlled
signal. It may update the lifecycle header, remove the draft marker, and record
the published GitHub report URL. It must not publish merely because a deadline
passed.

### `google_docs_archive_collaboration_draft`

Moves or marks an expired workflow-created draft as archived. This is analogous
to discussion expiration or closing older recurring issues. It should operate
only on documents created by the workflow and identified by a lifecycle marker.

## Reference Adapter Policy

The shared adapter should make policy visible in configuration rather than
embedding it in prompts. A useful conceptual configuration is:

```yaml
safe-outputs:
  environment: google-docs-demo
  concurrency-group: "google-docs-${{ github.repository }}"
  staged: true
  jobs:
    google-docs-create-collaboration-draft:
      # Fixed template, destination, title prefix, max, and expiration.
    google-docs-add-comment:
      # Fixed scope and writable-document allowlist.
    google-docs-append-update:
      # Fixed append-enabled document allowlist.
```

The initial reusable component should be distributed as:

```text
.github/workflows/shared/google-docs-safe-outputs.md
```

Adopters should configure behavior with repository variables and environment
secrets, without editing the validation logic.

Use custom safe-output **jobs** for authenticated Google writes. They provide a
separate Actions job boundary, can use environment-scoped secrets, and receive
the agent's structured requests through `GH_AW_AGENT_OUTPUT`. The job must
filter for its own item type and independently validate every field before
calling Google APIs.

### Common Configuration

- `GOOGLE_DOCS_SCOPE_TYPE`
- `GOOGLE_DOCS_SCOPE_ROOT_ID`
- `GOOGLE_DOCS_ALLOWED_DOCUMENT_IDS`
- `GOOGLE_DOCS_COMMENTABLE_DOCUMENT_IDS`
- `GOOGLE_DOCS_APPENDABLE_DOCUMENT_IDS`
- `GOOGLE_DOCS_DRAFTS_FOLDER_ID`
- `GOOGLE_DOCS_DRAFT_TEMPLATE_ID`
- `GOOGLE_DOCS_DRAFT_TITLE_PREFIX`
- `GOOGLE_DOCS_MAX_WRITES_PER_RUN`
- `GOOGLE_DOCS_DRAFT_EXPIRES_DAYS`

### Common Required Fields

Every write request should include:

- `github_source_url`: durable reasoning or coordination artifact.
- `lifecycle_key` or `idempotency_key`: stable duplicate-prevention key.
- Operation-specific content.

The safe-output job should add its own workflow marker and run URL. The agent
should not be responsible for generating trusted audit metadata.

### Protected Content

Borrow the protected-files idea from PR safe outputs:

- Human-authored document content is protected by default.
- Append operations require an opted-in update-log marker.
- Managed-section updates require configured start/end markers.
- Attempts to mutate outside those markers fail closed.
- The adapter reads the latest document revision immediately before writing.
- Revision mismatch should fail or retry; it should never silently overwrite a
  concurrent human edit.

### Deduplication and Replay

Safe-output replay is valuable after transient API failures, but it makes
idempotency mandatory:

- Draft creation deduplicates by `lifecycle_key` and reuses the existing draft.
- Comments include a hidden or machine-readable workflow marker and skip an
  existing matching comment.
- Appends include an idempotency marker and skip an existing matching block.
- Finalize and archive operations are state transitions that become no-ops when
  the document is already in the requested state.
- Partial failures must be recorded so replay can finish remaining operations
  without repeating successful ones.

### Staged Mode

Custom Google Docs safe outputs should respect `GH_AW_SAFE_OUTPUTS_STAGED`.
Staged mode should perform all reads and validation but skip writes, then show:

- Operation type.
- Target document or configured destination folder.
- Template and proposed title for new drafts.
- Proposed comment, append, or managed-section diff.
- Source URL and idempotency key.
- Validation result.

This should be the default mode in the reference implementation.

### Cross-System Linking

Safe outputs execute after the agent, so the agent cannot reliably know the URL
of a Discussion and Google Doc that are both created during the same safe-output
phase. Do not invent URLs or leave the two artifacts weakly linked.

Use one of these patterns:

1. **Preferred two-stage pattern:** create the draft Discussion first using the
   built-in safe output. A deterministic `workflow_run` dispatcher reads the
   completed safe-output artifact, creates the Google Doc with the Discussion
   URL as its source, then updates the Discussion with the final Doc URL.
2. **Existing coordination artifact:** create the Google Doc only when a draft
   Discussion or issue already exists, passing that known URL into the custom
   safe output.
3. **Compound domain-specific job:** for tightly controlled adopters, one
   custom safe-output job may create the Doc and GitHub coordination artifact
   together. This is convenient but duplicates built-in GitHub validation and
   is less suitable as the default reference pattern.

The repository already uses the first pattern for Slack post-back dispatchers,
so Google Docs should reuse it for the collaborative weekly-status loop.

### Audit and Failure Behavior

Each job should write a human-readable Actions summary containing:

- Requested and completed operation.
- Document title, ID, and URL.
- Configured scope and validation result.
- GitHub source URL and workflow-run URL.
- Idempotency result: created, updated, reused, skipped, or rejected.

Failures should be explicit and actionable. Missing credentials, inaccessible
documents, out-of-scope targets, revision conflicts, or invalid content should
fail the safe-output job without exposing secrets.

## Reference Implementation Package

To make this useful beyond this repository, ship the integration as a small
adaptable package rather than a one-off workflow:

```text
.github/workflows/shared/google-docs-safe-outputs.md
.github/scripts/google-docs/
  auth.mjs
  scope.mjs
  normalize-document.mjs
  validate-request.mjs
  write-comment.mjs
  append-update.mjs
  create-draft.mjs
google-docs-fixtures/
docs/google-docs-integration-plan.md
docs/google-docs-setup.md
```

The reference should include:

- One fixture-backed example requiring no Google credentials.
- One folder-scope setup example for personal Google accounts.
- One shared-drive setup example for Workspace accounts.
- A staged-mode example workflow.
- A two-stage draft Discussion to Google Doc dispatcher example.
- Configuration and least-privilege guidance.
- Failure examples showing out-of-scope targets, duplicates, revision
  conflicts, and missing credentials.
- Tests for scope validation, idempotency, operation limits, protected
  sections, and staged behavior.

Keep provider-specific API code in scripts and keep the shared safe-output file
focused on tool contracts, job permissions, environment access, and audit
summaries. This makes it easier for adopters to inspect and replace
authentication without weakening validation behavior.

## Weekly Status MVP Decisions

Before implementing the first collaborative status cycle, make these choices
explicit. They affect artifact ownership, authentication, dispatch behavior,
and what "published" means.

### 1. Draft and Final Discussion Semantics

Use one GitHub Discussion for the entire weekly lifecycle:

- Create it as `[Draft Status] Week of YYYY-MM-DD`.
- Include a visible draft banner and Google Doc shaping link.
- Keep the full agent-generated first draft in the Discussion for audit and
  fallback.
- After human finalization, update the same Discussion title and body to
  `[Weekly Status] Week of YYYY-MM-DD`.

The Google Doc is the temporary collaborative editing surface. The finalized
Discussion is the durable official report.

The implementation must enable the built-in `update-discussion` safe output or
use a deterministic finalization dispatcher with equivalent validation.

### 2. Do Not Report Back Drafts as Final

The current Slack report-back dispatcher posts the Weekly Status Discussion as
soon as the Weekly Status workflow succeeds. That behavior must change before
the draft cycle is enabled.

Recommended behavior:

- Draft creation sends a distinct shaping invitation, clearly labeled draft.
- The normal Weekly Status Slack report-back runs only after finalization.
- The finalization workflow or dispatcher sends the official status summary.

Do not reuse the existing final-report Slack message for the shaping
invitation.

### 3. Choose Authentication Before Building Creation

For a shared-folder deployment under a personal Google account, service
accounts cannot own newly created files. The first implementation therefore
needs an OAuth-authenticated automation user with a refresh token for draft
creation, or it must begin with read/comment/append operations only.

Decide and document:

- Which Google identity owns created drafts.
- Where the refresh token and client credentials live.
- Which GitHub environment protects those secrets.
- Which OAuth scopes are granted.
- How credentials are rotated and revoked.

Avoid sharing or permission-management APIs in the MVP. Create drafts inside a
folder whose inherited permissions already match the intended collaborators.

### 4. Define the Template and Conversion Boundary

The weekly draft needs a stable Google Doc template with named placeholders or
managed sections for:

- Lifecycle header.
- What Shipped.
- What We Learned.
- FYI.
- SOS.
- Portfolio Snapshot.
- Source links and open questions.

The agent-generated Discussion body is Markdown, while Google Docs uses a
structured document model. Decide which formatting is supported in each
direction before implementation.

Recommended MVP:

- Preserve headings, paragraphs, bullets, links, and one simple table.
- Convert supported Markdown links into native Google Docs hyperlinks after
  inserting safe-output text, and reject readback while literal Markdown links
  remain.
- Treat unsupported formatting as plain text.
- Do not attempt pixel-perfect Markdown-to-Docs round-tripping.
- Publish from a normalized Docs-to-Markdown conversion, then inspect the
  resulting Discussion body before updating it.

### 5. Human Finalization Signal

Use one explicit finalization trigger:

```text
/finalize-status
```

on the draft Discussion.

Also create one automation-owned document comment as a second explicit trigger:

```text
Resolve this comment when the status is ready to move to staged finalization.
Alternatively, comment /finalize-status on the source Discussion.
```

The Drive API can create and inspect resolvable comments, but API-created
anchors are treated as unanchored by Google Workspace editors. Keep the
visible status header in the document and use a document-level comment rather
than claiming it is reliably pinned to that header. The comment must explicitly
quote its target heading, such as `Weekly Status — Week of 2026-06-08`.

The finalization dispatcher should verify that the commenter is allowlisted,
the Discussion is still a draft, the linked document belongs to the configured
scope, and no final report is already recorded.

Do not use both labels and commands in the first implementation; one clear
trigger is easier to explain and secure.

### 6. Comment Resolution Policy

Do not block the MVP on all Google Doc comments being resolved. Human comments
may be conversational, stale, or unrelated to publication readiness.

Instead:

- The human finalizer owns the judgment that the report is ready.
- The workflow may warn when unresolved comments exist.
- Workflow-created blocking comments can use an explicit marker and prevent
  finalization until resolved or overridden.

### 7. Stable Lifecycle Identity

Use one lifecycle key across every artifact and dispatcher:

```text
weekly-status:YYYY-MM-DD
```

Store it in:

- Draft Discussion body.
- Google Doc lifecycle header.
- Safe-output request.
- Actions summaries.
- Finalization record.

Repeated draft-generation runs must reuse or update the existing draft rather
than create a second Discussion or Doc for the same week.

### 8. Failure and Recovery Rules

The lifecycle must remain understandable when only part of a multi-system
handoff succeeds:

| Failure | Expected state |
|---|---|
| Discussion created, Doc creation fails | Discussion remains draft and shows a configuration/failure note |
| Doc created, Discussion update fails | Dispatcher replay finds the lifecycle key and links the existing Doc |
| Shaping notification fails | Draft remains valid; failure is recorded and notification can retry |
| Finalization conversion fails | Discussion remains draft; Google Doc is unchanged |
| Final Discussion update succeeds, Slack fails | Discussion remains official; Slack report-back retries |

Never delete a Discussion or Doc automatically to compensate for partial
failure. Prefer visible state and idempotent retry.

### 9. Personal-Folder and Shared-Drive Compatibility

The reference implementation should exercise both scope modes, but the first
live demo should use the personal-account shared-folder path.

The adapter must isolate:

- Folder-tree membership verification for My Drive folders.
- `supportsAllDrives` and shared-drive search behavior.
- File ownership differences.

The collaboration workflow and safe-output contracts should remain identical
above that adapter layer.

### 10. MVP Cut

Keep the first implementation deliberately narrow:

1. Weekly Status creates one draft Discussion.
2. A deterministic dispatcher creates one Google Doc from one fixed template
   in one configured drafts folder.
3. The dispatcher updates the draft Discussion with the Doc link.
4. Humans edit the Doc.
5. An allowlisted human comments `/finalize-status`.
6. A deterministic finalizer reads the Doc and updates the same Discussion.
7. Existing Slack report-back runs only for the finalized Discussion.

Defer generic comments, append operations, managed sections, automated
expiration, and other workflows until this loop works reliably.

### Implementation Readiness Checklist

- [x] Decide the OAuth identity and GitHub environment used for Google writes.
- [x] Create the shared folder, drafts subfolder, and fixed weekly-status
  template.
- [x] Define supported Docs-to-Markdown and Markdown-to-Docs formatting.
- [x] Add a stable lifecycle marker to the draft Discussion and Doc template.
- [ ] Change Slack report-back so draft Weekly Status Discussions are not
  announced as final.
- [ ] Choose the allowlisted GitHub users permitted to finalize.
- [ ] Define behavior for reruns, partial failure, replay, and revision
  conflicts.
- [ ] Test the entire flow in staged mode before enabling Google writes.

The first staged dispatcher is implemented in:

```text
.github/workflows/google-docs-status-draft-dispatch.yml
```

It reads the Weekly Status Discussion safe-output artifact, converts the
Discussion body into deterministic template replacements, refreshes Google
credentials, validates the configured root/folders/template, and uploads a
plan artifact.

With `GOOGLE_DOCS_ENABLED=false`, it performs no Google or GitHub writes. With
`GOOGLE_DOCS_ENABLED=true`, it copies the configured template into Status
Drafts, records the lifecycle key in Drive `appProperties`, fills the known
placeholders, and verifies the resulting document through Docs API readback.
Replays reuse the lifecycle-marked draft. They complete an unfilled partial
copy but do not overwrite a filled draft that humans may have edited.

The staged finalization dispatcher is implemented in:

```text
.github/workflows/google-docs-status-finalization-staged.yml
```

It manually accepts a Weekly Status Discussion URL, resolves the single
lifecycle-linked draft inside the configured drafts folder, validates the Doc
contains the lifecycle and source markers, converts the publishable report to
Markdown, and uploads the exact proposed Discussion body. It has read-only
GitHub permissions and performs no Google or GitHub writes.

The staged Docs-to-Markdown boundary supports headings, paragraphs, bullets,
native hyperlinks, bold text, horizontal rules, and simple tables. Conversion
starts at the `Weekly Status` heading so lifecycle metadata and shaping
instructions are not published. It can be invoked manually or by an allowlisted
human posting exactly `/finalize-status` on the source Discussion. The slash
command path remains staged and performs no writes.

The dispatcher fails closed when the source run has no `create_discussion`
safe-output item. Manual staged validation may instead provide an explicit
Discussion URL; the dispatcher resolves its number against the current
repository rather than trusting an arbitrary URL.

## Google-Side Setup

The first live status-cycle demo uses a shared folder in a personal Google
account. That requires OAuth acting as the human account that owns the folder
and created drafts.

### 1. Create a Dedicated Google Cloud Project

Create a project specifically for the integration, such as:

```text
agentics-beyond-code-google-docs
```

Do not reuse an unrelated production project. A dedicated project makes API
usage, OAuth credentials, revocation, and future verification easier to reason
about.

### 2. Enable APIs

Enable:

- Google Drive API: `drive.googleapis.com`
- Google Docs API: `docs.googleapis.com`

The Drive API manages file metadata, folders, copies, and comments. The Docs
API reads document structure and applies content updates.

No Drive UI integration or Google Workspace Marketplace listing is required
for this server-side workflow.

### 3. Configure Google Auth Platform

Configure the OAuth consent screen:

- App name: `Agentics Beyond Code`
- Audience: External, because a personal Google account cannot use an
  organization-internal app.
- Add the Google account that owns the shared folder as a test user while
  developing.
- Add only the scopes required by the implementation.

Important: an External OAuth app in **Testing** status issues refresh tokens
that expire after seven days when requesting Drive or Docs access. That is fine
for initial experiments but unsuitable for a scheduled weekly workflow. Before
relying on the integration, move the app out of Testing and understand any
verification or unverified-app limits that apply to the selected scopes.

### 4. Create an OAuth Client

Create an OAuth 2.0 client ID for a **Desktop app** for the first local
authorization flow. The one-time local setup script will:

1. Open the Google authorization URL.
2. Request offline access.
3. Let the folder-owning Google account consent.
4. Exchange the authorization code for a refresh token.

Requesting `access_type=offline` is required so GitHub Actions can obtain fresh
access tokens without a human present.

Store:

- OAuth client ID.
- OAuth client secret.
- Refresh token.

Do not store short-lived access tokens.

Generate the initial refresh token locally with the repository helper:

```bash
node .github/scripts/google-oauth-authorize.mjs \
  ~/Downloads/client_secret_<client-id>.apps.googleusercontent.com.json
```

The helper opens the consent page and writes the three credential values to
`/private/tmp/agentics-google-docs-secrets.env` with mode `600`. It does not
print credential values or copy the OAuth client JSON into the repository.

### 5. Choose OAuth Scopes

Use the narrowest scopes that work with the chosen folder and creation model.

The initial live-demo authorization evaluated:

```text
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/documents
```

`drive.file` is Google's recommended narrower Drive scope, but its per-file
access semantics do not grant this non-Picker workflow access to the
pre-existing configured folders or template. The June 8, 2026 credential check
returned `404` for the root folder, all three child folders, and the template
through Drive API metadata reads, while the Docs API could read the template.

The live configured-folder demo therefore uses:

```text
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/documents
```

The broader Drive scope is constrained by adapter policy: every read and write
must verify membership in `GOOGLE_DOCS_SCOPE_ROOT_ID`, and agents never receive
an unrestricted Drive API tool.

Do not silently upgrade scopes. Document the reason, update the consent-screen
configuration, and re-authorize the account whenever scopes change.

The MVP does not need:

- Gmail, Calendar, Sheets, or Slides scopes.
- Domain-wide delegation.
- Permission-management or sharing changes.
- Full-drive search.

### 6. Create the Google Drive Folder Structure

In the authorizing user's My Drive, create:

```text
Agentics Beyond Code Demo/
  Templates/
  Status Drafts/
  Archive/
```

Share the root folder with the human collaborators who should shape drafts.
Child files and folders inherit parent permissions, so the workflow should not
manage collaborators on each draft.

Create the weekly status template inside `Templates/`. Record:

- Root folder ID.
- Status Drafts folder ID.
- Archive folder ID.
- Template document ID.

Use the Status Drafts folder as `GOOGLE_DOCS_DRAFTS_FOLDER_ID`. All
workflow-created drafts must stay inside the configured root folder tree.

#### Live Demo Folder Configuration

Verified through Google Drive connector readback on June 8, 2026:

```text
GOOGLE_DOCS_SCOPE_TYPE=folder
GOOGLE_DOCS_SCOPE_ROOT_ID=1FZ4zC04StZd9EmnokNmHQ9rNXsvb5iVl
GOOGLE_DOCS_DRAFTS_FOLDER_ID=1uDyGQlVzKWCO0qbUF76ciJm5j1q4HnGM
GOOGLE_DOCS_ARCHIVE_FOLDER_ID=1RzvT7WvQQF5nhXZAVPc08aW3vaZPpGiq
GOOGLE_DOCS_DRAFT_TEMPLATE_ID=1SVC2K4q1A1YDeANWxuUedxXsanr9A9YCOY6cV2UivBI
```

The template is stored under the verified Templates folder:

```text
GOOGLE_DOCS_TEMPLATES_FOLDER_ID=1Hob0CcrTW60T4C9MmzF9OyWh96EYYgKh
```

### 7. Create the Weekly Status Template

The template should contain stable markers that the adapter can find without
depending on paragraph indexes:

```text
Agentics Lifecycle
Lifecycle key: {{LIFECYCLE_KEY}}
Status: Needs team shaping
Owner: {{OWNER}}
Review by: {{REVIEW_DEADLINE}}
Discussion: {{GITHUB_SOURCE_URL}}

What Shipped
{{WHAT_SHIPPED}}

What We Learned
{{WHAT_WE_LEARNED}}

FYI
{{FYI}}

SOS
{{SOS}}

Portfolio Snapshot
{{PORTFOLIO_SNAPSHOT}}
```

The adapter copies the template, replaces placeholders, and then verifies no
required placeholders remain.

### 8. Store GitHub Environment Secrets and Variables

Create a protected GitHub environment:

```text
google-docs-demo
```

The live demo environment was created and populated on June 8, 2026. It uses
the OAuth identity that owns the configured My Drive folder. Keep
`GOOGLE_DOCS_ENABLED=false` until the staged draft dispatcher passes its
end-to-end checks.

Store environment secrets:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`

Store repository or environment variables:

- `GOOGLE_DOCS_ENABLED=true`
- `GOOGLE_DOCS_SCOPE_TYPE=folder`
- `GOOGLE_DOCS_SCOPE_ROOT_ID`
- `GOOGLE_DOCS_DRAFTS_FOLDER_ID`
- `GOOGLE_DOCS_ARCHIVE_FOLDER_ID`
- `GOOGLE_DOCS_DRAFT_TEMPLATE_ID`
- `GOOGLE_DOCS_DRAFT_TITLE_PREFIX=[Status Draft]`
- `GOOGLE_DOCS_FINALIZER_LOGINS`

The workflow should fail closed when required configuration is absent.

### 9. Verify Before Workflow Integration

Run a deterministic credential and scope check before connecting Weekly Status:

1. Refresh an access token.
2. Read metadata for the configured root, drafts folder, and template.
3. Verify the drafts folder and template are descendants of the configured
   root.
4. Copy the template into Status Drafts.
5. Replace a test placeholder.
6. Read the created document back.
7. Move the test document to Archive or delete it manually.

Do not enable the status dispatcher until this check passes using the same
credentials and scopes that GitHub Actions will use.

### Shared-Drive Differences

For Workspace adopters using a shared drive:

- A service account may be used if it is added to the shared drive with the
  required role.
- The app must use shared-drive-aware Drive API parameters such as
  `supportsAllDrives=true`.
- Files are owned by the shared drive rather than an individual user.
- `GOOGLE_DOCS_SCOPE_TYPE=shared_drive` and the root ID is the shared-drive ID.

The higher-level safe-output contracts and weekly-status lifecycle remain the
same.

## Custom Safe Output Contracts

Add a reusable shared component:

```text
.github/workflows/shared/google-docs-safe-outputs.md
```

### `google_docs_add_comment`

The first tool exposed to the agent should be:

```json
{
  "type": "google_docs_add_comment",
  "document_id": "1FAKE...",
  "comment": "Decision readiness review: the customer requirement and current security approval are in tension. Full analysis: https://github.com/owner/repo/discussions/123",
  "github_source_url": "https://github.com/owner/repo/discussions/123",
  "idempotency_key": "decision-context:audit-export:2026-06-08"
}
```

This operation creates one unanchored Drive comment on an allowlisted Google
Doc.

### `google_docs_append_update`

The first content-mutating tool should be:

```json
{
  "type": "google_docs_append_update",
  "document_id": "1FAKE...",
  "heading": "Agentics Update - 2026-06-08",
  "body": "Short validated update...",
  "github_source_url": "https://github.com/owner/repo/discussions/123",
  "idempotency_key": "weekly-status:2026-06-08"
}
```

### Required Validation

- `document_id` must be in `GOOGLE_DOCS_WRITABLE_DOCUMENT_IDS`.
- The document must still belong to the configured folder tree or shared
  drive.
- `github_source_url` must be a URL for the current repository.
- The comment or body must include the GitHub source URL.
- Comment, heading, and body fields must be non-empty and length-limited as
  appropriate for the requested operation.
- Maximum two Google Docs writes per run across comments and appends.
- Reject duplicate `idempotency_key` markers already present in the document
  or in existing automation comments.
- Append only to documents explicitly configured for append updates; no
  arbitrary index-based insertions or replacements.
- Record document title, document URL, source URL, and update result in the
  Actions step summary.
- Respect `GH_AW_SAFE_OUTPUTS_STAGED`; preview writes before enabling them.
- Fail closed when credentials, allowlists, or document verification are
  missing.

### Later Safe Outputs

Only add these after comments and append-only updates are proven:

- `google_docs_replace_managed_section`: replace content only between explicit
  automation-owned markers, with revision checks.
- `google_docs_create_from_template`: create a document only in a dedicated
  output folder from an allowlisted template, with a strict title pattern,
  source link, and lifecycle metadata.

Do not add arbitrary full-document replacement.

## Workflow Candidates

| Workflow | Google Docs read | Google Docs write |
|---|---|---|
| Decision Readiness Verifier | Product briefs, customer evidence, policy drafts | Add a review comment to a decision brief |
| Launch Readiness | Launch plan, customer commitments, rollout notes | Append readiness update to launch plan |
| Weekly Status | Cross-functional program notes | Append concise update to weekly program brief |
| Strategy Alignment | External strategy and planning docs | No write in MVP |
| Compliance Review | Policy drafts and control narratives | Add a review comment; no content write in MVP |

The first end-to-end workflow should be **Decision Context Pack** because it
shows the value of external context clearly and can begin read-only. A review
comment on the Product Council brief should be the first real write. Launch
Plan Report-Back should be the first content-mutating write demonstration.

## Phased Rollout

### Phase 0: Fixtures and Planning

- Add the fake Google Docs scope corpus and manifest.
- Define the source-of-truth and safe-output boundaries.
- Use fixture documents in manual workflow experiments.

### Phase 1: Fixture-Backed Decision Context Workflow

- Add a workflow that reads `google-docs-fixtures/`.
- Compare the decision question against the fake external documents and GitHub
  state.
- Produce a GitHub issue comment or discussion with citations.
- Add duplicate detection based on document IDs and source URLs.

### Phase 2: Real Read-Only Google Docs Scope

- Create a dedicated shared folder or shared drive for the demo.
- Upload or recreate the fixture corpus as Google Docs.
- Add the deterministic fetch adapter and authentication.
- Restrict reads to explicit document IDs.
- Verify both folder-scope and shared-drive-scope lookup paths.
- Verify normalized output against fixture snapshots.

### Phase 3: Staged Google Docs Safe Outputs

- Implement `shared/google-docs-safe-outputs.md`.
- Enable `google_docs_add_comment` and `google_docs_append_update`.
- Run in staged mode and inspect Actions summaries.
- Test allowlist rejection, duplicate markers, missing credentials, body
  limits, and out-of-scope targets.

### Phase 4: Live Comments and Append-Only Updates

- Enable comments on the Product Council Decision Brief.
- Enable appends to the Audit Export Launch Plan and Weekly Program Brief only.
- Require GitHub source links and preserve idempotency markers.
- Keep a low maximum update count and review every early run.

### Phase 5: Carefully Expanded Operations

- Evaluate automation-owned managed sections and template-based document
  creation.
- Evaluate read-only MCP search within the configured folder or shared drive.
- Add more workflows only when each target document has a clear owner and
  update contract.

## Risks and Guardrails

- Google Docs often contain sensitive or broadly shared information. Use a
  dedicated demo folder or drive first and explicit allowlists in production.
- Document text is untrusted input. Treat it as context, not instructions, and
  preserve the workflow's prompt-injection defenses.
- Google Docs indexes change as people edit. Start with append-only writes and
  use revision checks for any future targeted replacement.
- Drive permissions may expose documents to different audiences than GitHub.
  Avoid copying full documents into GitHub; cite and summarize only what the
  workflow needs.
- Title matching is ambiguous. Use stable document IDs for both reads and
  writes.
- A service account or automation user with broad Drive access would create
  unnecessary risk. Grant access only to the configured folder or shared drive.

## Success Criteria

- A fixture-backed workflow can answer the Audit Export retention decision
  using at least three Google Docs sources and cite them by stable ID and URL.
- A real read-only run fetches only allowlisted documents from the demo shared
  drive and exposes no credentials to the agent.
- A staged safe-output run shows the exact append that would be made.
- A live review comment links the Product Council brief to the full GitHub
  decision-context artifact without altering document content.
- A live safe-output run appends one source-linked, idempotent update to an
  allowlisted document and rejects a non-allowlisted target.
- Every read and write is attributable to a workflow run and visible in GitHub
  Actions history.
