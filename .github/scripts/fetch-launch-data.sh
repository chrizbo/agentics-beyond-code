#!/usr/bin/env bash
# fetch-launch-data.sh
#
# Deterministic pre-step script that fetches launch tracker project data
# from the GitHub GraphQL API and outputs structured JSON.
#
# Usage:
#   ./scripts/fetch-launch-data.sh <owner> <project-number> [output-file]
#
# Requires: gh CLI authenticated with read:project scope
#
# Output: JSON file with full project item hierarchy including:
#   - All items in the project with custom field values
#   - Sub-issue trees walked recursively
#   - Labels, assignees, status, and activity metadata

set -euo pipefail

OWNER="${1:?Usage: $0 <owner> <project-number> [output-file]}"
PROJECT_NUMBER="${2:?Usage: $0 <owner> <project-number> [output-file]}"
OUTPUT_FILE="${3:-launch-data.json}"

# --- Step 1: Resolve project ID and custom field definitions ---

echo "::group::Fetching project metadata" >&2

PROJECT_META=$(gh api graphql -f query='
query($owner: String!, $number: Int!) {
  user(login: $owner) {
    projectV2(number: $number) {
      id
      title
      fields(first: 30) {
        nodes {
          ... on ProjectV2Field {
            id
            name
            dataType
          }
          ... on ProjectV2SingleSelectField {
            id
            name
            dataType
            options { id name }
          }
          ... on ProjectV2IterationField {
            id
            name
            dataType
          }
        }
      }
    }
  }
}' -F owner="$OWNER" -F number="$PROJECT_NUMBER" 2>/dev/null)

PROJECT_ID=$(echo "$PROJECT_META" | jq -r '.data.user.projectV2.id // empty')
if [ -z "$PROJECT_ID" ]; then
  # Try as org owner
  PROJECT_META=$(gh api graphql -f query='
  query($owner: String!, $number: Int!) {
    organization(login: $owner) {
      projectV2(number: $number) {
        id
        title
        fields(first: 30) {
          nodes {
            ... on ProjectV2Field {
              id
              name
              dataType
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              dataType
              options { id name }
            }
            ... on ProjectV2IterationField {
              id
              name
              dataType
            }
          }
        }
      }
    }
  }' -F owner="$OWNER" -F number="$PROJECT_NUMBER" 2>/dev/null)
  PROJECT_ID=$(echo "$PROJECT_META" | jq -r '.data.organization.projectV2.id // empty')
fi

if [ -z "$PROJECT_ID" ]; then
  echo "Error: Could not find project $PROJECT_NUMBER for owner $OWNER" >&2
  exit 1
fi

PROJECT_TITLE=$(echo "$PROJECT_META" | jq -r '
  .data.user.projectV2.title //
  .data.organization.projectV2.title //
  "Unknown"')
echo "Found project: $PROJECT_TITLE" >&2
echo "::endgroup::" >&2

# --- Step 2: Fetch all project items with field values ---

echo "::group::Fetching project items" >&2

ITEMS_FILE=$(mktemp)
echo "[]" > "$ITEMS_FILE"
HAS_NEXT="true"
CURSOR=""

while [ "$HAS_NEXT" = "true" ]; do
  if [ -z "$CURSOR" ]; then
    AFTER_CLAUSE=""
  else
    AFTER_CLAUSE=", after: \\\"$CURSOR\\\""
  fi

  PAGE=$(gh api graphql -f query="
  query {
    node(id: \"$PROJECT_ID\") {
      ... on ProjectV2 {
        items(first: 100$AFTER_CLAUSE) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            content {
              ... on Issue {
                id
                number
                title
                state
                url
                createdAt
                updatedAt
                closedAt
                body
                assignees(first: 10) {
                  nodes { login }
                }
                labels(first: 20) {
                  nodes { name }
                }
                milestone { title dueOn }
              }
            }
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldTextValue {
                  text
                  field { ... on ProjectV2Field { name } }
                }
                ... on ProjectV2ItemFieldNumberValue {
                  number
                  field { ... on ProjectV2Field { name } }
                }
                ... on ProjectV2ItemFieldDateValue {
                  date
                  field { ... on ProjectV2Field { name } }
                }
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field { ... on ProjectV2SingleSelectField { name } }
                }
                ... on ProjectV2ItemFieldIterationValue {
                  title
                  field { ... on ProjectV2IterationField { name } }
                }
              }
            }
          }
        }
      }
    }
  }" 2>/dev/null)

  # Extract items that have issue content (skip drafts)
  echo "$PAGE" | jq '[.data.node.items.nodes[] | select(.content != null and .content.id != null)]' > "${ITEMS_FILE}.page"
  jq -s '.[0] + .[1]' "$ITEMS_FILE" "${ITEMS_FILE}.page" > "${ITEMS_FILE}.merged"
  mv "${ITEMS_FILE}.merged" "$ITEMS_FILE"
  rm -f "${ITEMS_FILE}.page"

  HAS_NEXT=$(echo "$PAGE" | jq -r '.data.node.items.pageInfo.hasNextPage')
  CURSOR=$(echo "$PAGE" | jq -r '.data.node.items.pageInfo.endCursor')

  ITEM_COUNT=$(jq length "$ITEMS_FILE")
  echo "  Fetched $ITEM_COUNT items so far..." >&2
