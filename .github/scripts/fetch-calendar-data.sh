#!/usr/bin/env bash
# fetch-calendar-data.sh
#
# Fetches today's calendar events from the Google Calendar API.
# In fixture mode (CALENDAR_FIXTURE=true or no credentials), reads from
# google-calendar-fixtures/today-sample.json instead.
#
# Usage:
#   ./scripts/fetch-calendar-data.sh [output-file]
#
# Environment variables:
#   GOOGLE_OAUTH_CLIENT_ID      — OAuth 2.0 client ID (same credentials as Docs/Drive)
#   GOOGLE_OAUTH_CLIENT_SECRET  — OAuth 2.0 client secret
#   GOOGLE_OAUTH_REFRESH_TOKEN  — Long-lived refresh token (needs calendar.readonly + calendar.events scopes)
#   GOOGLE_CALENDAR_ID          — Calendar ID to read (default: primary)
#   CALENDAR_FIXTURE            — Set to "true" to force fixture mode
#
# Output: JSON file with today's events in Calendar API v3 format plus
#         a generated "team_member_map" section mapping email → github handle

set -euo pipefail

OUTPUT_FILE="${1:-calendar-data-today.json}"
CALENDAR_ID="${GOOGLE_CALENDAR_ID:-primary}"

# Team member email → GitHub handle mapping (mirrors google-calendar-fixtures/manifest.json)
# In production, this should be loaded from a config file or environment variable.
MEMBER_MAP='[
  {"email": "alex@example.com", "github": "alex-dev", "display_name": "Alex Chen"},
  {"email": "priya@example.com", "github": "priya-pm", "display_name": "Priya Nair"},
  {"email": "sam@example.com", "github": "samuelw", "display_name": "Sam Wilson"},
  {"email": "jordan@example.com", "github": "jordanm", "display_name": "Jordan Mills"},
  {"email": "casey@example.com", "github": "casey-eng", "display_name": "Casey Rivera"}
]'

# --- Fixture mode ---
use_fixture() {
  local fixture_path="google-calendar-fixtures/today-sample.json"
  if [ ! -f "$fixture_path" ]; then
    echo "Error: fixture file not found at $fixture_path" >&2
    exit 1
  fi
  echo "Using fixture: $fixture_path" >&2
  jq --argjson members "$MEMBER_MAP" \
     '. + {team_member_map: ($members | map({(.email): {github: .github, display_name: .display_name}}) | add)}' \
     "$fixture_path" > "$OUTPUT_FILE"
  echo "Wrote $(jq '.events | length' "$OUTPUT_FILE") events to $OUTPUT_FILE (fixture mode)" >&2
}

if [ "${CALENDAR_FIXTURE:-false}" = "true" ] || [ -z "${GOOGLE_OAUTH_REFRESH_TOKEN:-}" ]; then
  echo "::notice::Calendar API credentials not configured — using fixture data" >&2
  use_fixture
  exit 0
fi

# Exchange refresh token for access token using shared helper
chmod +x "$(dirname "$0")/google-oauth-token.sh"
GOOGLE_CALENDAR_TOKEN=$("$(dirname "$0")/google-oauth-token.sh")
if [ -z "$GOOGLE_CALENDAR_TOKEN" ]; then
  echo "::notice::Failed to obtain access token — using fixture data" >&2
  use_fixture
  exit 0
fi

# --- Live Calendar API ---
TODAY_START=$(date -u +%Y-%m-%dT00:00:00Z)
TODAY_END=$(date -u +%Y-%m-%dT23:59:59Z)

echo "Fetching calendar events for $TODAY_START to $TODAY_END" >&2

RESPONSE=$(curl -s \
  -H "Authorization: Bearer $GOOGLE_CALENDAR_TOKEN" \
  "https://www.googleapis.com/calendar/v3/calendars/$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$CALENDAR_ID")/events?timeMin=${TODAY_START}&timeMax=${TODAY_END}&singleEvents=true&orderBy=startTime&maxResults=50")

if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  echo "Calendar API error:" >&2
  echo "$RESPONSE" | jq '.error' >&2
  echo "Falling back to fixture data" >&2
  use_fixture
  exit 0
fi

# Normalize to fixture-compatible format and attach member map
jq -n \
  --arg generated_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg calendar_id "$CALENDAR_ID" \
  --argjson response "$RESPONSE" \
  --argjson members "$MEMBER_MAP" \
  '{
    metadata: {
      fixture_date: (now | strftime("%Y-%m-%d")),
      generated_at: $generated_at,
      calendar_id: $calendar_id,
      is_fixture: false
    },
    events: ($response.items // []),
    team_member_map: ($members | map({(.email): {github: .github, display_name: .display_name}}) | add)
  }' > "$OUTPUT_FILE"

echo "Wrote $(jq '.events | length' "$OUTPUT_FILE") events to $OUTPUT_FILE" >&2
