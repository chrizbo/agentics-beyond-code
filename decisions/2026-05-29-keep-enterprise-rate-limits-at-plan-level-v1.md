# Keep Enterprise Rate Limits at Plan Level for v1

| Field | Value |
|-------|-------|
| **Date** | 2026-05-29 |
| **Status** | Accepted |
| **Source** | [#96](https://github.com/chrizbo/agentics-beyond-code/issues/96#issuecomment-4576731310) |
| **Participants** | \@chrizbo |
| **Impact** | #3, #95, #96, #97 |

## Context

The team is implementing the Redis token bucket rate limiter (#96) and defining billing-plan rate limit tiers (#97). Enterprise limits are configurable, but the team needed to decide whether v1 configuration should remain at the plan level or support finer per-endpoint overrides.

## Decision

Enterprise rate limits will remain configurable at the plan level for v1. Per-endpoint overrides are deferred to a later iteration.

## Options Considered

### Option A: Plan-level Enterprise rate limits

Keep Enterprise rate-limit configuration at the billing-plan level for v1. This keeps the gateway and Redis token bucket implementation simpler while still covering the current launch requirements.

### Option B: Per-endpoint overrides

Allow Enterprise customers or internal operators to configure separate rate limits for individual endpoints. This would add flexibility, but the team chose to defer it beyond v1.

## Rationale

\@chrizbo stated: "After reviewing gateway metrics, we decided to keep Enterprise rate limits configurable at the plan level for v1 and defer per-endpoint overrides. That keeps the Redis token bucket path simpler while still covering the launch requirements." The team accepted less granular configuration in exchange for a simpler v1 rate-limiting path.
