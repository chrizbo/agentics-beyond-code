# Claude Cowork plugin

The installable plugin lives in `plugins/agentics-beyond-code/`. It contains four
skills, references, blank templates, a source index, and the project icon.
Canonical skills remain in `.github/skills/`; the installed directory is generated
and checked for drift. Do not edit generated copies directly.

## Install

In Claude's plugin settings, add the repository marketplace
`chrizbo/agentics-beyond-code`, then install `agentics-beyond-code`. Alternatively,
build or download `agentics-beyond-code-0.2.2.zip` and use the custom ZIP upload
option. Start a new task, type `/` to find the skills, and select a writable folder
when creating files. A directory listing has not been approved.

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
| Use org-work-sensing with five unowned requests, three waiting two weeks for approval, and two completed with stale statuses. | Reads the local reference; does not total overlapping groups or invent effort, causes, or team-wide conclusions. |
| Copy only blank strategy and how-we-work docs to a connected empty folder. | Reads bundled templates, preserves placeholders, reports actual saved paths and exact-copy verification. |
| Draft a Cowork Scheduled Task port of Friday Feedback Trends Report using the plugin's recorded source; do not activate anything. | Reads the source index and fetches the pinned workflow and needed dependencies. Identifies them as external, keeps the requested surface, uses one configuration block, and reports unverified runtime prerequisites. |
| Repeat the source-based port with network unavailable and no checkout. | Explains the missing source and requests the relevant files or a checkout; does not fabricate a port or claim to read bundled workflows. |
| Use agentic-workflows to explain workflow design without creating anything. | Loads the upstream dispatcher and relevant upstream instructions, or discloses unavailable network access. |

0.1.4/0.1.5 tests established previous behavior. They do not validate 0.2.0's new
external-source path. Portal findings may remain and need an honest response;
no zero-findings result is promised.

## v0.2.2 review checks

Repeat the draft-only Friday Feedback port in a fresh session. Confirm that the
source index is read as a path-keyed object, ambiguous writes stop for
reconciliation rather than automatic retry, and the target strategy is read
without assuming five numbered tradeoffs. The source pin is unchanged.
