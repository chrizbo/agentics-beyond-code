# Agentics Beyond Code

Seven skills for assessing team workflows, designing agentic processes, and
building them on GitHub, Claude, Productboard, Atlassian, Google Workspace, or
Microsoft 365. This is the ChatGPT/Codex package, generated from the repository's
canonical skills. Service connections, licenses, and automation runtimes are
configured separately; installing it does not activate workflows.

## Try it

Install through a supported local marketplace or import into your workspace
using the plugin controls available to you. In ChatGPT select the plugin with
an @ mention; in Codex select a bundled skill with a $ mention. Start a new chat
following installation. Availability and workspace permissions can differ.

Try: "Design a weekly status report for a team using GitHub Issues and Teams.
Assume Microsoft 365 Business Standard, with Copilot licenses unknown. Keep
records in GitHub. Draft only and explain licensing requirements."

## Living documents

Start with readable strategy, decisions, and operating documents; automate
updates and evidence gathering around them, keeping human decision points.
See `docs/source-access.md` for retrieving selected source workflows and
`docs/privacy.md` for the package's data and credential boundaries.

## Distribution

This skills-only package uses the supported `.codex-plugin/plugin.json`
compatibility manifest and root `skills/` directory. It includes no hosted MCP
server. Local validation is not directory approval or a live ChatGPT test.

- [Local packaging and marketplaces](https://developers.openai.com/plugins/build/plugins)
- [Public plugin directory submission](https://developers.openai.com/plugins/deploy/submission)

The public directory is shared by ChatGPT and Codex. Upload the release ZIP to
the submission portal, resolve findings, submit for review, then publish after
approval. Workspace publication is a separate administrative operation.
