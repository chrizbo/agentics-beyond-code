# Allow Hardcoded Role Mapping for Beta

| Field | Value |
|-------|-------|
| **Date** | 2026-05-26 |
| **Status** | Accepted |
| **Source** | [#72](https://github.com/chrizbo/agentics-beyond-code/issues/72#issuecomment-4556309891), `transcripts/standup-2026-05-26.vtt` |
| **Participants** | Marcus Johnson, Sarah Chen |
| **Impact** | #3, #72 |

## Context

Role-based dashboard access control (#72) depends on infra exposing a role mapping schema. That schema was not yet available, creating a blocker for the Beta cut.

## Decision

The team will accept a temporary hardcoded role mapping for Beta, with a TODO to replace it with dynamic discovery after Beta.

## Options Considered

### Option A: Temporary hardcoded mapping

Use a hardcoded role mapping for the Beta cut so dashboard access control can proceed despite the missing infra schema.

### Option B: Dynamic role mapping discovery

Wait for infra to expose the role mapping schema and use dynamic discovery from the start.

## Rationale

Marcus Johnson raised the decision point: "do we accept a temporary hardcoded mapping for the Beta cut?" Sarah Chen said yes for Beta, with a TODO to replace it with dynamic discovery. This unblocks Beta while preserving the intended long-term design.
