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
| `OPENAI_API_KEY` | Yes | OpenAI API key used by the Codex engine |
| `CODEX_API_KEY` | Optional | Alternative Codex engine secret. If present, gh-aw uses it before `OPENAI_API_KEY` |
| `AW_TOKEN` | Yes | PAT with access to the Launch Tracker and Intake Triage projects — used by pre-steps and project updates |

The `GITHUB_TOKEN` needs these permissions (configured in the workflow frontmatter):
- `contents: read` — read repo files (policy files, scripts)
- `issues: read` — read issues and sub-issues
- `pull-requests: read` — read linked PRs
- `discussions: read` — read existing discussions

Write operations (creating discussions) are handled by `safe-outputs` in a separate secured job — the agent job itself stays read-only.

### Setting up OpenAI for Codex

The workflows use the gh-aw Codex engine (`engine: codex`), so model usage is billed to the OpenAI account associated with the API key you store as a repository secret.

1. Create an OpenAI API key from your OpenAI Platform account.
2. Add it as a repository secret:

```bash
gh aw secrets set OPENAI_API_KEY --value "<your-openai-api-key>"
```

You can also use GitHub's standard secret command:

```bash
gh secret set OPENAI_API_KEY
# Paste your OpenAI API key when prompted
```

If you prefer a Codex-specific secret name, set `CODEX_API_KEY` instead. The compiled workflows check `CODEX_API_KEY` first, then fall back to `OPENAI_API_KEY`.

> **Security review note:** switching from Copilot to Codex adds `CODEX_API_KEY` and `OPENAI_API_KEY` as restricted secrets and allows outbound access to OpenAI domains such as `api.openai.com`. Review these generated lock-file changes in PRs before merging.

### Setting up `AW_TOKEN`

The pre-step script fetches data from GitHub Projects via GraphQL, which requires the `read:project` scope. The default `GITHUB_TOKEN` doesn't include this scope, so you need a PAT:

