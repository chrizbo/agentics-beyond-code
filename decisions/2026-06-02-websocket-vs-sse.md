# WebSocket vs. SSE

| Field           | Value                                |
| --------------- | ------------------------------------ |
| **Date**        | 2026-06-02                           |
| **Status**      | Accepted                             |
| **Source**      | `transcripts/standup-2026-05-27.vtt` |
| **Participants**| Sarah Chen, Alex Rivera              |
| **Impact**      | #69, #60                             |

## Context

The decision was made after a discussion to choose the best real-time
transport mechanism.

## Decision

The team decided to use WebSockets over SSE for the real-time layer.

## Options Considered

### Option A: WebSockets

Pros: More suitable for complex bidirectional communication.

### Option B: SSE

Pros: Easier to implement for unidirectional streams.

## Rationale

WebSockets were chosen due to better support for the
real-time layer and performance considerations.
