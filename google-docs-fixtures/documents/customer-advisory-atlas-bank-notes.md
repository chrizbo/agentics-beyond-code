# Customer Advisory Notes - Atlas Bank

**Document owner:** Elena Ruiz, Customer Success  
**Meeting date:** 2026-06-04  
**Customer stage:** Design partner and active enterprise prospect  
**Renewal/procurement window:** Q3 2026

## Participants

- Atlas Bank: Security Operations lead, Procurement lead, Platform Engineering
- Our team: Customer Success, Product, Security

## What We Heard

- Atlas must retain administrator activity records for at least 365 days.
- Their security team can accept daily CSV exports for the first version.
- Self-serve filtering is useful but not required for procurement.
- An API is preferred later, but a reliable export is enough for the initial
  control review.
- They need evidence that deletion and retention settings behave as documented.

## Decision-Relevant Statements

The procurement lead said a 30-day-only export would not meet the current
control requirement. They may accept a roadmap commitment if it includes a
target quarter, a named owner, and a written interim process.

The Security Operations lead said the interim process could be a scheduled
customer-managed download, provided exports are complete and tamper-evident.

## Commitments Made

- Product will return with a retention recommendation by 2026-06-12.
- Security will clarify deletion-verification requirements.
- Customer Success will not promise a 365-day delivery date before Product and
  Security agree.

## Open Questions

- Would Atlas accept Beta access for evaluation even if procurement remains
  blocked?
- Is quarterly roadmap language specific enough for their control review?
- Does the interim process need documented operational support?

