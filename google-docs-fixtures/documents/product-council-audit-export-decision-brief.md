# Product Council - Audit Export Retention Decision Brief

**Document owner:** Sarah Chen, Product  
**Decision owner:** Sarah Chen  
**Decision needed by:** 2026-06-12  
**Status:** Open

## Decision

Should Audit Log Export enter Beta with a fixed 30-day export window, or should
the launch wait until configurable retention up to 365 days is available?

## Why This Is Coming Up Now

The core export path is working in staging. Supporting a fixed 30-day window
would keep the current Beta target. Configurable retention requires additional
storage controls, billing rules, and security review.

## Options

### Option A: Ship Beta With a Fixed 30-Day Window

- Keeps the current Beta target of 2026-06-24.
- Gives design partners a usable export flow sooner.
- Does not satisfy Atlas Bank's stated procurement requirement.
- Requires clear Beta messaging that longer retention is not yet committed.

### Option B: Wait for Configurable Retention

- Supports 30, 90, and 365-day windows at Beta.
- Better matches enterprise procurement expectations.
- Moves Beta by an estimated four to six weeks.
- Adds unresolved storage-cost and deletion-verification work.

### Option C: Ship 30 Days and Commit to a Dated 365-Day Follow-Up

- Keeps the current Beta target.
- Gives Atlas Bank a concrete roadmap commitment.
- Creates credibility risk if the follow-up date slips.
- Requires Product, Security, and Sales approval on external wording.

## Current Product Recommendation

Ship Option A to the general design-partner cohort. Do not promise Atlas Bank a
date until Security has approved the long-retention control design.

## Missing Evidence

- Number of current design partners that require more than 30 days.
- Storage-cost estimate for 365-day retention.
- Security position on deletion verification.
- Whether Atlas Bank will accept a time-bound roadmap commitment.

## Related Sources

- Customer Advisory Notes - Atlas Bank
- Security Data Retention Policy - Draft
- Audit Log Export - Cross-Functional Launch Plan

