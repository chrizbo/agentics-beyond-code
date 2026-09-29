# Agentics Beyond Code

A community plugin for product managers, operations leads, and teams who want
to assess how work flows, improve operating documents, and design useful
agentic workflows. It is not an official Anthropic integration.

## Five skills

- **Org Work Sensing:** assess supplied work artifacts, distinguish evidence
  from inference, and identify practical improvements.
- **Non-Coder Agentic Workflow Builder:** create blank operating docs and plan
  or build a GitHub-based workflow setup in your chosen workspace.
- **Claude-Native Workflow Builder:** adapt existing workflows or design new
  Claude Scheduled Task and Routine plans, preserving human decision points.
- **Agentic Workflows:** route GitHub workflow design and debugging to the
  upstream gh-aw instructions.
- **Productboard Agent Builder:** adapt workflows into Spark instructions, create
  skills through the browser when requested, and configure supported schedules.

## Try it

Start a fresh task and select a writable folder when creating files.

- “Use org-work-sensing to assess these exported requests. Use only the supplied evidence.”
- “Copy only the blank strategy and how-we-work templates into my test folder.”
- “Draft a Cowork Scheduled Task port of the Friday Feedback Trends Report. Read its recorded source; don't activate anything.”

- “Use productboard-agent-builder to draft a Spark skill named assumption-surfacer from the source workflow. Return analysis in chat; do not deploy yet.”

Productboard deployment requires browser automation and a signed-in workspace;
this plugin supplies neither access nor credentials. Browser creation and native
scheduling were exercised in one workspace. Event/webhook triggering remains
unverified. See the bundled [field observations](.github/skills/productboard-agent-builder/references/observed-productboard-behavior.md)
for the tested behavior and limitations. Request deployment and schedule activation
explicitly; installing this plugin does not perform either.

Templates and skill references are included. Runtime workflows, integration
scripts, compiled Actions, and demo data are not. For source-based work, the
skills use your supplied checkout or retrieve selected public files from the
revision in `source-index.json`; see [source access](docs/source-access.md).
Without network access or a checkout, workflow porting remains incomplete.
The GitHub dispatcher also retrieves upstream instructions from `github/gh-aw`.

## Installation and prerequisites

Install through the `chrizbo/agentics-beyond-code` repository marketplace or
upload the release ZIP using Claude's custom plugin upload option. Type `/` to
find the skills. A public directory listing is pending validation and review.

This plugin does not install command-line tools, configure credentials, connect
services, or activate automations. Implementing a workflow may require a separate
target repository, tools, and user-authorized service access. Drafts require
validation before production use. Start with local exports and blank templates.

## Data handling

[Privacy](https://github.com/chrizbo/agentics-beyond-code/blob/main/plugins/agentics-beyond-code/docs/privacy.md)


There is no hosted backend, telemetry, bundled credential, or registered MCP
server. Assessments may read personal information in artifacts you supply.
Generated files persist where you choose to save them; Claude and connected
services apply their own retention policies. Public-source and product-documentation
reads go to GitHub, Anthropic, and Productboard. Do not send private work artifacts in those
requests. Additional work-system access depends on your requested task and
explicitly authorized tools, not plugin installation.

## Living documents

Keep strategy, decisions, and operating agreements current as work changes.
The plugin's blank templates help teams maintain their own documents; external
repository examples are reference material, not facts about your organization.

## Your Habits Are Already Triggers

Design around the places where your team already reviews and decides on work.
Do not move the team's reporting destination merely to fit an automation tool.

## Updates and support

Use new versioned releases rather than replacing the contents of old ZIPs.
After an update, start a fresh task and verify the installed version. Preserve
personal customizations separately. Directory and marketplace update behavior
depends on the installation route.

[Source and releases](https://github.com/chrizbo/agentics-beyond-code) ·
[Report an issue](https://github.com/chrizbo/agentics-beyond-code/issues)

MIT licensed. Chris Butler. The GitHub Agentic Workflows dispatcher is maintained
upstream by GitHub Next; its snapshot version is preserved with that skill.
