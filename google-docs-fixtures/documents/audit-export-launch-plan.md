# Audit Log Export - Cross-Functional Launch Plan

**Document owner:** Maya Thompson, Program Management  
**Target Beta date:** 2026-06-24  
**Current phase:** Alpha  
**Overall status:** At risk

## Launch Goal

Let administrators export a complete, tamper-evident record of administrator
activity for external review and customer-managed retention.

## Beta Scope

- Manual CSV export.
- Fixed 30-day platform retention window.
- Generated timestamp and integrity checksum.
- Admin-only access.
- Beta documentation describing known limitations.

## Explicitly Out of Scope for Beta

- Configurable 90-day or 365-day platform retention.
- Scheduled exports.
- Audit export API.
- Customer-visible deletion evidence.

## Readiness

| Area | Status | Notes |
|---|---|---|
| Product | At risk | Retention decision still open |
| Engineering | On track | Export path works in staging |
| Security | At risk | Deletion verification test not complete |
| QA | At risk | Large-account fixture needed |
| Customer Success | At risk | Atlas Bank expectation needs response |
| Documentation | Not started | Waiting on retention decision |

## Decision Needed

Confirm whether Beta remains a fixed 30-day launch or waits for configurable
retention. Product Council decision brief is the coordinating document.

## Agentics Updates

Future validated workflow updates may be appended below this heading. Each
update must include a GitHub source URL and workflow-run attribution.

