# Metrics Backend

| Field           | Value                                |
| --------------- | ------------------------------------ |
| **Date**        | 2026-06-02                           |
| **Status**      | Accepted                             |
| **Source**      | `transcripts/standup-2026-05-09.vtt` |
| **Participants**| Sarah Chen, Marcus Johnson           |
| **Impact**      | #68, #69                             |

## Context

Evaluating the most efficient database for metrics aggregation
queries.

## Decision

Selected ClickHouse over TimescaleDB for the metrics backend.

## Options Considered

### Option A: ClickHouse

Pros: Demonstrated better performance on aggregation queries.

### Option B: TimescaleDB

Pros: Known integration but less performant.

## Rationale

ClickHouse showed 3-4x better performance, thus chosen.
