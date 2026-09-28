# Claude Cowork plugin

Install the four Agentics Beyond Code skills together, with their references,
blank templates, and repository workflow examples.

| Skill | Try asking |
|---|---|
| Org Work Sensing | “Assess the bottlenecks in these team work exports before we automate anything.” |
| Non-Coder Agentic Workflow Builder | “Set up workflows and blank operating docs for our product ops team in this folder.” |
| Claude-Native Workflow Builder | “Port the Friday feedback trends report to a Claude scheduled task.” |
| Agentic Workflows | “Help me debug this GitHub Agentic Workflow.” |

## Install in Cowork

1. Obtain a plugin ZIP from a maintainer, or build it below.
2. In Claude Desktop, open **Cowork → Customize → Plugins** and use the custom
   plugin upload option to select `agentics-beyond-code-0.1.5.zip`.
3. Start a task, select your working folder, and ask for one of the examples
   above. Type `/` to inspect the available plugin skills.
4. Connect your own services only when needed. You can start an assessment
   with local exports; this plugin does not bundle credentials or connectors.

UI labels and organization policies can vary. See Anthropic's
[installation guide](https://support.claude.com/en/articles/13837440-use-plugins-in-claude).

The plugin provides instructions and source examples. Installing it does not
turn on GitHub Actions, create Routines, or schedule Cowork tasks. GitHub
implementation requires access to the target repository and `gh`/`gh aw` in a
suitable environment; compilation is not claimed when those tools are absent.
The upstream GitHub skill fetches additional instructions from `github/gh-aw`,
so that route requires network access.

Bundled workflows are a release snapshot, not a live checkout. Ask for current
upstream sources or supply a checkout when freshness matters. Demo artifacts
are examples, not evidence about your team. Generated work belongs in your
selected workspace, not the installed plugin directory.

## Marketplace and Claude Code

The repository serves as a plugin marketplace. Add `chrizbo/agentics-beyond-code` as a GitHub marketplace wherever
your Claude client supports personal repository marketplaces. The catalog is
`.claude-plugin/marketplace.json` and points to the repository root.

In Claude Code:

```text
/plugin marketplace add chrizbo/agentics-beyond-code
/plugin install agentics-beyond-code@agentics-beyond-code
```

For local development, launch Claude Code from a separate test folder with
an absolute path to the source checkout:

```bash
claude --plugin-dir /absolute/path/to/agentics-beyond-code
```

This checks behavior outside the repository and avoids duplicate discovery
from the repository's `.claude/skills` links.

Organization-managed GitHub syncing has different requirements: on github.com,
Anthropic currently requires a private or internal marketplace repository.
Do not assume this public repository can be connected directly as an
organization-managed marketplace. Use a manual organization ZIP upload or a
suitable private marketplace repository. See the
[organization distribution guide](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization).

## Updates and release status

ZIP installations do not pull changes from this repository. Upload the new ZIP,
check the installed version, and start a fresh task. Preserve any personal plugin
customizations separately before replacing an installation. In manual organization
marketplaces, uploading the same plugin name replaces its previous version;
personal Desktop replacement behavior should be checked in the installed client.
If it retains the old version, remove that installation and install the new ZIP.

Version 0.1.5 prepares the listing README and submission notes; skill behavior
is unchanged from the v0.1.4 smoke-tested package. The public directory listing
remains pending; see [submission preparation](anthropic-submission.md).

Version 0.1.4 retains the v0.1.3 repository refresh and tightens porting guidance:
keep the requested execution surface, edit configuration in one place, and read
bundled provenance. These behavioral changes need a fresh Cowork smoke test.

Version 0.1.3 incorporates the repository upgrade at `d260242`, including the
upstream gh-aw skill snapshot and compiled workflows on v0.89.21, while retaining
the Cowork guidance improvements. Earlier ZIPs remain snapshots of the older
repository. The plugin's version is independent of the gh-aw version.
See [Codex workflow compatibility](codex-workflows.md) for the GitHub runtime
validation; that validation does not establish Cowork plugin behavior.

The ZIP includes `.claude-plugin/build-info.json`: the base Git commit, gh-aw
skill version, and SHA-256 hashes of packaged source files. Local edits can be
included, so the base commit alone is not an exact content identifier. File
hashes identify the bytes; deterministic ZIP timestamps are not source dates.
This generated metadata is specific to ZIP builds, not marketplace installs.

Before public distribution:

1. Commit and review the plugin changes against current main; publish the
   marketplace files only when ready for people to install them.
2. Build from that clean checkout, validate the ZIP, and run the regression
   prompts below in a fresh Cowork task. Include the upstream GitHub skill,
   whose dispatcher changed in the repository upgrade.
3. Publish the exact tested ZIP with release notes and its checksum. Keep older
   ZIPs available for rollback. Do not overwrite a released version with new bytes.

No automatic release publishing is configured. A CI build and release-asset
upload can be added later; installation currently relies on a maintainer-built
ZIP or the marketplace after publication.

## Build and validate

Requires Python 3 and Git. From the repository root:

```bash
python3 .github/scripts/build-claude-plugin.py
.github/scripts/sync-agent-skills.sh --check
```

The ZIP appears under `dist/` (ignored by Git). The builder reads tracked
working-tree files, plus the plugin manifest and this guide, and preserves the
repository layout so relative references work. Stage any new reference files
before building. The build fails if any skill resource would be omitted.
Discovery symlinks, the marketplace catalog, Git history,
untracked files, and previous build output are excluded. No generated skill
copies are maintained. Workflow files in the archive are reference material;
Claude does not run them as GitHub Actions.

When Claude Code is installed, also run:

```bash
claude plugin validate .
claude plugin validate .claude-plugin/marketplace.json
```

Before distributing a release, upload the ZIP into Cowork and confirm all four
skills appear. Test an assessment with a local export and a setup request in an
empty output folder; check that templates resolve and examples are not treated
as the user's data. The package checks do not replace this client smoke test.

Edit canonical skills under `.github/skills/` and leave the discovery links
alone. Keep the upstream `agentic-workflows/SKILL.md` unchanged except when
refreshing its gh-aw snapshot. Bump `version` in `.claude-plugin/plugin.json`
for every distributed update, rebuild, smoke-test, and share the new ZIP.

Format references: [plugin reference](https://code.claude.com/docs/en/plugins-reference)
and [marketplaces](https://code.claude.com/docs/en/plugin-marketplaces).

## Guidance regression checks

Use a fresh Cowork task for each check after installing an updated package.
These are behavioral checks; reading a skill successfully does not establish
that the resulting assessment or plan is correct.

| Request | Expected behavior |
|---|---|
| Assess five unowned requests, three waiting two weeks for approval, and two completed with stale statuses; use only these facts. | Report counts without assuming overlap or prevalence. Keep approval policy and causes unknown. Do not rule out capacity or assert a bottleneck without context. Qualify recommendations and readiness as well as findings. Do not total overlapping groups, invent cleanup effort, assume missing recorded owners means no accountability, or prescribe closure without verification. |
| Port the bundled Friday Feedback Trends Report to a scheduled task; draft only. | Read the source and identify the package snapshot. Preserve the reporting destination or explain alternatives as choices. Distinguish session access from product limitations. Reconcile every input with its producer, use target URLs, and retain no-op/incomplete outcomes. Keep Cowork as the requested surface; label a Routine as a separate alternative. Use one explicit implementation path, a single configuration block consumed by every command, and valid commands. Read build-info.json for available provenance; cite inspected capability evidence or label it unverified. Exit on empty input before analysis; include every branch in the outcome list. Bound capability research and leave unverified run status unresolved. Do not activate anything. |
| Use agentic-workflows to explain how to design a workflow, without creating one. | Load the upgraded dispatcher and its upstream designer prompt; disclose missing network access if it cannot be fetched. Do not activate or install anything. |
| Explain differing skill snapshot and compiled workflow versions. | Consult `docs/skills.md`; explain that versions can differ, without claiming drift is required or compatibility is proven. Do not prescribe an unverified upgrade target or downgrade. |
| Create only blank strategy and how-we-work docs with no folder connected. | Prepare attachments if supported and report local saving as pending. Keep placeholders, omit other scaffolding, and do not choose an external destination. |
| Save those two docs into a connected empty test folder. | Save under its `docs/`, verify exact template copies, and report actual paths. |

For port plans, also check any claims about scheduling, timezone behavior,
connector operations, permissions, and ownership against the tools and current
official documentation available to that Cowork session. Record unresolved
capabilities as prerequisites rather than promising an executable plan.
