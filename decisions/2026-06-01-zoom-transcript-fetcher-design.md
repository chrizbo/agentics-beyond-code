# Zoom Transcript Fetcher — Design Decisions

**Date:** 2026-06-01  
**Status:** Future / Not yet implemented

## Context

The Transcript Processor workflow processes meeting transcripts when `.vtt` files are pushed to `/transcripts/`. We want to automate pulling those transcripts from Zoom rather than uploading them manually.

## Decisions

### Which meetings to fetch
Meeting IDs are declared in `docs/how-we-work.md` — each meeting in the cadence section will include a `Zoom Meeting ID:` field. The fetcher reads that file to determine which IDs to poll, so adding a new recurring meeting is a doc edit, not a code change.

### Auth method
Zoom Server-to-Server OAuth (paid account, so no marketplace approval required). Credentials stored as GitHub Actions secrets.

### Transcript format
`.vtt` — Zoom's native format, already accepted by the Transcript Processor.

### Trigger method
Polling, not webhooks. A cron GitHub Actions workflow runs every ~2 hours. Zoom typically takes 30–60 min post-meeting to process recordings, so 2-hour polling is sufficient. Webhooks are not ruled out for the future — if added, they would be a second trigger that also results in a file commit, with no changes needed to the Transcript Processor.

**Why not GitHub Actions as a webhook receiver?** `repository_dispatch` requires an external service to receive the Zoom webhook and call the GitHub API. Polling avoids that dependency while we're getting started.

### Deduplication
Repo memory (`gh-aw` repo memory feature) stores a JSON file of already-imported Zoom recording IDs. Each polling run diffs against this set and only downloads new recordings.

### Commit target
Transcripts are committed directly to `main` (no PR). This keeps the Transcript Processor trigger simple and avoids a manual approval step for routine recordings.

### Workflow type
Plain GitHub Actions (`.yml`), not an agentic workflow. The fetcher is deterministic plumbing (API call → download → commit). The AI work happens downstream in the existing Transcript Processor AW once the file lands.

### Filename convention
`YYYY-MM-DD-{meeting-name}-{zoom-meeting-id}.vtt`

Meeting name comes from `docs/how-we-work.md` (not Zoom's topic field, which is unreliable). Zoom meeting ID is included for traceability and to simplify dedup if repo memory were ever reset.

## What's needed to implement

1. Add `Zoom Meeting ID:` fields to each meeting in `docs/how-we-work.md`
2. Create a Zoom Server-to-Server OAuth app and store credentials as GitHub Actions secrets
3. Write `.github/workflows/zoom-transcript-fetcher.yml` — cron, reads how-we-work, polls Zoom API, downloads new `.vtt` files, commits to `/transcripts/`, updates repo memory
