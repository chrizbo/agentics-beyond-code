# Design Mode

Use this reference when the planner turns a team's plain-language problems
into a small, operable set of agentic workflows, and the living documents
those workflows need. This step is the same on every platform. The design
is finished before choosing where it runs, and a platform builder then
implements it.

Steal aggressively from this repo's existing workflows, but never copy its
fictional sample content into a real team's setup.

## Intake

If the user has already described the problem, proceed. Ask at most two
focused questions, and only when the answer changes the design.

Useful inputs:

- team type: product, platform, compliance, GTM, leadership portfolio, product
  ops, design, research, support, customer success, program management,
  operations
- process pain: stale docs, launch risk, slow triage, missing decisions,
  compliance churn, unclear strategy, meeting follow-up, stakeholder reporting
- the recurring process today and its manual steps
- which steps need judgment (dedupe, scoring, drafting) and which are
  mechanical (parsing, idempotency checks, formatting)
- what triggers each step in real life: a cadence ("every Friday"), an event
  ("when someone files feedback"), or a human action ("when the PM approves")
- where the team already looks for this kind of thing: GitHub, Slack, email,
  Jira, Linear, Notion, Confluence, Google Workspace, Microsoft 365,
  Salesforce, ServiceNow, Asana, Productboard, or a spreadsheet
- desired output: report, comment, new work item, doc update, decision record,
  checklist, leadership brief
- automation posture: observe only, suggest changes, or create work items
- who owns the automation once it runs, and who can turn it off

## Keep architecture choices stable

Choose the intake record, review artifact, and committed work destination
separately. A tool being mentioned does not establish that it owns all three.
Use this order: the user's explicit destination and automation posture; the
existing system of record for that artifact; then the smallest draft that fits
the known process. Connector availability determines whether the plan can run,
not which system should own the records. When the evidence leaves a tie, state
one provisional choice and the assumption that decides it. Ask only if the
missing choice changes the design; otherwise keep the destination configurable.
Do not introduce a new log or duplicate tracker merely because access is missing.

Distinguish raw intake, triaged feedback, proposed work, and approved work.
For example, when Notion holds customer feedback and Asana holds approved work,
retain feedback and review in Notion and create Asana work only after the stated
human gate, unless the user explicitly requests Asana drafts as the review
surface. A request for a shorter answer does not change this architecture.
Revise the chosen path only when new evidence, a user instruction, or a concrete
capability constraint warrants it; explain the reason for the change.

In the handoff, name the intake source, system of record, review artifact and
destination, approval action, committed work destination, manual steps, and
unverified operations. Keep unknowns explicit rather than filling them from a
tool's typical use. Builders preserve this contract and describe any necessary
substitution before treating it as the implementation path.

## Pain point to workflow map

Prefer workflows that already exist in `.github/workflows/` over new designs.
List the directory rather than relying on this table when the catalog may
have changed.

| Problem | Recommended workflow(s) | Supporting artifacts |
|---|---|---|
| Strategy is vague or work drifts from priorities | `strategy-alignment.md`, optionally `adversarial-pm.md` | strategy doc, decision records |
| Decisions are lost in comments or meetings | `decision-log.md`, `transcript-processor.md` | decision records, transcripts |
| Team process docs are stale | `process-analyzer.md` | how-we-work doc, transcripts |
| Launch status is hard to see | `launch-readiness.md`, `weekly-status.md` | launch template, launch tracker, launch readiness policy |
| Compliance reviews are slow or inconsistent | `compliance-review.md`, `compliance-team-reports.md` | security/privacy/accessibility/responsible AI policies |
| GTM work is forgotten late in launch | `gtm-content.md`, `gtm-team-reports.md` | voice and tone policy, launch structure |
| Release posts are assembled by hand from scattered PRs, scope changes, and decisions | `gtm-content.md` today; the release blog pipeline in `docs/release-blog-pipeline.md` (in progress: the brief template, `blog-post-policy.md`, `blog-brief-builder.md`, and the `/approve-brief` gate exist; drafting and publishing do not yet) | brief template, voice and tone policy, decision records, initiative → launch → task structure with PRs that close tasks, a reviewed destination for the post |
| Incoming requests are messy | `intake-triage.md` | intake template, strategy doc |
| Standups are unfocused | `daily-standup-prep.md` | how-we-work doc, work tracker data |
| Leaders need different views of the same work | `leadership-brief.md`, `weekly-status.md` | leadership brief and weekly status policies |
| Customer feedback piles up without themes | `feedback-dedupe-triage.md`, `friday-feedback-trends-report.md` | feedback source, trends report destination |
| Product assumptions go untested | `assumption-surfacer.md` | product briefs or specs |
| Workflow reliability and costs need monitoring | `workflow-health.md` | workflow run logs |
| Slack holds decisions, blockers, commitments, or requests | `slack-context-processor.md`, `slack-reaction-intake.md` | `docs/slack-integration-plan.md`, allowed channel map |

