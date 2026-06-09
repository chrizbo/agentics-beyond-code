#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

skills=(
  "agentic-workflows"
  "non-coder-agentic-workflow-builder"
)

check_link() {
  local link_path="$1"
  local expected="$2"

  if [[ ! -L "$link_path" ]]; then
    echo "error: $link_path is not a symlink" >&2
    return 1
  fi

  if [[ "$(readlink "$link_path")" != "$expected" ]]; then
    echo "error: $link_path points to $(readlink "$link_path"), expected $expected" >&2
    return 1
  fi
}

create_links() {
  mkdir -p .agents/skills .claude/skills

  for skill in "${skills[@]}"; do
    ln -sfn "../../.github/skills/$skill" ".agents/skills/$skill"
    ln -sfn "../../.github/skills/$skill" ".claude/skills/$skill"
  done
}

validate_skills() {
  local validator="${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py"

  for skill in "${skills[@]}"; do
    local skill_file=".github/skills/$skill/SKILL.md"

    if [[ ! -f "$skill_file" ]]; then
      echo "error: missing $skill_file" >&2
      return 1
    fi

    if [[ -f "$validator" ]] && python3 -c "import yaml" 2>/dev/null; then
      python3 "$validator" ".github/skills/$skill"
    elif ! awk '
      NR == 1 && $0 == "---" { frontmatter = 1; next }
      frontmatter && /^name: / { name = 1 }
      frontmatter && /^description: / { description = 1 }
      frontmatter && $0 == "---" { exit !(name && description) }
      END { if (!name || !description) exit 1 }
    ' "$skill_file"; then
      echo "error: invalid or incomplete frontmatter in $skill_file" >&2
      return 1
    fi
  done
}

report_versions() {
  local snapshot installed latest setup actions

  snapshot="$(cat .github/skills/agentic-workflows/.upstream-version 2>/dev/null || true)"
  installed="$(gh aw --version 2>&1 | awk '{print $4}' || true)"
  latest="$(gh release view --repo github/gh-aw --json tagName --jq .tagName 2>/dev/null || true)"
  setup="$(awk '$1 == "version:" { print $2; exit }' .github/workflows/copilot-setup-steps.yml)"
  actions="$(jq -r '.entries | keys[] | select(startswith("github/gh-aw-actions/setup@")) | split("@")[1]' .github/aw/actions-lock.json 2>/dev/null | head -1)"

  echo "gh-aw versions: skill=${snapshot:-unknown} installed=${installed:-unknown} latest=${latest:-unknown} setup=${setup:-unknown} actions=${actions:-unknown}"
}

if [[ "${1:-}" == "--check" ]]; then
  for skill in "${skills[@]}"; do
    check_link ".agents/skills/$skill" "../../.github/skills/$skill"
    check_link ".claude/skills/$skill" "../../.github/skills/$skill"
  done
else
  create_links
fi

validate_skills
report_versions
