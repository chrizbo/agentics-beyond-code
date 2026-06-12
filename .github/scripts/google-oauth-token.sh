#!/usr/bin/env bash
# google-oauth-token.sh
#
# Exchanges a Google OAuth refresh token for a short-lived access token.
# Writes the access token to stdout. Used by other scripts that call
# Google APIs (Calendar, Docs, Drive).
#
# Usage:
#   ACCESS_TOKEN=$(./scripts/google-oauth-token.sh)
#
# Environment variables (all required for live mode):
#   GOOGLE_OAUTH_CLIENT_ID      — OAuth 2.0 client ID
#   GOOGLE_OAUTH_CLIENT_SECRET  — OAuth 2.0 client secret
#   GOOGLE_OAUTH_REFRESH_TOKEN  — Long-lived refresh token

set -euo pipefail

if [ -z "${GOOGLE_OAUTH_CLIENT_ID:-}" ] || \
   [ -z "${GOOGLE_OAUTH_CLIENT_SECRET:-}" ] || \
   [ -z "${GOOGLE_OAUTH_REFRESH_TOKEN:-}" ]; then
  echo "" # Empty string signals fixture mode to callers
  exit 0
fi

RESPONSE=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -d "client_id=${GOOGLE_OAUTH_CLIENT_ID}" \
  -d "client_secret=${GOOGLE_OAUTH_CLIENT_SECRET}" \
  -d "refresh_token=${GOOGLE_OAUTH_REFRESH_TOKEN}" \
  -d "grant_type=refresh_token")

ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token // empty')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Error exchanging refresh token:" >&2
  echo "$RESPONSE" | jq '.error, .error_description' >&2
  exit 1
fi

echo "$ACCESS_TOKEN"
