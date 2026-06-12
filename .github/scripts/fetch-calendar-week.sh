#!/usr/bin/env bash
# fetch-calendar-week.sh
#
# Fetches the current week's calendar events (Mon–Sun) from the Google Calendar API.
# In fixture mode (CALENDAR_FIXTURE=true or no credentials), reads from
# google-calendar-fixtures/week-sample.json instead.
#
# Usage:
#   ./scripts/fetch-calendar-week.sh [output-file]
#
# Environment variables:
#   GOOGLE_OAUTH_CLIENT_ID      — OAuth 2.0 client ID (same credentials as Docs/Drive)
#   GOOGLE_OAUTH_CLIENT_SECRET  — OAuth 2.0 client secret
#   GOOGLE_OAUTH_REFRESH_TOKEN  — Long-lived refresh token (needs calendar.readonly + calendar.events scopes)
#   GOOGLE_CALENDAR_ID          — Calendar ID to read (default: primary)
#   CALENDAR_FIXTURE            — Set to "true" to force fixture mode
#
# Output: JSON file with the week's events in Calendar API v3 format plus
#         a "team_member_map" section mapping email → github handle

set -euo pipefail

OUTPUT_FILE="${1:-calendar-data-week.json}"
CALENDAR_ID="${GOOGLE_CALENDAR_ID:-primary}"

MEMBER_MAP='[
  {"email": "alex@example.com", "github": "alex-dev", "display_name": "Alex Chen"},
  {"email": "priya@example.com", "github": "priya-pm", "display_name": "Priya Nair"},
  {"email": "sam@example.com", "github": "samuelw", "display_name": "Sam Wilson"},
  {"email": "jordan@example.com", "github": "jordanm", "display_name": "Jordan Mills"},
  {"email": "casey@example.com", "github": "casey-eng", "display_name": "Casey Rivera"}
]'

# --- Compute week bounds (Monday 00:00 UTC to Sunday 23:59 UTC) ---
# macOS and Linux compatible
day_of_week() {
  date -u +%u 2>/dev/null || date -u +%w
}

DOW=$(day_of_week)
# %u: 1=Mon … 7=Sun; %w: 0=Sun … 6=Sat
# Normalize so 1=Mon
if [ "$DOW" -eq 0 ]; then DOW=7; fi
DAYS_SINCE_MON=$((DOW - 1))

if date -v -0d > /dev/null 2>&1; then
  # macOS
  WEEK_START=$(date -u -v "-${DAYS_SINCE_MON}d" +%Y-%m-%dT00:00:00Z)
  WEEK_END=$(date -u -v "+$((6 - DAYS_SINCE_MON))d" +%Y-%m-%dT23:59:59Z)
else
  # Linux
  WEEK_START=$(date -u -d "$DAYS_SINCE_MON days ago" +%Y-%m-%dT00:00:00Z)
  WEEK_END=$(date -u -d "$((6 - DAYS_SINCE_MON)) days" +%Y-%m-%dT23:59:59Z)
fi

# --- Fixture mode ---
use_fixture() {
  local fixture_path="google-calendar-fixtures/week-sample.json"
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
echo "Fetching calendar events for week: $WEEK_START to $WEEK_END" >&2

RESPONSE=$(curl -s \
  -H "Authorization: Bearer $GOOGLE_CALENDAR_TOKEN" \
  "https://www.googleapis.com/calendar/v3/calendars/$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$CALENDAR_ID")/events?timeMin=${WEEK_START}&timeMax=${WEEK_END}&singleEvents=true&orderBy=startTime&maxResults=200")

if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  echo "Calendar API error:" >&2
  echo "$RESPONSE" | jq '.error' >&2
  echo "Falling back to fixture data" >&2
  use_fixture
  exit 0
fi

jq -n \
  --arg generated_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg calendar_id "$CALENDAR_ID" \
  --arg week_start "$WEEK_START" \
  --arg week_end "$WEEK_END" \
  --argjson response "$RESPONSE" \
  --argjson members "$MEMBER_MAP" \
  '{
    metadata: {
      fixture_week: ($week_start | split("T")[0]),
      fixture_week_end: ($week_end | split("T")[0]),
      generated_at: $generated_at,
      calendar_id: $calendar_id,
      is_fixture: false
    },
    events: ($response.items // []),
    team_member_map: ($members | map({(.email): {github: .github, display_name: .display_name}}) | add)
  }' > "$OUTPUT_FILE"

echo "Wrote $(jq '.events | length' "$OUTPUT_FILE") events to $OUTPUT_FILE" >&2
