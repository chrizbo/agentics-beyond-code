# Release Blog Pipeline Spec

This spec describes a reusable go-to-market workflow set. It takes something the
team built, as recorded in an initiative, its launches, the PRs merged over
time, and the decisions that changed course along the way, and turns it into a
published release blog post. Humans approve the brief and the draft, and
marketers can do every approval from Slack and Google Docs without opening
GitHub.

> **Status:** in progress. See [Build Status](#build-status).

It is the demo pipeline for the AI for Marketers Summit (Feb 23–25, 2027). The
talk promises three things, and each stage below maps to one of them:

1. **Structured briefs** that keep AI drafts in brand voice and inside
   guardrails.
2. **Approval gates** that keep humans in the loop without slowing cycle time.
3. **A governed, reusable pipeline** instead of a one-off AI workflow.

## Problem

Taking one piece of content from idea to publish usually means four tools: a
doc for the brief, an AI tool for the draft, Slack threads for approval, and
another platform to ship it. Release posts have an extra problem. The real
story is spread across an initiative that changed scope, dozens of PRs, and
decisions nobody wrote down in marketing terms. Today the "Release notes
compilation" step is manual work Priya does before each GA launch (see
[how-we-work.md](how-we-work.md)).

## What Already Exists

| Piece | Role in this pipeline |
|---|---|
| [`gtm-content.md`](../.github/workflows/gtm-content.md) | Its `[GTM] Changelog draft` sub-issue seeds the post |
| [`decision-log.md`](../.github/workflows/decision-log.md) | `decisions/*.md` explain *why* the initiative changed |
| [`compliance-review.md`](../.github/workflows/compliance-review.md) | Its `approved:*` labels are publish preconditions |
| [`voice-and-tone-policy.md`](../.github/policies/voice-and-tone-policy.md) | Voice rules, extended with a blog section |
| [`fetch-launch-data.sh`](../.github/scripts/fetch-launch-data.sh) | Walks Initiative → Launch → Epic → Task; extended to add PRs and history |
| Google Docs status pipeline ([plan](google-docs-integration-plan.md), `.github/scripts/google-docs/status-*.mjs`) | Draft → Doc shaping → resolved-comment gate → convert; generalized to a `blog` kind |
| Slack dispatch pattern (`slack-*-dispatch.yml`, [`shared/slack-safe-outputs.md`](../.github/workflows/shared/slack-safe-outputs.md)) | Slack postbacks and Slack-originated approvals |

**Gaps this spec fills:**
- PRs are not linked to initiatives anywhere.
- No workflow reads how an initiative changed over time.
- There is no blog policy, brief template, blog folder, or rendered blog page.

## Pipeline

```
Marketer files "Release blog brief" issue (or from Slack)
        │
        ▼
(1) blog-brief-builder ── evidence-backed brief ──► Slack thread
        │   GATE 1: /approve-brief  or  Slack approval → label approved:brief
        ▼
(2) blog-draft-writer ── Google Doc draft + Evidence appendix ──► Slack thread
        │   GATE 2: resolve "Ready to publish" Doc comment, /finalize-post, or Slack approval
        ▼
(3) blog-post-publisher ── convert → guardrail check → render HTML ──► PR (blog/** only) ──► Slack thread
        │   GATE 3: PR review by brief owner; merge = publish
        ▼
blog-pages-deploy ── GitHub Pages URL ──► Slack thread
```

GitHub labels and slash commands are the **canonical gate state**. Slack and
Doc-comment approvals are other ways in, and each one maps onto the same label
transition, so the audit trail always lives on the brief issue.

### Stage 0 — Brief intake

- **Template:** `.github/ISSUE_TEMPLATE/release-blog-brief.yml`, which applies
  the label `blog-brief`.
- **Fields:**
  - Initiative or launch link (required)
  - Audience
  - The one key message
  - Proof points wanted
  - Call to action
  - Claims to avoid / legal notes
  - Target publish date
  - Owner (becomes the Gate 3 reviewer)
- **Slack entry:** an allowlisted user can start a brief from a Slack message.
  This follows the `slack-reaction-intake` pattern and creates the same
  template-shaped issue.

### Stage 1 — `blog-brief-builder` (gh-aw)

- **Trigger:** `issues.labeled: blog-brief`, or `workflow_dispatch` with
  `issue_number`.
