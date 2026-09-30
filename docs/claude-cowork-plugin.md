# Claude Cowork plugin

The installable plugin lives in `plugins/agentics-beyond-code/`. It contains seven
skills, references, blank templates, a source index, and the project icon.
Canonical skills remain in `.github/skills/`; the installed directory is generated
and checked for drift. Do not edit generated copies directly.

## Install

The plugin is listed in Anthropic's plugin directory. Open the
[directory listing](https://claude.ai/new#customize/plugins/id/0fc0c7e1-2215-4ba4-8c5f-c791333cbee4%40anthropic-plugin-directory) while signed in to Claude, or go to
**Customize → Plugins** and search for **Agentics Beyond Code**.

Some Claude environments don't show directory plugins. In that case, add the
repository marketplace `chrizbo/agentics-beyond-code` in Claude's plugin settings
(**Customize → Plugins → Add marketplace**), then install `agentics-beyond-code`.
Alternatively, build or download `agentics-beyond-code-0.6.0.zip` and use the
custom ZIP upload option. Start a new task, type `/` to find the skills, and select
a writable folder when creating files.

[Claude installation guide](https://support.claude.com/en/articles/13837440-use-plugins-in-claude)

For Claude Code:

```text
/plugin marketplace add chrizbo/agentics-beyond-code
/plugin install agentics-beyond-code@agentics-beyond-code
```

For local testing from a separate working directory:

```bash
claude --plugin-dir /absolute/path/to/agentics-beyond-code/plugins/agentics-beyond-code
```

## Microsoft 365 builder in 0.6.0

Adds `microsoft-365-agent-builder`, planner routing, and documentation for
Microsoft 365 Agent Builder, Copilot Studio, and Power Automate. Includes
licensing and identity checks, deployment guidance, and static validation
scenarios. Live tenant deployment remains untested. See [usage](skills.md#using-the-microsoft-365-agent-builder).

## Google Workspace builder in 0.5.1

The package adds `google-workspace-agent-builder` for adapting repository
workflows into Google Workspace Studio flows and skills. Before drafting it
chooses the Google surface from the team's Workspace edition, add-ons, admin
settings, and Studio run quota, and can recommend a skill alone, Apps Script,
Gemini Enterprise, a hybrid with GitHub, or the Claude-native builder instead.
It follows the Atlassian builder's patterns: the flow gathers inputs and
performs writes, Gemini only reasons, and a fallback branch writes nothing on a
bad response. The planner now offers Google Workspace as a platform.
Deployment guidance is documentation-derived; no live Studio test has been
recorded. See [usage](skills.md#using-the-google-workspace-agent-builder).

Also in 0.5.1:

- **A shared guide for reading workflow sources.** The planner's
  `references/reading-workflow-sources.md` is used by every builder. Schedules
  that this demo repository paused with a `(disabled — re-enable …)` marker are
  now ported as the intended cadence, turned off, with guidance for turning
  them on. Before, builders ported them as manual-only. The guide also marks
  the freshness check as demo scaffolding and asks builders to name the
  workflows that consume a port's output.
- **Google and Atlassian builder fixes** from a reviewed decision-log draft:
  - the flow, not the model, builds names and duplicate keys and enforces the
    source's per-run limit
  - the fallback covers any unparseable response
  - a missing-access case must end differently from an empty one
  - no notifications the source didn't send
  - dropped settings are described with plain-language rewrites
- **Directory listing.** The plugin README now points to the Claude plugin
  directory listing instead of saying the listing is pending.

## Atlassian builder in 0.5.0

The package adds `atlassian-agent-builder` for adapting repository workflows
into Rovo agents with Jira or Confluence automation. Writes go through
automation actions, and titles, dates, and duplicate checks are computed by
the flow rather than the agent. The planner now offers Atlassian as a
platform. Deployment guidance is documentation-derived; no live Rovo test has
been recorded. Draft behavior was checked with five CLI prompts (label-triggered
triage, scheduled status page, chat-only assumption surfacing, planner routing,
and Rovo versus Claude-native routing). See
[usage](skills.md#using-the-atlassian-agent-builder).

## Skill reorganization in 0.4.0

Skills now follow one path: assess, design, then build on a platform.

- `org-work-sensing` became the Assess mode of `agentic-workflow-planner`.
- `non-coder-agentic-workflow-builder` was split. Workflow selection moved to
  the planner's Design mode, and GitHub setup is now `github-workflow-builder`.
- The upstream `agentic-workflows` dispatcher is no longer packaged. It only
  fetched instructions from `github/gh-aw` and competed with the GitHub
  builder. It remains in the repository for Copilot and gh-aw users.

Prompts that name an old skill should use the new name. Start a fresh task
after updating. See the [skills demo script](skills-demo-script.md) for a
walkthrough of each skill.

## Productboard builder in 0.3.0

The package adds `productboard-agent-builder` for adapting repository workflows
into Spark skills and creating them through an available signed-in browser.
It includes native scheduling guidance and dated field-test findings, but no
Productboard connector, credentials, or background execution service.
See [usage and testing](skills.md#using-the-productboard-agent-builder) for example
prompts, prerequisites, and the distinction between packaging checks and live tests.

## What changed in 0.2.0

Earlier versions packaged the entire repository. Directory validation of v0.1.5
reported 44 credential policy holds, eight unused discovery symlink warnings,
and a missing icon. The directory now receives only the generated plugin folder:
no integration scripts, compiled GitHub Actions, demo data, or discovery symlinks.
The supplied PNG icon is declared in the manifest. This reduces the package's
actual capabilities and scope; it does not disguise or rename credential use.

**Workflow examples are now external source references.** For a port, the skills
read a user-supplied checkout or fetch selected public files at the revision in
`source-index.json`. This needs network access or a checkout. Assessment references
and blank templates remain local. Failed source retrieval must be reported, not
filled in from memory. No code is fetched or executed at installation.

The plugin has no credential configuration, MCP servers, hooks, or automatic
runtime. If implementation is requested later, the chosen runtime's credentials
and dependencies must be configured explicitly. See the installed README and
`docs/source-access.md` for data handling and source resolution.

## Build, check, and release

Requires Python 3 and Git with the pinned source commit available locally.
Packaging metadata and the icon are maintained in `packaging/claude/`; the root
`.claude-plugin/marketplace.json` points to the generated directory.

After editing canonical skills or packaging inputs:

```bash
python3 .github/scripts/build-claude-plugin.py --sync
.github/scripts/sync-agent-skills.sh --check
python3 .github/scripts/build-claude-plugin.py --check
python3 -B .github/scripts/test-claude-plugin.py
```

`--sync` regenerates the directory and creates the ZIP under ignored `dist/`.
`--check` detects stale, missing, extra, or symlinked package files. A normal build
without flags checks the generated directory before packaging it. The ZIP and
checked-in directory have identical contents; changing the Git index does not
change package membership. Unrelated repo files never enter the payload.

Keep `plugins/agentics-beyond-code/` committed for marketplace and directory
installation. Increase the version in `packaging/claude/plugin.json` for each
release; commit both canonical changes and regenerated output. Never overwrite
an already distributed release. Publish a versioned ZIP and SHA-256 checksum.

To update reference workflows, change `packaging/claude/source.json` to the full
public commit SHA to use, then regenerate. The source index is built from that
Git revision, not a hand-maintained workflow summary. Package content hashes and
external file hashes are recorded separately; there is no self-referential build
commit that changes on each regeneration.

If Claude Code is available, also run:

```bash
claude plugin validate plugins/agentics-beyond-code
claude plugin validate .claude-plugin/marketplace.json
```

These checks do not replace the directory portal's validation. Submit with plugin
path **`plugins/agentics-beyond-code`**, not the repository root. See
[submission preparation](anthropic-submission.md). Organization-managed GitHub
marketplaces have different repository visibility requirements; consult the
[organization guide](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization).

## Smoke tests for 0.2.0

Use fresh tasks after installation. The packaging change needs renewed testing.

| Request | Expected behavior |
|---|---|
| Use agentic-workflow-planner to assess five unowned requests, three waiting two weeks for approval, and two completed with stale statuses. | Reads the local reference; does not total overlapping groups or invent effort, causes, or team-wide conclusions. |
| Copy only blank strategy and how-we-work docs to a connected empty folder. | Reads bundled templates, preserves placeholders, reports actual saved paths and exact-copy verification. |
| Draft a Cowork Scheduled Task port of Friday Feedback Trends Report using the plugin's recorded source; do not activate anything. | Reads the source index and fetches the pinned workflow and needed dependencies. Identifies them as external, keeps the requested surface, uses one configuration block, and reports unverified runtime prerequisites. |
| Repeat the source-based port with network unavailable and no checkout. | Explains the missing source and requests the relevant files or a checkout; does not fabricate a port or claim to read bundled workflows. |

0.1.4/0.1.5 tests established previous behavior. They do not validate 0.2.0's new
external-source path. Portal findings may remain and need an honest response;
no zero-findings result is promised.

## Smoke tests for 0.4.0

| Request | Expected behavior |
|---|---|
| Assess our team's readiness for agentic workflows from these exported issues. | Uses the planner's Assess mode and names readiness gaps before recommending workflows. |
| What workflows do I need for customer feedback? We live in Slack. | Uses the planner's Design mode, selects existing feedback workflows, and names a platform per workflow with a reason. With no other evidence, expect Claude-native; if the conversation showed records in GitHub, expect GitHub with Slack delivery. |
| Set up the decision log workflow in our GitHub repo; draft only. | Uses `github-workflow-builder`; fetches gh-aw guidance from `github/gh-aw` since `agentic-workflows` isn't installed. |
| Type `/` in a fresh task. | Shows seven Agentics Beyond Code skills (six in 0.5.1, five in 0.5.0, four in 0.4.0) and no `agentic-workflows`. |

## 0.4.0 test run (2026-09-29)

All five scenes in the [skills demo script](skills-demo-script.md) were run
with `claude --plugin-dir` from an empty folder. Each run's output was checked
against the source workflows. These are bounded observations from one
machine, not guarantees.

| Scene | Result | Skill changes made from the run |
|---|---|---|
| 1. Planner, Assess | Pass. Separated evidence from inference, recognized fixture data, stopped before recommending workflows. | Demo script needs a plugin-mode prompt naming the repo, and `gh auth refresh -s read:project`. |
| 2. Planner, Design | Pass. Kept analysis on GitHub (where Scene 1 found the records) with Slack as the delivery surface. | Platform guidance now separates where analysis runs from where people read results. |
| 3. GitHub builder | Pass after fixes. First run copied a Projects dependency the user excluded and a compiled `.lock.yml`. | Adapt workflows to the user's constraints; never copy lock files; ask which AI provider the org uses and set `engine:`. |
| 4. Claude-native builder | Pass after fixes. Early runs ran a `find /` disk scan (triggering macOS privacy prompts), made open-ended web searches, used gh-aw config names, and left placeholder steps in prompts. | No file-system scans in any skill; tiered verification (no web lookups for drafts); complete prompt blocks; jargon self-check; failures stay as visible as in the original. |
| 5. Productboard builder | Pass after fixes. Claimed the skill was read-only "mechanically," omitted the revision, and nested code fences. | No "by construction" enforcement claims; name the revision; use longer outer fences. |

Not yet tested: reading sources from the pinned revision. With `--plugin-dir`
inside a checkout, the skills correctly use the checkout instead. Install
from the ZIP outside the repo to exercise the pinned path.

Scene 1 also surfaced a workflow bug unrelated to the skills:
`create-work-item.md` adds `feedback:converted` without removing
`feedback:needs-pm-review`.

## v0.2.2 review checks

Repeat the draft-only Friday Feedback port in a fresh session. Confirm that the
source index is read as a path-keyed object, ambiguous writes stop for
reconciliation rather than automatic retry, and the target strategy is read
without assuming five numbered tradeoffs. The source pin is unchanged.
