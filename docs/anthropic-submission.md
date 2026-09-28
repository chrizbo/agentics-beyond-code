# Anthropic directory submission preparation

Updated for v0.2.1. This is preparation, not an accepted listing.

## Source fields

| Portal field | Value |
|---|---|
| Type | Plugin bundle |
| Repository | `chrizbo/agentics-beyond-code` |
| Plugin path | **`plugins/agentics-beyond-code`** |
| Branch | `main` |
| Name | `agentics-beyond-code` |
| Author | Chris Butler |
| License | MIT |
| Support | https://github.com/chrizbo/agentics-beyond-code/issues |

Use the account or organization intended to own the listing long term. Confirm
the contact email and compliance declarations as the submitting owner.

## Response to root-package validation

Validation of `main@a34e86b` with an empty plugin path found a valid manifest,
four skills, acceptable size, and a valid name/publisher. It also found 44
credential policy holds, a missing icon, and eight unneeded symlink warnings.

The new package changes the actual distribution boundary: it includes only
regular skill/reference/template files, a PNG icon, a README/license, and a
public source index. It does not distribute integration scripts, Actions source
or compiled workflows, demo data, or discovery links. The canonical repository
retains those files for GitHub use. We have not renamed token variables, hidden
URLs, or obfuscated examples to bypass review.

Some earlier findings concerned first-party credentials sent to their own service
(e.g. Google Calendar or GitHub). One flagged TOKEN_SCAN_LIMIT, a numeric setting
in the workflow-health script. The cross-file finding combined a calendar helper
with a porting skill; neither that helper nor any executable integration code is
in the new plugin. If a finding remains, inspect its exact source and disclose the
behavior rather than asserting that every earlier finding was a false positive.

The plugin retrieves selected public reference files from GitHub when needed for
an explicitly requested port/setup. The index pins their revision and hashes.
Those files may describe credential-using runtimes; retrieval does not execute
them. Implementing and activating those runtimes requires separate user-directed
configuration. This external dependency is disclosed in the package README and
source-access guide and must remain disclosed in the submission.

## Privacy disclosure

The package README links to the bundled [Privacy notice](../plugins/agentics-beyond-code/docs/privacy.md).
The portal accepts a README Privacy link; no additional manifest field is needed.

## Draft data-handling answers

- **Personal data:** potentially yes. Work artifacts supplied by users or
  authorized tools may contain names, messages, or customer feedback.
- **Storage:** no plugin-operated backend or analytics. Generated documents can
  persist in the chosen workspace; Claude and connected services govern their
  own retention. Do not promise zero retention.
- **External destinations:** public reference reads go to GitHub (including
  raw.githubusercontent.com); official capability documentation reads go to
  Anthropic. No credentials or private work data are needed for those requests.
  Further work-system access depends on the user task and authorized tools.
- **Credentials:** none are bundled, requested by plugin configuration, or
  automatically read. No hooks or MCP servers are registered. Reference code is
  not a reason to collect a credential. Implementation requires explicit setup
  for the selected external runtime.
- **Audience:** workplace operators and team leads, not designed for children.
  Confirm all portal answers and terms rather than treating this draft as an
  attestation on the owner's behalf.

## Remaining steps

1. Publish this package and use the source fields above in the existing draft
   if the portal permits editing its path. If it does not, follow the portal's
   draft-management controls before creating a corrected submission. Do not
   submit the repository root again.
2. Select Validate. Review the new commit and path shown in the result, and fix
   any blocking findings. New policy holds still require reviewer consideration.
3. Review listing details from the dedicated package README. Run the 0.2.0 smoke
   tests in [the plugin guide](claude-cowork-plugin.md), particularly external
   source retrieval and missing-network behavior.
4. Confirm contact, data handling, and compliance declarations. Submit for review
   when ready. Neither submission nor acceptance is implied by this document.
5. Keep automatic publishing off initially. A passing version still follows the
   listing's reviewer/publication controls. Publish only the version tested.

Local tests cover canonical-copy equality, absent runtime/discovery paths,
provenance, generated-file drift and symlink rejection, and reproducible ZIPs.
Portal validation of v0.2.0 at c39749c passed all seven checks with no policy
holds and one non-blocking icon warning. Revalidate v0.2.1 after the privacy
notice update. Claude CLI validation has not run.

[Submission process](https://claude.com/docs/plugins/submit) ·
[Checklist](https://claude.com/docs/plugins/pre-submission-checklist) ·
[Ownership](https://claude.com/docs/directory/publish)
