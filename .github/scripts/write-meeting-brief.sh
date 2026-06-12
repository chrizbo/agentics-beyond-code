#!/usr/bin/env bash
# write-meeting-brief.sh
#
# Appends a meeting brief to a Google Calendar event's description.
# The brief is marker-delimited — only the marked section is updated on
# subsequent runs, preserving any organizer-written content above it.
#
# Usage:
#   ./scripts/write-meeting-brief.sh <event-id> <brief-content> [calendar-id]
#
# Environment variables:
#   GOOGLE_OAUTH_CLIENT_ID      — OAuth 2.0 client ID (same credentials as Docs/Drive)
#   GOOGLE_OAUTH_CLIENT_SECRET  — OAuth 2.0 client secret
#   GOOGLE_OAUTH_REFRESH_TOKEN  — Long-lived refresh token (needs calendar.events scope)
#   CALENDAR_WRITE_ENABLED      — Set to "true" to actually write; default is dry-run
#
# The brief content is injected between these HTML comment markers:
#   <!-- meeting-brief-start -->
#   <!-- meeting-brief-end -->

set -euo pipefail

EVENT_ID="${1:?Usage: $0 <event-id> <brief-content> [calendar-id]}"
BRIEF_CONTENT="${2:?Usage: $0 <event-id> <brief-content> [calendar-id]}"
CALENDAR_ID="${3:-${GOOGLE_CALENDAR_ID:-primary}}"

MARKER_START="<!-- meeting-brief-start -->"
MARKER_END="<!-- meeting-brief-end -->"

WRITE_ENABLED="${CALENDAR_WRITE_ENABLED:-false}"

# Exchange refresh token for access token
GOOGLE_CALENDAR_TOKEN=""
if [ -n "${GOOGLE_OAUTH_REFRESH_TOKEN:-}" ]; then
  chmod +x "$(dirname "$0")/google-oauth-token.sh"
  GOOGLE_CALENDAR_TOKEN=$("$(dirname "$0")/google-oauth-token.sh")
fi

if [ -z "$GOOGLE_CALENDAR_TOKEN" ]; then
  echo "::notice::No OAuth credentials — dry-run only" >&2
  WRITE_ENABLED="false"
fi

if [ "$WRITE_ENABLED" != "true" ]; then
  echo "--- DRY RUN (set CALENDAR_WRITE_ENABLED=true to write) ---" >&2
  echo "Event ID: $EVENT_ID" >&2
  echo "Calendar: $CALENDAR_ID" >&2
  echo "Would append:" >&2
  echo "$MARKER_START" >&2
  echo "$BRIEF_CONTENT" >&2
  echo "$MARKER_END" >&2
  exit 0
fi

# Fetch current event
ENCODED_CAL=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$CALENDAR_ID")
EVENT=$(curl -s \
  -H "Authorization: Bearer $GOOGLE_CALENDAR_TOKEN" \
  "https://www.googleapis.com/calendar/v3/calendars/${ENCODED_CAL}/events/${EVENT_ID}")

if echo "$EVENT" | jq -e '.error' > /dev/null 2>&1; then
  echo "Error fetching event $EVENT_ID:" >&2
  echo "$EVENT" | jq '.error' >&2
  exit 1
fi

CURRENT_DESC=$(echo "$EVENT" | jq -r '.description // ""')

# Build updated description — preserve content above the marker, replace the marked section
if echo "$CURRENT_DESC" | grep -qF "$MARKER_START"; then
  # Existing brief — replace just the marked section
  ABOVE_MARKER=$(echo "$CURRENT_DESC" | sed "/$MARKER_START/,/$MARKER_END/d" | sed '/^[[:space:]]*$/d')
  NEW_DESC="${ABOVE_MARKER}

${MARKER_START}
${BRIEF_CONTENT}
${MARKER_END}"
else
  # First run — append after existing content
  if [ -n "$CURRENT_DESC" ]; then
    NEW_DESC="${CURRENT_DESC}

---

${MARKER_START}
${BRIEF_CONTENT}
${MARKER_END}"
  else
    NEW_DESC="${MARKER_START}
${BRIEF_CONTENT}
${MARKER_END}"
  fi
fi

# Patch the event description
PATCH_BODY=$(jq -n --arg desc "$NEW_DESC" '{"description": $desc}')

PATCH_RESULT=$(curl -s -X PATCH \
  -H "Authorization: Bearer $GOOGLE_CALENDAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PATCH_BODY" \
  "https://www.googleapis.com/calendar/v3/calendars/${ENCODED_CAL}/events/${EVENT_ID}?fields=id,summary,description")

if echo "$PATCH_RESULT" | jq -e '.error' > /dev/null 2>&1; then
  echo "Error patching event $EVENT_ID:" >&2
  echo "$PATCH_RESULT" | jq '.error' >&2
  exit 1
fi

echo "Updated description for event: $(echo "$PATCH_RESULT" | jq -r '.summary') ($EVENT_ID)" >&2