- **Pre-step:** `.github/scripts/blog/fetch-initiative-evidence.mjs <issue>`
  writes `initiative-evidence.json` with:
  - the full sub-issue tree (and, for a launch, its parent initiative)
  - merged PRs that close or cross-reference any issue in the tree
    (`closingIssuesReferences` and timeline `CrossReferencedEvent`), with
    title, merge date, and body summary
  - initiative and launch body edit history (`userContentEdits`), comments on
    the initiative and launch, and tasks closed as not planned
  - `decisions/*.md` files that reference the issues in the tree
  - the latest `[GTM] Changelog draft` for the launch
  - `approved:*` / `ai:needs:*` labels on the launch
- **Output:** one comment on the brief, replaced in place on rerun. It contains:
  - **Narrative arc:** the problem, what we built, how it changed and why
    (timeline).
  - **Claims table:** every candidate claim with its evidence link (PR, issue,
    or decision). Claims without evidence are marked `⚠ unsupported`.
  - **Guardrails:** "claims to avoid" from the brief, compliance approval
    status, banned words from the policy.
  - **Suggested headline and two or three angles** for the stated audience.
- **Labels:** adds `ai:needs:brief-approval`.
- **Slack:** posts a summary and the brief link to a new thread for the brief
  and records the thread id on the issue.
- **Safe outputs:** `add-comment`, `update-issue` (for a hidden state block),
  `add-labels`, and the Slack postback job.

### Gate 1 — Brief approval

- **On GitHub:** a `/approve-brief` comment from an allowlisted user.
- **In Slack:** an approve reaction or reply in the brief thread from an
  allowlisted user. A dispatch workflow (`slack-blog-gate-dispatch.yml`)
  checks the Slack user against the allowlist and applies the same transition.
- **Transition:** remove `ai:needs:brief-approval`, add `approved:brief`, and
  record who approved, where, and when in the brief's state block.
- A request for changes reruns Stage 1 with the requested edits as input.

### Stage 2 — `blog-draft-writer`

- **Trigger:** `issues.labeled: approved:brief`.
- Drafts the post under [`blog-post-policy.md`](../.github/policies/blog-post-policy.md)
  and the voice-and-tone policy, using only claims from the approved brief.
- Writes a Google Doc using the generalized collaboration-draft contract:
  - `status-draft-plan.mjs` and `status-draft-write.mjs` become
    kind-parameterized (`status` | `blog`) without changing `status` behavior.
  - The blog kind adds a managed **Evidence** appendix that maps each claim to
    its source.
  - It also adds an agent comment, "Resolve this comment to approve for
    publish."
- Links the Doc on the brief, adds `ai:needs:draft-approval`, and posts the Doc
  link to the Slack thread.

### Gate 2 — Draft approval

- **Signals:** any one of these approves the draft:
  - resolving the agent's Doc comment (reuses
    `status-finalization-resolved-gates`)
  - `/finalize-post` on the brief
  - Slack approval in the thread
- **Transition:** `ai:needs:draft-approval` → `approved:draft`.

### Stage 3 — `blog-post-publisher`

- **Trigger:** `issues.labeled: approved:draft`.
- **Deterministic pre-steps:**
  1. Convert the Doc to markdown (reuses `status-finalization-convert`).
  2. Guardrail check (`.github/scripts/blog/check-guardrails.mjs`). It fails
     with a brief comment and a Slack note if any of these are true:
     - banned words are present
     - a claim in the body is no longer traceable to the Evidence appendix
     - the launch is missing required `approved:*` compliance labels
     - "claims to avoid" text appears
  3. Render (`.github/scripts/blog/render-blog.mjs`):
     `blog/posts/<date>-<slug>.md` → `blog/<slug>/index.html` through
     `blog/_template.html` and `blog/blog.css`, and regenerate
     `blog/index.html`.
- **Agent step:** writes the PR description. It summarizes the post, lists the
  evidence and approvals, and links the brief.
- **Safe output:** `create-pull-request` with `allowed-files: [blog/**]`, title
  prefix `[Blog]`, reviewer = brief owner.
- Posts the PR link to the Slack thread.

### Gate 3 and publish

- PR review by the brief owner. Merging is the publish action.
- `blog-pages-deploy.yml` (plain Actions) deploys `blog/` to GitHub Pages on
  pushes to `main` under `blog/**`, then posts the live URL to the Slack thread
  and closes the brief.

### Reporting

Extend [`gtm-team-reports.md`](../.github/workflows/gtm-team-reports.md) with a
**Release posts** section. It lists open briefs, the gate each one is waiting
on, how long it has waited, and median brief → publish time. This gives the
talk its cycle-time number.

