# How We Work

> ⚠️ **This is sample data.** The team, processes, and details below are
> fictional — they exist so the Process Analyzer workflow has realistic
> content to work with. **Replace this entire document with your actual
> team's processes** before using the workflow in production.

> **Living document.** This describes how the team operates day-to-day. When
> processes change — whether by explicit decision or organic drift — update this
> doc so it stays accurate. The **Process Analyzer** workflow watches meeting
> transcripts for changes and opens PRs to keep this up to date.

## Team

| Name | Role | Focus |
|------|------|-------|
| Sarah Chen | Engineering Manager | Sprint planning, stakeholder sync, risk management |
| Marcus Johnson | Senior Backend Engineer | APIs, data infrastructure, performance |
| Priya Patel | Frontend Engineer | UI components, design system, accessibility |
| David Kim | QA Lead | Test strategy, smoke testing, release sign-off |
| Alex Rivera | DevOps Engineer | CI/CD, infrastructure, monitoring |
| Jordan Taylor | Product Designer | UX research, prototyping, design reviews |

## Meeting Cadence

### Daily Standup
- **When:** Every weekday, 9:00 AM (10 min max)
- **Format:** Round-robin — each person shares: yesterday, today, blockers
- **Facilitator:** Sarah Chen
- **Where:** Video call (recorded, transcript auto-pushed to `/transcripts/`)

### Sprint Planning
- **When:** Every other Monday, 10:00 AM (1 hour)
- **Participants:** Full team
- **Process:**
  1. Review velocity from previous sprint
  2. Groom and estimate backlog items
  3. Commit to sprint scope
  4. Identify dependencies and risks

### Sprint Retrospective
- **When:** Every other Friday, 3:00 PM (45 min)
- **Format:** Start / Stop / Continue
- **Action items:** Logged as issues with `retro-action` label

### Design Review
- **When:** Wednesdays, 2:00 PM (30 min, as needed)
- **Participants:** Jordan, Priya, Sarah
- **Process:** Walk through designs, collect feedback, approve or iterate

### Stakeholder Sync
- **When:** Fridays, 11:00 AM (30 min)
- **Participants:** Sarah + stakeholders
- **Purpose:** Launch status, risk escalation, priority alignment

## Ritual Cadence

> Expected ceremonies and how to detect they happened. The **Process Analyzer**
> workflow checks this table weekly and reports which rituals are on track,
> overdue, or emerging informally.

| Ritual | Cadence | Evidence | Grace Period |
|--------|---------|----------|--------------|
| Daily Standup | Daily (weekdays) | transcript filename contains `standup` | 1 day |
| Sprint Planning | Biweekly (Monday) | transcript filename contains `sprint-planning` or `planning` | 3 days |
| Sprint Retrospective | Biweekly (Friday) | transcript filename contains `retro` | 3 days |
| Design Review | Weekly (Wednesday) | transcript filename contains `design-review` or `design` | 5 days |
| Stakeholder Sync | Weekly (Friday) | transcript filename contains `stakeholder` | 5 days |
| Stale Issue Review | Monthly (1st Monday) | issue with `stale-review` label or transcript mention | 10 days |

## Issue Triage

### New Issue Triage
- **When:** Daily, after standup
- **Who:** Sarah (DRI), with input from relevant engineers
- **Process:**
  1. Review all unlabeled issues opened in the last 24 hours
  2. Classify by type: `bug`, `enhancement`, `question`, `documentation`
  3. Assign priority: `P0` (drop everything), `P1` (this sprint), `P2` (next sprint), `P3` (backlog)
  4. Assign to an engineer or leave unassigned for sprint planning
  5. Add to the Launch Tracker project board if related to an active launch

### Bug Triage
- **P0 bugs:** Assigned immediately, Slack alert in `#incidents`
- **P1 bugs:** Added to current sprint
- **P2/P3 bugs:** Queued for sprint planning

### Stale Issue Review
- **When:** Monthly (first Monday)
- **Process:** Close issues with no activity in 60+ days after confirming with assignee

## Sprint / Iteration Cadence

- **Sprint length:** 2 weeks
- **Sprint starts:** Monday
- **Sprint ends:** Friday
- **Velocity tracking:** Issue count + story points
- **Scope changes:** Mid-sprint scope changes require Sarah's approval and are logged as unplanned work

## Decision-Making

