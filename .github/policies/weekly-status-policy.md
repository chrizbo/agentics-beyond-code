# Weekly Status Policy

This policy defines how the weekly leadership status update is generated.
The weekly status workflow reads this file at runtime. Customize it to
match your team's communication standards.

## Purpose

Produce a single, high-signal weekly discussion post that gives leaders a
fast read on portfolio health. The update should help leaders:

- **Celebrate** — recognize what shipped and who made it happen
- **Learn** — absorb insights the team discovered during the week
- **Stay informed** — catch important FYIs before they become surprises
- **Act** — know exactly where leadership involvement is needed (SOS)

## Issue Hierarchy

The status rolls up from the standard issue hierarchy:

```
Initiative → Launch → Epic → Task
```

- **Initiatives** are identified by the `initiative` label
- **Launches** are identified by the `launch` label
- **Epics** and **Tasks** are sub-issues beneath launches
- **Phase** is tracked via a custom field: Team, Alpha, Beta, GA

## Report Sections

The report contains exactly four sections, in this order:

### 🚀 What Shipped

Items that reached a milestone or were completed this week.

**Include when:**
- A launch moved to GA or was closed as completed
- A launch advanced to a new phase (e.g., Alpha → Beta)
- An initiative had all its launches completed
- A significant epic was completed that unblocks downstream work

**Exclude when:**
- Individual tasks were closed (too granular for leaders)
- A launch moved to a phase but has no meaningful progress

### 🧠 What We Learned

Insights, retrospective findings, or non-obvious discoveries from the week.

**Include when:**
- A team documented a retro takeaway or post-incident learning
- Data from a beta/experiment revealed something unexpected
- A technical decision was made that changes the approach
- A compliance review surfaced a systemic issue
- Customer feedback shifted priorities or assumptions
- A task or epic comment describes a surprise, trade-off, or "TIL" moment

**Derive from:**
- Comments on tasks, epics, and launches — these are the primary source
  of learnings. Look for status updates, retro notes, decision rationale,
  experiment results, and surprises.
- Launches that changed phase or scope with explanatory comments
- Compliance review sub-issues that were recently closed with findings

### 📢 FYI

Important awareness items that don't require immediate action.

**Include when:**
- A launch's target date changed
- A new initiative or launch was created
- A dependency on an external team was identified
- Scope was added or removed from an in-flight launch
- A compliance review was completed (approved)
- Team changes affecting a launch (new DRI, reassignment)

### 🆘 SOS

Items where leadership attention, decision-making, or escalation is needed.

**Include when:**
- A launch has the `blocker` label with no resolution path
- A launch in Beta or GA is missing required compliance approvals
- A launch is 🔴 High Risk per the launch readiness policy
- A target date is within 2 weeks and completeness is below threshold
- A resource conflict or staffing gap is blocking progress
- An external dependency is unresponsive and blocking a launch
- Task-level comments explicitly request escalation or leadership help
- Multiple tasks on the same launch report the same blocker, suggesting
  a systemic issue

**Severity signals (order items by severity):**
1. GA launches with open blockers
2. Beta launches missing compliance approvals
3. Launches within 2 weeks of target with < 70% completeness
4. Unresolved resource/staffing escalations

## Bullet Format

Every item in every section uses this format:

```markdown
* [Initiative or Launch Title](link to issue) - One sentence summary of what happened or what's needed.
```

**Rules:**
- Link text is the initiative or launch title (without the `[Initiative]` or `[Launch]` prefix brackets)
- Link URL is the full GitHub issue URL
- Summary is one sentence, written in past tense for "What Shipped" and "What We Learned", present tense for "FYI" and "SOS"
- If an item relates to a specific launch under an initiative, include the launch context: `* [Launch Title](url) - Summary. (Part of [Initiative Title](url))`
- Each section should have at most 10 items; if more exist, group by initiative and summarize
- If a section has no items, display: `* No items this week.`

## Tone and Voice

- **Concise** — leaders scan, they don't read essays
- **Specific** — name the launch, link to the issue, state the fact
- **Action-oriented** — especially in SOS, say what you need from leadership
- **Celebratory** — in What Shipped, acknowledge the effort
- **Neutral** — in FYI and What We Learned, state facts without spin

## Data Sources

The report draws context from multiple layers of the issue hierarchy:

1. **Issue metadata** — state, labels, assignees, phases, target dates
   (from pre-fetched `launch-data.json`)
2. **Issue bodies** — descriptions on initiatives, launches, epics
   (from pre-fetched `launch-data.json`)
3. **Comments on tasks, epics, and launches** — fetched at runtime via
   `gh issue view` for issues updated within the reporting window. Comments
   are the richest source of signal for What We Learned, SOS, and FYI
   sections. Status updates, blockers, decisions, and escalations are
   most often found in task-level comments.

## Time Window

The report covers activity from the **previous 7 days** relative to the
workflow run date. Use issue activity (state changes, label changes,
comments, phase transitions) to determine what happened in-window.

## Report Audience

The primary audience is **leadership and senior stakeholders** who need to:

1. Know what's happening across the portfolio without reading every issue
2. Celebrate wins and recognize teams
3. Provide feedback or course-correct early
4. Escalate or unblock when their involvement is needed
