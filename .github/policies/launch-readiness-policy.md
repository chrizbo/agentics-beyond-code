# Launch Readiness Policy

This policy defines how launch readiness is assessed. The launch readiness
workflow reads this file at runtime. Customize it to match your team's standards.

## Issue Hierarchy

Launches are tracked as GitHub Issues using this hierarchy:

```
Initiative → Launch → Epic → Task
```

- **Launches** are identified by the `launch` label
- **Sub-issues** represent epics and tasks beneath each launch
- **Phase** is tracked via a custom field: Team, Alpha, Beta, GA

## Readiness Criteria

A launch's readiness is assessed by examining its sub-issue tree, labels,
and custom fields. The criteria below are evaluated per-launch, and the
overall score determines the launch's status.

### Completeness Score

The percentage of sub-issues (epics + tasks) that are closed. This is the
primary readiness signal.

| Phase   | Expected Completeness | Risk if Below |
|---------|-----------------------|---------------|
| Team    | No minimum            | —             |
| Alpha   | ≥ 30%                 | Medium        |
| Beta    | ≥ 70%                 | High          |
| GA      | ≥ 95%                 | Critical      |

### Issue Quality Signals

Launches and their sub-issues are checked for quality. Missing information
increases risk, especially in later phases.

**For Launch issues (the parent):**
- Has a summary / description filled in
- Has a target date set
- Has a DRI assigned
- Has customer impact described
- Has success criteria defined
- Has scope / workstreams listed as sub-issues
- Has domain requirements identified (e.g., `needs:security`, `needs:legal`)
- Has a rollout plan (required by Beta)
- Has a communications plan (required by GA)

**For Epics and Tasks (sub-issues):**
- Has an assignee
- Has a description (not just a title)
- Is linked to the correct parent launch

### Domain Sign-off Tracking

Launches that carry `needs:{domain}` labels must eventually receive
matching `approved:{domain}` labels. Missing approvals increase risk
as the launch progresses through phases.

| Phase   | Missing Approvals | Risk Level |
|---------|-------------------|------------|
| Team    | Expected          | Low        |
| Alpha   | Acceptable        | Medium     |
| Beta    | Concerning         | High       |
| GA      | Blocking           | Critical   |

**Common domains:** security, legal, docs, support, accessibility, privacy

### Staleness

A sub-issue is considered stale if it has had no activity (comments, status
changes, commits) within a configurable window.

| Phase   | Stale Threshold | Risk if Stale |
|---------|-----------------|---------------|
| Team    | 14 days         | Low           |
| Alpha   | 10 days         | Medium        |
| Beta    | 7 days          | High          |
| GA      | 3 days          | Critical      |

### Blocker Detection

Issues with the `blocker` label are always surfaced. A launch with open
blockers cannot be considered "on track" regardless of other signals.

### Scope Creep Detection

If new sub-issues are added to a launch after it enters Beta or GA phase,
this is flagged as potential scope creep. The report will note:
- How many sub-issues were added after the phase transition
- Whether those new issues are on track or creating risk

## Risk Levels

Each launch receives an overall risk assessment:

| Risk Level | Meaning |
|------------|---------|
| 🟢 **On Track** | Completeness and quality meet phase expectations, no blockers |
| 🟡 **Needs Attention** | Minor gaps — e.g., some stale issues, a few missing fields |
| 🟠 **At Risk** | Significant gaps — e.g., low completeness for phase, missing approvals |
| 🔴 **High Risk** | Critical issues — e.g., blockers, very low completeness near GA, no DRI |

## Report Audience

The report serves all three personas:

- **DRIs** look for: their launch's status, blockers, what needs action
- **Downstream teams** look for: which launches need their sign-off soon
- **Leaders** look for: overall pipeline health, which launches are at risk
