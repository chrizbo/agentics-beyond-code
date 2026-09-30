# ChatGPT and Codex plugin

The generated package lives in `plugins/chatgpt/agentics-beyond-code/`. It shares
seven canonical skills with the Claude package and uses the same release version
from `packaging/claude/plugin.json`. OpenAI presentation metadata lives in
`packaging/chatgpt/plugin.json`. Do not edit generated copies.

The build relocates `.github/skills/` to `skills/`, adjusts package-root depth
and the living-documents README link, and preserves all other skill content.
Source access, privacy, license, icon, and the pinned source index are shared.
No connectors, credentials, or running automation are included.

## Build and validate

```bash
python3 -B .github/scripts/build-claude-plugin.py --sync
python3 -B .github/scripts/build-chatgpt-plugin.py --sync
python3 -B .github/scripts/build-chatgpt-plugin.py --check
python3 -B .github/scripts/test-chatgpt-plugin.py
```

The current archives are `dist/agentics-beyond-code-0.5.2.zip` for Claude and
`dist/agentics-beyond-code-0.5.2-chatgpt.zip` for ChatGPT/Codex. The latter has a
SHA-256 sidecar. Validate the OpenAI manifest with the plugin-creator skill's
`scripts/validate_plugin.py plugins/chatgpt/agentics-beyond-code` where available.

## Local testing and marketplaces

OpenAI supports personal and repository marketplaces for local testing in
supported desktop/Codex clients. A local marketplace is not a public listing,
and it is not automatically available in ChatGPT web/mobile or another user's
workspace. This change does not install a marketplace in your account.

To register locally, ask the built-in plugin creator to add the generated folder
at `plugins/chatgpt/agentics-beyond-code` (supply its absolute path) to your
personal marketplace. It must point to that existing folder, preserve other
entries, and validate the catalog. Then install the plugin and start a fresh
chat. A typical personal catalog is `~/.agents/plugins/marketplace.json`.

Test the Microsoft skill with the prompt in the package README. Also check that
the planner finds its references and that a selected source workflow can be
retrieved via `source-index.json` without a local checkout. These live client
checks have not yet been performed; offline checks cover packaging only.

## Public directory and workspace sharing

The [universal public plugin directory](https://developers.openai.com/plugins/deploy/submission)
is shared by ChatGPT and Codex. From its linked submission portal:

1. Choose the owning organization/project and verified developer identity.
2. Upload `agentics-beyond-code-0.5.2-chatgpt.zip`.
3. Resolve metadata and skill scan findings, complete the listing, and submit.
4. Publish after approval. Generating the ZIP does not submit or publish it.

Check the current submission requirements for public metadata and publisher
verification; local validation does not establish listing eligibility. This is
a skills-only package. Current guidance does not support adding an MCP server
to an already submitted skills-only plugin, so decide that scope before the
first public submission if a hosted integration is planned.

For private team distribution, workspace admins can publish to their workspace
where enabled. This is separate from both a local marketplace and the public
directory. See [packaging and distribution](https://developers.openai.com/plugins/build/plugins).