- **Technical decisions:** Made by the engineer doing the work, with review from a second engineer
- **Architectural decisions:** Require team discussion in standup or a dedicated sync. Logged in `/decisions/` via the Decision Log workflow
- **Product decisions:** Sarah has final call, with input from Jordan (design) and stakeholders
- **Process:** Decisions are documented with context, options considered, and rationale

## PR Review Process

- **All PRs require at least one review** before merge
- **Review SLA:** 24 hours for normal PRs, 4 hours for P0 fixes
- **Auto-assign:** PRs are auto-assigned to a reviewer via CODEOWNERS
- **Draft PRs:** Use drafts for work-in-progress; convert to ready when seeking review
- **Merge strategy:** Squash and merge (keeps history clean)
- **CI must pass** before merge — no force-merging over failures

## On-Call & Incident Response

- **Rotation:** Weekly, rotating through Marcus → Alex → Priya → David
- **Responsibilities:**
  - Monitor `#alerts` Slack channel
  - Acknowledge incidents within 15 minutes during business hours
  - Page the team for P0 incidents outside business hours
- **Incident process:**
  1. Acknowledge in Slack
  2. Create a GitHub issue with `incident` label
  3. Investigate and mitigate
  4. Post-mortem within 48 hours (filed as a decision record)

## Communication Norms

- **Slack:** Real-time questions, quick decisions, social
- **GitHub Issues:** All tracked work, decisions, and long-form discussion
- **GitHub Discussions:** RFCs, proposals, team announcements
- **Email:** External stakeholder communication only
- **Async by default:** Don't expect instant replies outside of incidents. Prefer issues/PRs over Slack for anything that needs a record.

## Automation & Tooling

### Currently Automated
| Process | Tool | Trigger |
|---------|------|---------|
| Transcript → issue comments | Transcript Processor workflow | Push to `/transcripts/` |
| Decision extraction | Decision Log workflow | Weeknights after each workday |
| Launch readiness reports | Launch Readiness workflow | Weekly (Monday ~8:30 AM) |
| Compliance reviews | Compliance Review workflow | Weekly (Monday ~8 AM) + on issue labeled |
| Compliance team reports | Compliance Team Reports workflow | Weekly (Monday ~8:45 AM) |
| GTM content drafts | GTM Content workflow | Weekly (Monday ~8:15 AM) |
| GTM team reports | GTM Team Reports workflow | Weekly (Monday ~8 AM) |
| Assumption surfacing | Assumption Surfacer workflow | On issue opened/edited |
| Weekly status rollup | Weekly Status workflow | Weekly (Friday) |
| Workflow health monitoring | Workflow Health workflow | Weekly (Friday) |
| Strategy alignment analysis | Strategy Alignment workflow | Weekly (Wednesday ~8 AM) |
| Decision challenge | Adversarial PM workflow | Weekly (Wednesday ~8:30 AM) |
| Process analysis & retro | Process Analyzer workflow | Weekly (Monday night / early Tuesday UTC) |
| Ritual cadence tracking | Process Analyzer workflow | Weekly (part of retro) |
| Intake request triage | Intake Request Triage workflow | On issue labeled `triage-needed` |
| Standup preparation | Daily Standup Prep workflow | Monday/Wednesday |
| Sample data generation | Sample Data Simulator | Sunday and Tuesday nights |

### Manual Processes (Candidates for Automation)
| Process | Current Owner | Notes |
|---------|---------------|-------|
| ~~Issue triage & labeling~~ | ~~Sarah~~ | **Automated** — see Intake Request Triage workflow below |
| Sprint velocity reporting | Sarah | Manual spreadsheet export; could use a scheduled workflow |
| Stale issue cleanup | Sarah | Monthly manual review; could be a scheduled workflow |
| On-call rotation scheduling | Alex | Manual Google Calendar updates |
| Release notes compilation | Priya | Manual before each GA launch |
| Dependency update review | Marcus | Manual Dependabot PR review |

## Tool Stack

| Category | Tool |
|----------|------|
| Source control | GitHub |
| Project management | GitHub Projects |
| CI/CD | GitHub Actions |
| Communication | Slack + GitHub Discussions |
| Monitoring | Grafana + custom dashboards |
| Incident management | PagerDuty → Slack → GitHub Issues |
| Design | Figma |
| Documentation | Markdown in-repo |
