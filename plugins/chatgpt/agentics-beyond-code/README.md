# Agentics Beyond Code

Seven skills for assessing team workflows, designing agentic processes, and
building them on GitHub, Claude, Productboard, Atlassian, Google Workspace, or
Microsoft 365. This is the ChatGPT/Codex package, generated from the repository's
canonical skills. Service connections, licenses, and automation runtimes are
configured separately; installing it does not activate workflows.

## Install on a Mac

Keep this entire folder together, including `.codex-plugin/plugin.json` and
`skills/`. In Codex, paste the following prompt with this folder's absolute
path; in ChatGPT Work, select `@Plugin Creator` if available.

```text
Use plugin-creator to install the existing plugin at
/absolute/path/to/agentics-beyond-code into my personal local marketplace
and enable it. Preserve its files and my other marketplace entries, keep
release version 0.5.3, and do not publish it.
```

After successful installation, start a new chat. In ChatGPT select the plugin
with `@`; in Codex select `$microsoft-365-agent-builder` or another bundled skill.
Restart the desktop app if its plugin list remains stale. Client availability
and workspace permissions can differ. Local installation does not automatically
install the plugin in ChatGPT web/mobile or another workspace.

## Try it

"Use microsoft-365-agent-builder to design a weekly status report for a team
using GitHub Issues and Teams. Assume Microsoft 365 Business Standard, with
Copilot licenses unknown. Keep records in GitHub. Draft only and explain
licensing requirements; do not deploy anything."

Expect a plan-aware draft with GitHub as the record system. No tenant connection
is needed for a draft. Live deployment remains untested.

## Updates

A new ZIP does not update a cached installation. Ask plugin-creator to refresh
this package from the actual local marketplace, then start a fresh chat. Keep
release version 0.5.3; any development cachebuster belongs only to a local copy.
If references are missing, verify that the entire package was installed.
There is no public OpenAI listing yet. Local validation and public approval are
separate. See the repository's ChatGPT plugin guide for build and release steps.

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
