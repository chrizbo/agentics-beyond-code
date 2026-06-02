# Rate Limits

| Field           | Value                                |
| --------------- | ------------------------------------ |
| **Date**        | 2026-06-02                           |
| **Status**      | Accepted                             |
| **Source**      | `transcripts/standup-2026-05-26.vtt` |
| **Participants**| Sarah Chen, Marcus Johnson           |
| **Impact**      | #97, #98                             |

## Context

Determining configuration flexibility of rate limits for
Enterprise plans.

## Decision

Kept Enterprise rate limits configurable only at the plan
level.

## Options Considered

Deferring per-endpoint overrides to simplify developments.

## Rationale

Practical and keeps dependent issues moving forward.