done

echo "::endgroup::" >&2

# --- Step 3: Walk sub-issue trees ---

echo "::group::Walking sub-issue hierarchy" >&2

# Recursive function to fetch sub-issues for a given issue node ID
# Writes result to a temp file to avoid subshell issues
fetch_sub_issues() {
  local parent_id="$1"
  local depth="${2:-0}"
  local result_file="$3"

  if [ "$depth" -gt 5 ]; then
    echo "[]" > "$result_file"
    return
  fi

  local api_result
  api_result=$(gh api graphql -f query="
  query {
    node(id: \"$parent_id\") {
      ... on Issue {
        subIssues(first: 50) {
          nodes {
            id
            number
            title
            state
            url
            createdAt
            updatedAt
            closedAt
            body
            assignees(first: 10) {
              nodes { login }
            }
            labels(first: 20) {
              nodes { name }
            }
          }
        }
      }
    }
  }" 2>/dev/null)

  local subs_file
  subs_file=$(mktemp)
  echo "$api_result" | jq '[.data.node.subIssues.nodes[] // empty]' > "$subs_file"
  local count
  count=$(jq length "$subs_file")

  if [ "$count" -eq 0 ]; then
    echo "[]" > "$result_file"
    rm -f "$subs_file"
    return
  fi

  # For each sub-issue, recursively fetch its children
  local enriched_file
  enriched_file=$(mktemp)
  echo "[]" > "$enriched_file"

  for i in $(seq 0 $((count - 1))); do
    local sub_id
    sub_id=$(jq -r ".[$i].id" "$subs_file")

    local child_file
    child_file=$(mktemp)
    fetch_sub_issues "$sub_id" $((depth + 1)) "$child_file"

    local merged
    merged=$(mktemp)
    jq --argjson children "$(cat "$child_file")" ".[$i] + {\"subIssues\": \$children}" "$subs_file" > "$merged"
    jq --argjson item "$(cat "$merged")" '. + [$item]' "$enriched_file" > "${enriched_file}.tmp"
    mv "${enriched_file}.tmp" "$enriched_file"
    rm -f "$child_file" "$merged"
  done

  mv "$enriched_file" "$result_file"
  rm -f "$subs_file"
}

# Build enriched items
TOTAL=$(jq length "$ITEMS_FILE")
ENRICHED_FILE=$(mktemp)
echo "[]" > "$ENRICHED_FILE"

for i in $(seq 0 $((TOTAL - 1))); do
  ISSUE_ID=$(jq -r ".[$i].content.id" "$ITEMS_FILE")
  ISSUE_NUM=$(jq -r ".[$i].content.number" "$ITEMS_FILE")
  echo "  Walking sub-issues for #$ISSUE_NUM..." >&2

  SUB_FILE=$(mktemp)
  fetch_sub_issues "$ISSUE_ID" 0 "$SUB_FILE"

  # Flatten field values into a clean key-value object
  FIELD_VALUES=$(jq ".[$i].fieldValues.nodes | map(
    if .text then {(.field.name): .text}
    elif .number then {(.field.name): .number}
    elif .date then {(.field.name): .date}
    elif .name then {(.field.name): .name}
    elif .title then {(.field.name): .title}
    else empty
    end
  ) | add // {}" "$ITEMS_FILE")

  # Combine content + project fields + sub-issues
  ITEM=$(jq --argjson fields "$FIELD_VALUES" \
             --argjson subs "$(cat "$SUB_FILE")" \
             ".[$i].content + {\"projectFields\": \$fields, \"subIssues\": \$subs}" "$ITEMS_FILE")

  jq --argjson item "$ITEM" '. + [$item]' "$ENRICHED_FILE" > "${ENRICHED_FILE}.tmp"
  mv "${ENRICHED_FILE}.tmp" "$ENRICHED_FILE"
  rm -f "$SUB_FILE"
done

echo "::endgroup::" >&2

# --- Step 4: Build final output ---

FIELDS_DEF=$(echo "$PROJECT_META" | jq '.data.user.projectV2.fields // .data.organization.projectV2.fields')

jq -n \
  --arg owner "$OWNER" \
  --argjson number "$PROJECT_NUMBER" \
  --arg project_id "$PROJECT_ID" \
  --arg generated_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --argjson fields "$FIELDS_DEF" \
  --argjson items "$(cat "$ENRICHED_FILE")" \
  '{
    metadata: {
      owner: $owner,
      projectNumber: $number,
      projectId: $project_id,
      generatedAt: $generated_at
    },
    fieldDefinitions: $fields,
    items: $items
  }' > "$OUTPUT_FILE"

echo "Wrote $(jq '.items | length' "$OUTPUT_FILE") items to $OUTPUT_FILE" >&2

# Cleanup
rm -f "$ITEMS_FILE" "$ENRICHED_FILE"
