# Drop Priority Queuing from Notifications Sprint

| Field | Value |
|-------|-------|
| **Date** | 2026-05-09 |
| **Status** | Accepted |
| **Source** | `transcripts/standup-2026-05-09.vtt` |
| **Participants** | Marcus Johnson, Priya Patel |
| **Impact** | #62, #63 |

## Context

The team is building a notification fanout system (issue #62) and notification tray component (issue #63). A question arose about whether to implement priority queuing — where different notification types would be processed in a prioritized order — within the current sprint.

## Decision

Priority queuing is dropped from the current sprint. All notification types will be treated equally for now. Priority tiers may be added in a follow-up launch.

## Options Considered

### Option A: Implement priority queuing now

Different notification types would be assigned priority levels and processed accordingly. More complex to implement and increases scope of the current sprint.

### Option B: Treat all notification types equally (chosen)

Simpler implementation — no priority differentiation between notification types. Reduces sprint scope and allows the fanout worker to ship sooner.

## Rationale

Marcus Johnson stated: "we agreed to drop priority queuing from this sprint. All notification types get treated equally for now. Keeps things simpler and we can add priority tiers in a follow-up launch." Priya Patel confirmed agreement. Simplicity and delivering the core fanout functionality were prioritized over a more complex prioritization scheme.