## Content Pipeline Board

[Content Pipeline](https://github.com/users/chrizbo/projects/4) (user project
#4, linked to this repo, stored in the repository variable `CONTENT_PROJECT_NUMBER`)
gives marketers one view of every piece of content from brief to publish. It is
separate from the Launch Tracker: the Launch Tracker tracks what is being
built, and this board tracks what is being said about it.

Gate labels on the brief issue are the source of truth. Each workflow that
changes a gate label also moves the card (`update-project` safe output) and
resets **Waiting since**. Nobody moves cards by hand.

| Status | Label state | Moved by |
|---|---|---|
| Brief | `blog-brief` | Auto-add (manual setup below) or `blog-brief-builder` |
| Brief review | `ai:needs:brief-approval` | `blog-brief-builder` |
| Drafting | `approved:brief` | Gate 1 dispatch |
| Draft review | `ai:needs:draft-approval` | `blog-draft-writer` |
| PR review | `approved:draft` | Gate 2 dispatch / `blog-post-publisher` |
| Published | brief closed | `blog-pages-deploy`, which also fills Published URL |

| Field | Type | Notes |
|---|---|---|
| Status | Single select | The six stages above |
| Content type | Single select | Release post, Changelog, Case study, Launch email. A new type reuses the board with its own policy |
| Launch | Text | The launch the content is about (`#NN`) |
| Target publish date | Date | From the brief |
| Published URL | Text | Filled after the Pages deploy |
| Waiting since | Date | Set on every status change; drives the cycle-time report |
| Assignees | Built in | The brief owner |

Views: **Pipeline** (board), **Waiting on humans** (table filtered to the
three review stages), **Publish calendar** (roadmap), and **Published**
(table).

The labels `blog-brief`, `ai:needs:brief-approval`, `approved:brief`,
`ai:needs:draft-approval`, and `approved:draft` exist in the repo.

**Manual setup (no API exists for these):**
1. In **Workflows**, enable *Auto-add to project* for
   `repo:chrizbo/agentics-beyond-code is:issue label:blog-brief`, and set
   *Item added to project* to Status = Brief.
2. Also in **Workflows**, enable *Item closed* → Published, as a backstop.
3. **Pipeline** view: group by Status (columns), and sort by Waiting since.
4. **Waiting on humans** view: sort by Waiting since, ascending.
5. **Publish calendar** view: set the date fields to Target publish date.
6. Delete the default **View 1**.

## New Files

| Path | Kind |
|---|---|
| `.github/ISSUE_TEMPLATE/release-blog-brief.yml` | Issue template |
| `.github/policies/blog-post-policy.md` | Policy (plus a short pointer section in `voice-and-tone-policy.md`) |
| `.github/scripts/blog/fetch-initiative-evidence.mjs`, `initiative-evidence.mjs` (+ test) | Deterministic fetch ✅ |
| `release-story-fixtures/usage-insights.json`, `.github/scripts/release-story/` (+ test), `.github/workflows/release-story-seed.yml` | Demo data seeding ✅ |
| `.github/scripts/blog/check-guardrails.mjs` (+ test) | Deterministic check |
| `.github/scripts/blog/render-blog.mjs` (+ test) | Deterministic render |
| `.github/workflows/blog-brief-builder.md` | gh-aw |
| `.github/workflows/blog-draft-writer.md` | gh-aw |
| `.github/workflows/blog-post-publisher.md` | gh-aw |
| `.github/workflows/blog-gate-dispatch.yml` | Actions: `/approve-brief`, `/finalize-post` |
| `.github/workflows/slack-blog-gate-dispatch.yml` | Actions: Slack approvals |
| `.github/workflows/blog-pages-deploy.yml` | Actions: Pages deploy |
| `blog/_template.html`, `blog/blog.css`, `blog/index.html` | Blog shell |
| `docs/marketers-summit-demo-script.md` | Talk walkthrough |

## Demo Fixtures

The gh-aw safe outputs can't merge PRs, so demo data comes from a
deterministic seeder rather than a `sample-data-launch-creator` mode.
[`release-story-fixtures/usage-insights.json`](../release-story-fixtures/usage-insights.json)
defines the story, and
[`release-story-seed.yml`](../.github/workflows/release-story-seed.yml) applies
it one stage at a time:

| Stage | What happens |
|---|---|
| `1-structure` | Initiative "Self-Serve Usage Insights", launch "Usage Insights Dashboard", 3 epics, 7 tasks, Phase = Team |
| `2-pipeline` | Two PRs merged (aggregation, 13-month retention), Phase = Alpha |
| `3-scope-change` | Alpha readout comment, initiative body edited to swap the live per-minute chart for daily rollups, live-chart task closed as not planned, replacement task created, decision record merged |
| `4-dashboard` | Daily rollup charts and accessible charts merged, Phase = Beta |
| `5-export-alerts` | CSV export and threshold alerts merged, beta results comment with a customer quote |
| `6-ga` | Help article merged, Phase = GA |

Run stages a week or so apart between now and the talk, so merge dates,
edits, and comments carry real timestamps. Every stage is idempotent: issues
are matched by title, PRs by branch, and comments by a hidden marker. Dry run
is the default.

```bash
node .github/scripts/release-story/seed-release-story.mjs release-story-fixtures/usage-insights.json status
```

```bash
node .github/scripts/release-story/seed-release-story.mjs release-story-fixtures/usage-insights.json 1-structure --apply
```

The seeder uses `AW_TOKEN` in Actions so it can set the Launch Tracker phase.
Set the repository variable `RELEASE_STORY_ADMIN_MERGE=true` if branch
protection would block its merges.

## Demo Approach

The demo is **pre-baked, not run live.** Run the full pipeline once against the
demo initiative ahead of time and keep every real artifact: the brief issue,
brief comment, Slack thread, Doc, PR, and rendered page.

[`marketers-summit-demo-script.md`](marketers-summit-demo-script.md) walks
through screenshots in `docs/assets/marketers-summit/` scene by scene: brief →
evidence → Gate 1 → draft → Gate 2 → PR → published page. Each scene links to
the real artifact.

An optional live moment is one deterministic step that takes seconds, such as
the guardrail check flagging an unsupported claim or the HTML render.

## Reuse

The pipeline is driven by a template, a policy, and three gh-aw workflows.
Another team adopts it by copying those and editing the policy. After the
build, add a "Release content pipeline" pattern to the `agentic-workflow-planner`
design catalog and to the `github-workflow-builder` assets, then run
`.github/scripts/sync-agent-skills.sh --check`.

## Build Status

| Step | Status |
|---|---|
| Spec | ✅ |
| Demo release story and seeder | ✅ built; stages not yet applied |
| Evidence fetch | ✅ built; tested against launch #3 |
| Content Pipeline board (#4), gate labels, `CONTENT_PROJECT_NUMBER` | ✅ created; manual view and automation setup pending |
| Brief template, blog policy, `blog-brief-builder`, Gate 1 | ⏳ |
| Docs draft generalization, `blog-draft-writer`, Gate 2 | ⏳ |
| Guardrail check, renderer, blog shell, publisher, Pages deploy | ⏳ |
| Slack postbacks and Slack gates | ⏳ |
| Reporting, capture run, demo script | ⏳ |

## Build Order

1. This spec.
2. Demo release story seeder and `fetch-initiative-evidence.mjs`.
3. Brief template, blog policy, `blog-brief-builder`, and the Gate 1
   dispatches.
4. Generalize the Docs draft scripts and add `blog-draft-writer` and the Gate 2
   dispatches.
5. Guardrail check, renderer, blog shell, `blog-post-publisher`, and Pages
   deploy.
6. Slack postbacks for every stage, and Slack gate dispatch.
7. `gtm-team-reports` extension, then the capture run, screenshots, and demo
   script.

## Verification

- `node --test .github/scripts/google-docs/*.test.mjs .github/scripts/blog/*.test.mjs .github/scripts/release-story/*.test.mjs`:
  existing status tests are unchanged, and the blog-kind, guardrail, and render
  tests pass.
- `gh aw compile` is clean.
- Dispatching against the demo initiative produces:
  - a brief comment with linked PRs and the timeline
  - a Doc draft
  - a PR touching only `blog/**`
  - a rendered page
- **Negative cases:**
  - an unsupported claim is flagged
  - missing compliance approvals block the publisher
  - a non-allowlisted `/approve-brief` or Slack approval is ignored
- After the merge, the Pages deploy serves the post and the Slack thread gets
  the URL.

## Open Questions

- Which Slack approval gesture to use: an emoji reaction (matches the
  `slack-reaction-intake` pattern) or an explicit reply keyword.
- Whether Gate 3 can also be approved from Slack for marketers, or whether PR
  review stays the one GitHub step, done by the brief owner.
- Engine and model for the three agents. The default is to match
  `gtm-content.md`.
