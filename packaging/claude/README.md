# Agentics Beyond Code

A community plugin for product managers, operations leads, and teams who want
to assess how work flows, improve operating documents, and design useful
agentic workflows. It is not an official Anthropic integration.

## Six skills

The skills follow one path: assess, design, then build where your team works.

- **Agentic Workflow Planner:** start here. Assess supplied work artifacts,
  distinguishing evidence from inference, then design the smallest useful set
  of workflows and choose where each should run.
- **GitHub Workflow Builder:** create blank operating docs and build a
  GitHub-based workflow setup in your chosen workspace.
- **Claude-Native Workflow Builder:** adapt existing workflows or design new
  Claude Scheduled Task and Routine plans, preserving human decision points.
- **Productboard Agent Builder:** adapt workflows into Spark instructions, create
  skills through the browser when requested, and configure supported schedules.
- **Atlassian Agent Builder:** adapt workflows into Rovo agents with Jira or
  Confluence automation for schedules, events, and workflow transitions.
  Deployment guidance is documentation-derived and not yet field-tested.
- **Google Workspace Agent Builder:** check the team's Workspace edition,
  admin settings, and Studio run quota, then adapt workflows into Workspace
  Studio flows and skills, or recommend a better-fitting Google or Claude option.
  Deployment guidance is documentation-derived and not yet field-tested.

Renamed in 0.4.0: Org Work Sensing is now the planner's Assess mode, and the
Non-Coder Agentic Workflow Builder is split between the planner's Design mode
and the GitHub Workflow Builder. The upstream gh-aw dispatcher skill is no
longer packaged; the GitHub builder fetches gh-aw instructions directly.

## Try it

Start a fresh task and select a writable folder when creating files.

- “Use agentic-workflow-planner to assess these exported requests. Use only the supplied evidence.”
- “Use agentic-workflow-planner to recommend workflows for our customer feedback process. We live in Slack.”
- “Copy only the blank strategy and how-we-work templates into my test folder.”
- “Draft a Cowork Scheduled Task port of the Friday Feedback Trends Report. Read its recorded source; don't activate anything.”

- “Use productboard-agent-builder to draft a Spark skill named assumption-surfacer from the source workflow. Return analysis in chat; do not deploy yet.”
- “Use atlassian-agent-builder to adapt Intake Triage into a Rovo agent for Jira project KEY. Draft only; do not deploy.”
- “Use google-workspace-agent-builder to adapt the weekly status report for our Business Starter domain. Draft only.”

Productboard deployment requires browser automation and a signed-in workspace;
this plugin supplies neither access nor credentials. Browser creation and native
scheduling were exercised in one workspace. Event/webhook triggering remains
unverified. See the bundled [field observations](.github/skills/productboard-agent-builder/references/observed-productboard-behavior.md)
for the tested behavior and limitations. Request deployment and schedule activation
explicitly; installing this plugin does not perform either.

Atlassian deployment likewise requires a signed-in site with Rovo, and this
plugin supplies no Atlassian access or credentials. No live Rovo test has been
recorded yet; the builder marks site behavior it has not verified.

Google Workspace deployment requires a signed-in account on an eligible
Workspace edition with Gemini turned on. Some steps also need admin settings
that the builder names but never changes. No live Studio test has been recorded yet.

Templates and skill references are included. Runtime workflows, integration
scripts, compiled Actions, and demo data are not. For source-based work, the
skills use your supplied checkout or retrieve selected public files from the
revision in `source-index.json`; see [source access](docs/source-access.md).
Without network access or a checkout, workflow porting remains incomplete.
The GitHub builder also retrieves gh-aw authoring instructions from `github/gh-aw`.

## Installation and prerequisites

Install from the [Claude plugin directory](https://claude.ai/new#customize/plugins/id/0fc0c7e1-2215-4ba4-8c5f-c791333cbee4%40anthropic-plugin-directory)
(or search **Agentics Beyond Code** under **Customize → Plugins**), through the
`chrizbo/agentics-beyond-code` repository marketplace, or by uploading the
release ZIP using Claude's custom plugin upload option. Type `/` to find the
skills.

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
reads go to GitHub, Anthropic, Productboard, Atlassian, and Google. Do not send private work artifacts in those
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

MIT licensed. Chris Butler. GitHub Agentic Workflows is maintained upstream by
GitHub Next.

## Microsoft 365

Use `microsoft-365-agent-builder` to adapt a workflow into a Microsoft 365 agent
and Copilot Studio or Power Automate automation. Tenant access, licensing,
connectors, and execution identity determine the surface. Drafting does not
activate execution; deployment guidance has not yet been field-tested.
