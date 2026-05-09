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

# --- GraphQL helper ---
# In CI (AWF sandbox), gh api routes through a DIFC proxy that doesn't
# forward PAT scopes for Projects. Use curl + LAUNCH_DATA_TOKEN directly.
graphql() {
  local query="$1"
  shift
  if [ -n "${LAUNCH_DATA_TOKEN:-}" ]; then
    # Build JSON payload with variables
    local vars="{}"
    while [ $# -gt 0 ]; do
      local key="${1#-F }"
      if [ "$1" != "$key" ]; then
        shift; continue
      fi
      if [[ "$1" == -F ]]; then
        shift
        local pair="$1"
        local k="${pair%%=*}"
        local v="${pair#*=}"
        if [[ "$v" =~ ^[0-9]+$ ]]; then
          vars=$(echo "$vars" | jq --arg k "$k" --argjson v "$v" '. + {($k): $v}')
        else
          vars=$(echo "$vars" | jq --arg k "$k" --arg v "$v" '. + {($k): $v}')
        fi
      elif [[ "$1" == -f ]]; then
        shift
        local pair="$1"
        local k="${pair%%=*}"
        local v="${pair#*=}"
        vars=$(echo "$vars" | jq --arg k "$k" --arg v "$v" '. + {($k): $v}')
      fi
      shift
    done
    local payload
    payload=$(jq -n --arg q "$query" --argjson v "$vars" '{query: $q, variables: $v}')
    curl -s -H "Authorization: bearer $LAUNCH_DATA_TOKEN" \
         -H "Content-Type: application/json" \
         -X POST https://api.github.com/graphql \
         -d "$payload"
  else
    gh api graphql -f query="$query" "$@"
  fi
}

# --- Step 1: Resolve project ID and custom field definitions ---

echo "::group::Fetching project metadata" >&2

PROJECT_META=$(graphql '
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
  PROJECT_META=$(graphql '
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

  PAGE=$(graphql "
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

  # Paginate sub-issues
  local subs_file
  subs_file=$(mktemp)
  echo "[]" > "$subs_file"
  local has_next="true"
  local cursor=""

  while [ "$has_next" = "true" ]; do
    local after_clause=""
    if [ -n "$cursor" ]; then
      after_clause=", after: \\\"$cursor\\\""
    fi

    local api_result
    api_result=$(graphql "
    query {
      node(id: \"$parent_id\") {
        ... on Issue {
          subIssues(first: 50$after_clause) {
            pageInfo { hasNextPage endCursor }
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

    local page_file
    page_file=$(mktemp)
    echo "$api_result" | jq '[.data.node.subIssues.nodes[] // empty]' > "$page_file"
    jq -s '.[0] + .[1]' "$subs_file" "$page_file" > "${subs_file}.merged"
    mv "${subs_file}.merged" "$subs_file"
    rm -f "$page_file"

    has_next=$(echo "$api_result" | jq -r '.data.node.subIssues.pageInfo.hasNextPage // false')
    cursor=$(echo "$api_result" | jq -r '.data.node.subIssues.pageInfo.endCursor // empty')
  done

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
  ITEM_FILE=$(mktemp)
  jq --argjson fields "$FIELD_VALUES" \
             --slurpfile subs "$SUB_FILE" \
             ".[$i].content + {\"projectFields\": \$fields, \"subIssues\": \$subs[0]}" "$ITEMS_FILE" > "$ITEM_FILE"

  jq --slurpfile item "$ITEM_FILE" '. + $item' "$ENRICHED_FILE" > "${ENRICHED_FILE}.tmp"
  mv "${ENRICHED_FILE}.tmp" "$ENRICHED_FILE"
  rm -f "$SUB_FILE" "$ITEM_FILE"
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
  --slurpfile items "$ENRICHED_FILE" \
  '{
    metadata: {
      owner: $owner,
      projectNumber: $number,
      projectId: $project_id,
      generatedAt: $generated_at
    },
    fieldDefinitions: $fields,
    items: $items[0]
  }' > "$OUTPUT_FILE"

echo "Wrote $(jq '.items | length' "$OUTPUT_FILE") items to $OUTPUT_FILE" >&2

# --- Step 5: Build pre-computed summary for agent efficiency ---
# This avoids the agent reading the full JSON multiple times to understand the structure.

SUMMARY_FILE="${OUTPUT_FILE%.json}-summary.json"

jq '
# Deduplicate items by issue number, keeping the occurrence with most subIssues
(.items | sort_by(.number) | group_by(.number) | map(sort_by(.subIssues | length) | last)) as $unique |
{
  generatedAt: .metadata.generatedAt,
  totalItems: ($unique | length),
  launches: [
    $unique[]
    | select(
        any(.labels.nodes[]?; .name == "launch") or
        (.title | test("^\\[Launch\\]"))
      )
    | {
        number,
        title,
        state,
        url,
        phase: .projectFields.Phase,
        targetDate: .projectFields["Target Date"],
        launchType: .projectFields["Launch Type"],
        riskLevel: .projectFields["Risk Level"],
        assignees: [.assignees.nodes[]?.login],
        labels: [.labels.nodes[]?.name],
        subIssues: (
          [.subIssues[]? | {
            number,
            title,
            state,
            labels: [.labels.nodes[]?.name],
            subIssues: (
              [.subIssues[]? | {
                number,
                title,
                state,
                updatedAt,
                assignees: [.assignees.nodes[]?.login]
              }]
            )
          }]
        ),
        stats: {
          totalTasks: ([.subIssues[]?.subIssues[]?] | length),
          closedTasks: ([.subIssues[]?.subIssues[]? | select(.state == "CLOSED")] | length),
          totalEpics: (.subIssues | length),
          closedEpics: ([.subIssues[]? | select(.state == "CLOSED")] | length)
        }
      }
  ],
  initiatives: [
    $unique[]
    | select(
        any(.labels.nodes[]?; .name == "initiative") or
        (.title | test("^\\[Initiative\\]"))
      )
    | {
        number,
        title,
        state,
        assignees: [.assignees.nodes[]?.login],
        childLaunchNumbers: [.subIssues[]?.number]
      }
  ]
}' "$OUTPUT_FILE" > "$SUMMARY_FILE"

echo "Wrote summary to $SUMMARY_FILE" >&2

# Cleanup
rm -f "$ITEMS_FILE" "$ENRICHED_FILE"
