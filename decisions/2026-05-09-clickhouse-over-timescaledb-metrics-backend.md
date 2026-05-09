# Use ClickHouse over TimescaleDB for Metrics Backend

| Field | Value |
|-------|-------|
| **Date** | 2026-05-09 |
| **Status** | Accepted |
| **Source** | `transcripts/standup-2026-05-09.vtt` |
| **Participants** | Sarah Chen, Marcus Johnson, data team |
| **Impact** | #68, #69 |

## Context

The team needed to select a time-series database for the metrics backend. This decision came up after benchmarking was completed as part of the work on the ClickHouse schema (issue #68). Sarah Chen and Marcus Johnson had synced with the data team the day before the standup to finalize the choice.

## Decision

The team will use ClickHouse over TimescaleDB for the metrics backend. The schema is partitioned by service and date to optimize aggregation query performance.

## Options Considered

### Option A: ClickHouse

High-performance columnar OLAP database. Benchmarks showed 3–4× better performance on aggregation queries compared to TimescaleDB for the team's workload.

### Option B: TimescaleDB

PostgreSQL extension designed for time-series data. Considered but benchmarked slower for the team's aggregation query patterns.

## Rationale

Benchmarks demonstrated 3–4× better performance from ClickHouse on aggregation queries. Sarah Chen stated this decision as final in the standup: "we're going with ClickHouse over TimescaleDB for the metrics backend. Benchmarks showed 3-4x better performance on the aggregation queries. That's final."
