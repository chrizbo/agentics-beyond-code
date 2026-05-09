# iDEAL Redirect Flow: Use Inline iframe as Popup-Blocked Fallback

| Field | Value |
|-------|-------|
| **Date** | 2026-05-09 |
| **Status** | Accepted |
| **Source** | `transcripts/standup-2026-05-09.vtt` |
| **Participants** | Priya Patel, Marcus Johnson, Sarah Chen |
| **Impact** | #15 |

## Context

During the iDEAL redirect flow implementation (issue #15), Marcus Johnson flagged an edge case where users have pop-ups blocked in their browser. This prevents the standard redirect/pop-up approach from working, creating a broken payment experience for affected users.

## Decision

The team decided to prototype an inline iframe as the fallback mechanism for the iDEAL redirect flow when browser pop-ups are blocked.

## Options Considered

### Option A: Inline iframe fallback

Render the iDEAL payment page within an inline iframe embedded in the page when pop-ups are blocked. Keeps the user on the page and avoids reliance on browser pop-up permissions.

### Option B: Standard redirect/pop-up

Open the iDEAL page via a pop-up or top-level redirect. Does not work when users have pop-ups blocked.

## Rationale

The inline iframe approach was chosen because it handles the popup-blocked edge case gracefully, keeping the payment flow functional regardless of browser settings. Priya Patel took ownership of prototyping this approach to validate feasibility before full implementation.
