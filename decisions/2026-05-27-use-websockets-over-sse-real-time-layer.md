# Use WebSockets over SSE for Real-Time Layer

| Field | Value |
|-------|-------|
| **Date** | 2026-05-27 |
| **Status** | Accepted |
| **Source** | [#69](https://github.com/chrizbo/agentics-beyond-code/issues/69#issuecomment-4556922023), `transcripts/standup-2026-05-27.vtt` |
| **Participants** | Alex Rivera, team |
| **Impact** | #3, #60, #69 |

## Context

The real-time layer affects latency query updates (#69) and downstream UI work that depends on real-time events (#60). The team needed to choose between WebSockets and Server-Sent Events before continuing real-time integration.

## Decision

The team decided to use WebSockets instead of SSE for the real-time layer.

## Options Considered

### Option A: WebSockets

Use WebSockets for the real-time layer. Alex Rivera reported that the WebSocket infrastructure was ready.

### Option B: Server-Sent Events

Use SSE for the real-time layer. No specific advantages or disadvantages were discussed in the source material.

## Rationale

Alex Rivera stated: "After discussion we decided to use WebSockets over SSE for the real-time layer." The issue comment for #69 also records that the team decided to use WebSockets over SSE, so this is treated as the canonical decision for the latency query real-time integration.