For problems the table does not cover, check `docs/workflow-ideas.md` before
designing something new. Say plainly when a design is new rather than a port.

## Living documents come first

Strategy and how-we-work docs are what the workflows reason over. Recommend
them before complex automation, wherever the team keeps documents.

A strategy doc invites the owner to state tradeoffs as "X, even over Y" and
has empty alignment-evidence sections that a strategy workflow can update.

A how-we-work doc has blank sections for team, meeting cadence, ritual
cadence table, triage, decision-making, review process, communication norms,
automation and tooling, and manual processes that are candidates for
automation.

Blank templates for both live in
`../github-workflow-builder/assets/blank-repo/docs/`. They are plain Markdown
and work on any platform.

## Design principles

- **Artifacts over silent actions.** Every workflow produces something a human
  can read and act on: a report, a drafted item, a comment, a decision record.
- **An explicit human gate.** Put it where the team already reacts (a thread, a
  doc comment, a status column). Only an explicit human action should turn
  output into committed work, spend money, or send anything outside the
  team's draft space.
- **Your habits are already triggers.** Do not introduce a new surface when an
  existing habit works. See the README's "Your Habits Are Already Triggers".
- **Deterministic steps stay deterministic.** Do not spend a model call on
  parsing, idempotency checks, or formatting that a script does reliably.
- **Owner and off switch.** An always-on automation needs a named owner and a
  way to disable it before it needs more capability.
- **Fixture first.** Prove the pipeline against sample inputs before
  connecting live systems.
- **Start small.** Adopting one or two workflows is a normal outcome.

## Choosing the platform

Pick the builder from where the team's work actually lives, not from which
tools happen to be available in this session.

| Situation | Builder |
|---|---|
| GitHub Issues, Projects, or Discussions are the team's home and GitHub Actions is acceptable | `github-workflow-builder` |
| The work's records live in GitHub, but people read and react in Slack or email | `github-workflow-builder`, with Slack or email as the delivery surface; name `claude-native-workflow-builder` as the alternative |
| The team's records and habits live in Slack, Notion, Jira, or email, or in Google Workspace without Workspace Studio available, or it wants no GitHub/gh-aw dependency | `claude-native-workflow-builder` (Claude Routines and Scheduled Tasks) |
| Work is tracked in Jira and documented in Confluence, the site has Rovo, and the team wants agents and automation inside Atlassian | `atlassian-agent-builder` (Rovo agents with Jira or Confluence automation); name `claude-native-workflow-builder` as the alternative when Rovo is unavailable or the steps span tools outside Atlassian |
| The team's records and habits live in Gmail, Drive, Sheets, or Chat, the organization has a Google Workspace edition with Gemini, and it wants the automation inside Google | `google-workspace-agent-builder` (Workspace Studio flows and skills); name `claude-native-workflow-builder` as the alternative for personal accounts, Gemini turned off, or steps outside Google |
| The team works in Teams, SharePoint, Lists, Outlook, or Planner and wants Microsoft-hosted agents or automation | `microsoft-365-agent-builder`; confirm Agent Builder, Copilot Studio, or Power Automate suitability using tenant access, licensing, and execution identity |
| Product discovery, feedback, and planning live in Productboard | `productboard-agent-builder` (Spark skills) |

For a Google-centric team, the Workspace edition, add-ons, admin settings,
and Studio run quota decide which Google option is viable; recommend Google
as the platform and let `google-workspace-agent-builder` confirm the surface.

For teams combining Microsoft 365 and GitHub, prefer keeping existing GitHub
records and engineering automation in GitHub, with Microsoft 365 handling
collaboration and delivery. Do not recommend Azure DevOps solely because the
team uses Microsoft products. Choose it when requested, already established,
or justified by a concrete requirement. Shared corporate ownership does not
establish integration availability, entitlement, or access.

Separate where the analysis runs from where people read the result. "We
live in Slack" can mean records live there too, or only that the team reads
and reacts there; use Assess evidence to tell which before choosing.

Respect an explicitly requested platform. When two fit, recommend one and
name the tradeoff in a sentence. A design can span platforms; list which
builder owns each step.

## Handoff to a builder

A design is ready for a builder when it states:

1. problems heard, in the team's words
2. selected workflows, each marked as a port of a named repo workflow or a new
   design
3. per workflow: trigger, evidence it reads, artifact it produces, and where
   that artifact lands
4. the human gate and who owns each decision
5. living documents, templates, and policies needed first
6. owner and off switch for the running automation
7. chosen platform per workflow
8. rollout order

## Recommended rollout

Unless the user has a stronger priority:

1. Foundation: strategy and how-we-work docs.
2. Operating surface: intake and launch templates, labels or fields, trackers
   if wanted.
3. Memory: decision log and transcript processing.
4. Alignment: strategy alignment and process analysis.
5. Intake and status: triage, weekly status, or launch readiness.
6. Specialized domain workflows: compliance, GTM, leadership briefs, workflow
   health.