1. Create a **fine-grained PAT** at [github.com/settings/tokens](https://github.com/settings/tokens?type=beta)
   - Repository access: your `agentics-beyond-code` repo
   - Permissions: **Projects → Read and write** if workflows should add or update project items, or **Read-only** if you only run reporting workflows
   - The token owner must be able to access the user or organization project, not just the repository
2. Or create a **classic PAT** with the `read:project` scope. Add `project` as well if workflows should update project items.
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

## Using Agent Skills

This repo ships with reusable skills that help people set up and maintain
Agentics Beyond Code without needing to start from workflow syntax.

| Skill | Use it for | Canonical path | Local mirror |
|-------|------------|----------------|--------------|
| Non-Coder Agentic Workflow Builder | Turn team/process problems into a recommended workflow set, blank operating docs, policies, and repo folders | `.github/skills/non-coder-agentic-workflow-builder/SKILL.md` | `.claude/skills/non-coder-agentic-workflow-builder/SKILL.md` |
| Agentic Workflows | Create, update, debug, compile, and validate GitHub Agentic Workflows | `.github/skills/agentic-workflows/SKILL.md` | `.claude/skills/agentic-workflows/SKILL.md` |

The `.github/skills/` copy follows the GitHub skills convention used by
`gh skill` and by repositories such as `github/gh-aw`. The `.claude/skills/`
copy is kept in sync so local Claude-style agents can use the same guidance
without extra installation steps.

For a new non-coding team, start with the Non-Coder Agentic Workflow Builder.
Give it the problems you want to solve, the artifacts you already use, and how
aggressive you want automation to be. It will map those needs to this repo's
workflow catalog and scaffold blank `docs/strategy.md`, `docs/how-we-work.md`,
`decisions/`, `transcripts/`, `.github/policies/`, `.github/workflows/`, and
`.github/ISSUE_TEMPLATE/` as needed.

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

By default, workflows read project `1` owned by the repository owner. If your
Launch Tracker project has a different owner or number, set repository
variables:

```bash
gh variable set LAUNCH_PROJECT_OWNER --body "<project-owner>"
gh variable set LAUNCH_PROJECT_NUMBER --body "<project-number>"
```

### 4. Create an Intake Triage project

Create a second GitHub Project (Projects V2) to track incoming feature requests and bug reports. Add these custom fields:

| Field | Type | Options |
|-------|------|---------|
| **RICE Score** | Text | — |
| **Request Type** | Single select | Feature Request, Bug Report |
| **Kano Category** | Single select | Must-be, One-dimensional, Attractive, Indifferent |
| **RICE Level** | Single select | High, Medium, Low |

Set up the **Status** field with these options:

| Status | Purpose |
|--------|---------|
| **Needs Triage** (default) | New items awaiting triage |
| **Needs More Info** | Incomplete submissions — bot has asked follow-up questions |
| **Triaged** | Fully scored and assessed |
| **Duplicate** | Duplicate of an existing issue |
| **Accepted** | Accepted into the backlog |
| **Deferred** | Not now — revisit later |

> **Important:** Set "Needs Triage" as the default status value so items added by workflows are always visible in your views, even if the workflow fails to set the status.

Create two views:
- **Needs Triage** — filter: `status:"Needs Triage","Needs More Info"`
- **Triaged** — filter: `status:Triaged,Duplicate,Accepted,Deferred`

### 5. Create labels

The following labels are used by workflows. Create them in your repository:

**Issue type labels:**
- `initiative` — strategic initiative
- `launch` — shippable launch milestone
- `epic` — workstream within a launch
- `blocker` — blocking issue

**State labels:**
- `at-risk` — launch is at risk
- `ready-for-review` — ready for domain team review

**Domain tracking labels (workflow-managed, `ai:` prefix):**
- `ai:needs:security`, `ai:needs:privacy`, `ai:needs:accessibility`, `ai:needs:responsible-ai`
- `approved:security`, `approved:privacy`, `approved:accessibility`, `approved:responsible-ai`

**Compliance labels (workflow-managed, `ai:` prefix):**
- `ai:compliance-review` — marks compliance review sub-issues (auto-created by workflow)

**GTM labels (workflow-managed, `ai:` prefix):**
- `ai:gtm` — marks go-to-market content sub-issues (changelog drafts, roadmap items)

**Transcript labels (workflow-managed, `ai:` prefix):**
- `ai:meeting-discussed` — marks issues that were discussed in a meeting transcript (auto-created by workflow)

**Report labels:**
- `report`, `launch-readiness`

**Intake triage labels:**
- `triage-needed` — marks an issue for automated triage (auto-applied by the intake issue template)
- `triaged` — triage complete (added by workflow)
- `needs-more-info` — submission is incomplete (added by workflow)
- `duplicate` — duplicate of an existing issue (added by workflow)
- `rice:high`, `rice:medium`, `rice:low` — RICE score level (added by workflow)
- `kano:must-be`, `kano:one-dimensional`, `kano:attractive`, `kano:indifferent` — Kano category (added by workflow)
- `aligns-with-current` — aligns with an active initiative or launch (added by workflow)

### 6. Create issues using templates

Use the built-in issue templates to create properly structured issues:
- **Initiative** — for strategic goals spanning multiple launches
- **Launch** — for shippable milestones (the primary unit of work)
- **Intake Request** — for submitting new feature requests or bug reports for triage

Link launches as sub-issues of initiatives, and epics/tasks as sub-issues of launches.

### 7. Add issues to your project

Add your initiative, launch, epic, and task issues to the Launch Tracker project. Set the Phase and Target Date custom fields on each launch.

### 8. Create directories for decision log and transcript workflows

```bash
# Create the directories (with .gitkeep so they're tracked)
mkdir -p decisions transcripts
touch decisions/.gitkeep transcripts/.gitkeep
git add decisions/.gitkeep transcripts/.gitkeep
git commit -m "Add decisions and transcripts directories"
```

- **`/decisions/`** — Decision record markdown files are created here by the Decision Log workflow via PR
- **`/transcripts/`** — Drop `.txt` or `.vtt` meeting transcripts here to trigger the Transcript Processor workflow

### 9. Compile and run workflows

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

The `fetch-launch-data.sh` script defaults to project number `1` owned by the
repository owner. If your project has a different owner or number, set the
repository variables instead of editing every workflow:

```bash
gh variable set LAUNCH_PROJECT_OWNER --body "<project-owner>"
gh variable set LAUNCH_PROJECT_NUMBER --body "<project-number>"
```

Then update any `safe-outputs.update-project.project` URLs that should write to
that project and recompile with `gh aw compile`.
