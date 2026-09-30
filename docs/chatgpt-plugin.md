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

The current archives are `dist/agentics-beyond-code-0.5.3.zip` for Claude and
`dist/agentics-beyond-code-0.5.3-chatgpt.zip` for ChatGPT/Codex. The latter has a
SHA-256 sidecar. Validate the OpenAI manifest with the plugin-creator skill's
`scripts/validate_plugin.py plugins/chatgpt/agentics-beyond-code` where available.

## Install on a Mac

You do not need a public directory listing to try the plugin locally. Use a
supported Codex or ChatGPT desktop client with plugin creation/installation
available. Python 3 and Git are needed only if building from this checkout.

1. From the repository checkout, run the build commands above. Alternatively,
   extract `agentics-beyond-code-0.5.3-chatgpt.zip` into a folder named
   `agentics-beyond-code`. Keep the hidden `.codex-plugin` directory and all
   bundled `skills/`, `docs/`, and assets together.
2. Copy the absolute path of the generated or extracted plugin folder. For a
   checkout, it is `<checkout>/plugins/chatgpt/agentics-beyond-code`.
3. In Codex, use the following prompt. Replace the path before sending. In
   ChatGPT Work, select `@Plugin Creator` if that tool is available to you.

```text
Use plugin-creator to install the existing plugin at
/absolute/path/to/agentics-beyond-code into my personal local marketplace
and enable it. Preserve its existing skills and manifest, keep release version
0.5.3, and preserve my other marketplace entries. Do not publish it.
```

4. Follow any filesystem or workspace permission prompts. The installer should
   report the actual marketplace name and successful installation. Personal
   marketplaces normally use `~/.agents/plugins/marketplace.json`; do not
   overwrite that file or assume its name is `personal` if it already exists.
5. Start a fresh chat. In Codex select `$microsoft-365-agent-builder`; in ChatGPT
   select the installed plugin with `@`. If the desktop plugin list is stale,
   restart the app and check again.

A local marketplace is a desktop testing/distribution source, not a public
listing. It does not automatically make the plugin available in ChatGPT web,
mobile, or another workspace. Availability can differ by client and workspace.
The repository's `.claude-plugin/marketplace.json` points to the Claude package;
register the ChatGPT package explicitly rather than assuming that catalog
installs this variant. These docs do not install a marketplace in your account.

## First test

```text
Use microsoft-365-agent-builder to design a weekly status report. We track work
in GitHub Issues and communicate in Teams. Assume Microsoft 365 Business
Standard, with Copilot licenses unknown. Keep records in GitHub. Draft only;
explain the licensing requirements and do not deploy anything.
```

Expect a conditional licensing recommendation, GitHub as the record system,
and a draft flow with approval, duplicate handling, and trigger state. No
Microsoft connection is needed for this design-only test. Live setup requires
appropriate tenant access and separate authorization.

Also try the planner and one source-based port: confirm bundled references
resolve and the selected source can be retrieved through `source-index.json`
without a local checkout. Local Mac installation and user-observed no-project drafting and source-reading
smoke tests passed for 0.5.2. The source retrieval first failed and then succeeded
on a follow-up; all five reported source hashes were independently checked
against the pinned Git objects. See the
[smoke-test record](../.github/skills/microsoft-365-agent-builder/references/observed-microsoft-behavior.md).
Public upload and live tenant deployment remain untested.

## Updating and troubleshooting

- After editing canonical skills, regenerate both packages. Rebuilding a ZIP
  does not refresh an installed cached copy.
- Ask plugin-creator to refresh the existing installation from its actual local
  marketplace and preserve the `0.5.3` release prefix. Its development update
  procedure can add a `+codex.<cachebuster>` suffix to a local installed-source
  copy. Keep that development suffix out of the canonical release manifest and
  release ZIPs. Reinstall, then start a new chat.
- If the plugin is missing, check the registered source folder, marketplace
  installation result, enabled state, and workspace permissions. Do not look
  for a public listing: none has been published yet.
- If a skill cannot find references, confirm the entire package was installed,
  rather than a standalone `SKILL.md` file.
- If source retrieval fails, supply the selected workflow or a checkout. A
  connection failure is not proof that the workflow has no data.

Follow the current [official local packaging guidance](https://developers.openai.com/plugins/build/plugins)
when client controls differ from these instructions.

## Public directory and workspace sharing

The [universal public plugin directory](https://developers.openai.com/plugins/deploy/submission)
is shared by ChatGPT and Codex. From its linked submission portal:

1. Choose the owning organization/project and verified developer identity.
2. Upload `agentics-beyond-code-0.5.3-chatgpt.zip`.
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

### Submission troubleshooting

Version 0.5.3 adds a published privacy-policy URL to the manifest and describes
functions without naming other AI assistants in the listing. The seven platform
skills remain included. The policy link is pinned to a public commit so it is
available before release and remains stable after branch cleanup.

If the portal asks for a privacy-policy URL, use `interface.privacyPolicyURL`
from the packaged `.codex-plugin/plugin.json`. Verify it opens without signing
in. Re-upload the rebuilt ZIP and rerun the metadata checks. Wait for all seven
skill scans to finish; successful local packaging checks do not confirm portal
approval. Report any remaining findings separately.
