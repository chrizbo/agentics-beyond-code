# Getting Started

## Prerequisites

- [GitHub CLI](https://cli.github.com/) (`gh`)
- [Agentic Workflows CLI extension](https://github.com/github/gh-aw)

## Token & Permissions Requirements

Agentic workflows run as GitHub Actions. The following tokens/secrets are needed:

### For local development (gh CLI)

```bash
# Standard auth
gh auth login

# Add project scopes (required for launch tracker data fetching)
gh auth refresh -s read:project,project
```

### For GitHub Actions (repository secrets)

| Secret | Required | Purpose |
|--------|----------|---------|
| `GITHUB_TOKEN` | Automatic | Default Actions token — used for issue/PR reads and safe-outputs writes |
| `COPILOT_GITHUB_TOKEN` | Yes (for Copilot engine) | Token for the AI engine. Set up via `gh aw init` |
| `AW_TOKEN` | Yes | PAT with `read:project` scope — used by pre-steps to fetch project data via GraphQL |

The `GITHUB_TOKEN` needs these permissions (configured in the workflow frontmatter):
- `contents: read` — read repo files (policy files, scripts)
- `issues: read` — read issues and sub-issues
- `pull-requests: read` — read linked PRs
- `discussions: read` — read existing discussions

Write operations (creating discussions) are handled by `safe-outputs` in a separate secured job — the agent job itself stays read-only.

### Setting up `AW_TOKEN`

The pre-step script fetches data from GitHub Projects via GraphQL, which requires the `read:project` scope. The default `GITHUB_TOKEN` doesn't include this scope, so you need a PAT:

1. Create a **fine-grained PAT** at [github.com/settings/tokens](https://github.com/settings/tokens?type=beta)
   - Repository access: your `agentics-beyond-code` repo
   - Permissions: **Projects → Read-only**
2. Or create a **classic PAT** with the `read:project` scope
3. Add it as a repository secret:

```bash
gh secret set AW_TOKEN
# Paste your PAT when prompted
```

## Installation

```bash
# Install the GitHub CLI (if not already installed)
brew install gh   # macOS
# See https://cli.github.com/ for other platforms

# Authenticate with required scopes
gh auth login
gh auth refresh -s read:project,project

# Install the Agentic Workflows extension
gh extension install github/gh-aw

# Add project scopes (needed for launch tracker integration)
gh auth refresh -s read:project,project
```

## Setting Up Your Repository

### 1. Clone and initialize

```bash
gh repo clone chrizbo/agentics-beyond-code
cd agentics-beyond-code
gh aw init
```

### 2. Create a Launch Tracker project

Create a GitHub Project (Projects V2) to track your launches. Add these custom fields:

| Field | Type | Options |
|-------|------|---------|
| **Phase** | Single select | Team, Alpha, Beta, GA |
| **Target Date** | Date | — |
| **Launch Type** | Single select | Major, Minor, Patch, Internal |
| **Risk Level** | Single select | Low, Medium, High, Critical |

### 3. Create labels

The following labels are used by workflows. Create them in your repository:

**Issue type labels:**
- `initiative` — strategic initiative
- `launch` — shippable launch milestone
- `epic` — workstream within a launch
- `blocker` — blocking issue

**State labels:**
- `at-risk` — launch is at risk
- `ready-for-review` — ready for domain team review

**Domain tracking labels:**
- `needs:security`, `needs:privacy`, `needs:accessibility`, `needs:responsible-ai`
- `approved:security`, `approved:privacy`, `approved:accessibility`, `approved:responsible-ai`

**Compliance labels:**
- `compliance-review` — marks compliance review sub-issues (auto-created by workflow)

**GTM labels:**
- `gtm` — marks go-to-market content sub-issues (changelog drafts, roadmap items)

**Transcript labels:**
- `meeting-discussed` — marks issues that were discussed in a meeting transcript (auto-created by workflow)

**Report labels:**
- `report`, `launch-readiness`

### 4. Create issues using templates

Use the built-in issue templates to create properly structured issues:
- **Initiative** — for strategic goals spanning multiple launches
- **Launch** — for shippable milestones (the primary unit of work)

Link launches as sub-issues of initiatives, and epics/tasks as sub-issues of launches.

### 5. Add issues to your project

Add your initiative, launch, epic, and task issues to the Launch Tracker project. Set the Phase and Target Date custom fields on each launch.

### 6. Create directories for decision log and transcript workflows

```bash
# Create the directories (with .gitkeep so they're tracked)
mkdir -p decisions transcripts
touch decisions/.gitkeep transcripts/.gitkeep
git add decisions/.gitkeep transcripts/.gitkeep
git commit -m "Add decisions and transcripts directories"
```

- **`/decisions/`** — Decision record markdown files are created here by the Decision Log workflow via PR
- **`/transcripts/`** — Drop `.txt` or `.vtt` meeting transcripts here to trigger the Transcript Processor workflow

### 7. Compile and run workflows

```bash
# Compile all workflows
gh aw compile

# Run the launch readiness report
gh aw run launch-readiness

# View logs
gh aw logs launch-readiness
```

## Customizing Policies

Policy files live in `.github/policies/` and control how workflows assess your launches. Edit them to match your team's standards:

- **[launch-readiness-policy.md](../.github/policies/launch-readiness-policy.md)** — completeness thresholds, staleness windows, domain sign-off requirements, risk scoring
- **[security-review-policy.md](../.github/policies/security-review-policy.md)** — when security review is needed, review questions, checklist
- **[privacy-review-policy.md](../.github/policies/privacy-review-policy.md)** — when privacy review is needed, review questions, checklist
- **[accessibility-review-policy.md](../.github/policies/accessibility-review-policy.md)** — when accessibility review is needed, review questions, checklist
- **[responsible-ai-review-policy.md](../.github/policies/responsible-ai-review-policy.md)** — when responsible AI review is needed, review questions, checklist
- **[voice-and-tone-policy.md](../.github/policies/voice-and-tone-policy.md)** — how to write customer-facing content (changelog posts, roadmap items)

Policy changes take effect on the next workflow run — no recompilation needed.

## Updating the Project Number

The `fetch-launch-data.sh` script defaults to project number `1`. If your project has a different number, update the `steps:` section in the workflow file:

```yaml
steps:
  - name: Fetch launch data
    run: |
      ./.github/scripts/fetch-launch-data.sh "${{ github.repository_owner }}" YOUR_NUMBER launch-data.json
```

Then recompile with `gh aw compile`.
