# Anthropic directory submission preparation

Prepared September 28, 2026 for plugin v0.1.5. This document is preparation,
not evidence of acceptance or a completed submission.

## Source fields

| Portal field | Value |
|---|---|
| Submission type | Plugin bundle |
| Repository | `chrizbo/agentics-beyond-code` |
| Plugin path | Leave blank: `.claude-plugin/plugin.json` is at the repository root |
| Tracked branch | `main` |
| Name | `agentics-beyond-code` |
| Author | Chris Butler |
| License | MIT |
| Short description | Assess team workflows, build an operating repo, and design GitHub or Claude-native automations. |
| Support | https://github.com/chrizbo/agentics-beyond-code/issues |

The listing description is read from the root README. Submit from the Claude
account/organization that should own the listing long term. Confirm the contact
email in the portal; no contact address is assumed here.

## What this plugin contains

Four canonical skills under `.github/skills/`, supporting references, blank
operating templates, and repository examples. The manifest explicitly loads
that canonical directory. The `.agents/skills` and `.claude/skills` symlinks are
repository discovery conveniences, not the manifest's component paths. ZIP
builds omit these links. The directory scans the Git repository, not our ZIP.

No MCP servers, hooks, startup commands, telemetry, or hosted backend are
registered by the plugin. Bundled GitHub workflows and helper scripts are
reference material; installing the plugin does not activate them. Skills may
read or run relevant helpers when users request implementation. The upstream
GitHub skill retrieves additional instructions from `github/gh-aw`; porting
skills consult official product documentation for current capabilities.

## Draft data-handling answers to review in the portal

- **Reads personal data:** potentially yes. User-requested assessments can read
  work artifacts containing names, customer feedback, communications, or other
  personal information supplied locally or through authorized tools. Do not
  answer “no” merely because this is a skills-only plugin.
- **Stores data:** the plugin operates no storage service. Requested reports,
  drafts, and scaffolding can persist in user-selected files or work services.
  Claude conversation and tool retention follow the user's Claude arrangement;
  do not promise zero retention or a plugin-controlled deletion period.
- **External services:** there are no declared connectors. Instructions can
  fetch public documentation from GitHub and Anthropic. User-requested work can
  call GitHub APIs and other authorized work systems through available tools.
  Bundled integration examples also cover Slack and Google services. These
  destinations and credential needs must be disclosed for the selected task;
  “no declared connectors” does not mean “no external data transfers.”
- **Credentials:** none are bundled. Some reference scripts expect environment
  credentials such as GH_TOKEN when deliberately run. Do not put actual tokens
  in prompts, submission notes, or this repository.
- **Audience:** workplace operators and team leads; not designed for children.
  Confirm the portal's under-18 question and all compliance declarations as the
  submitting owner rather than treating this draft as an attestation.

## Validation and known review considerations

The local skill-link check, reproducible ZIP build, archive integrity, canonical
resource equality, and provenance hash checks have passed during development.
User-run Cowork tests verified GitHub skill loading, assessment behavior,
conditional port planning, and exact template copies outside the repository.
The v0.1.4 port remained conditional: future-run credentials and executable
integration behavior were not tested. These skills draft implementations;
they do not guarantee that generated automations are production-ready.

Claude Code's optional `claude plugin validate .` was not run because its CLI
was unavailable. The portal's Validate step is required and has not run.
Name availability, scanning, and directory compatibility remain unverified.

The plugin root is the entire repository to preserve relative resource paths.
Review considerations include environment-token references in helper scripts
and discovery symlinks outside the declared skill path. The directory checklist
can hold credential-related content for review and warn on unused symlinks.
If validation identifies a loaded symlink or another blocker, resolve the finding
before submission; do not claim the ZIP's exclusions apply to repository scans.
The manifest loads regular canonical skill files. No OS metadata or ZIPs are
tracked; `.gitattributes` only marks compiled workflows as generated for GitHub.

## Portal steps still required

1. Open https://claude.ai/directory/manage using the intended owner account and
   connect a GitHub identity with push access to the repository.
2. Select Submit new → Plugin bundle. Enter the source fields above and Validate.
3. Review each finding. Fix blocking findings in the repository, push, and
   revalidate the resulting commit. Review listing details from the README.
4. Review the data-handling answers, supply the contact email, and personally
   confirm the directory terms and compliance acknowledgements.
5. Choose update delivery. Scheduled checking avoids adding a GitHub webhook;
   a push webhook is optional and requires repository admin access. Keep
   auto-publish off initially so new releases can be reviewed deliberately.
6. Submit for review. After approval, follow the portal's publication step.
   Neither submission nor publication has been performed by this preparation.

Every future commit on tracked `main` may trigger a directory scan. Increase the
plugin version for released changes, including changes to bundled workflows.
A passing scan does not necessarily publish automatically: reviewer controls
and the listing's publication settings apply. Keep the existing listing rather
than creating duplicate submissions for updates.

## Official references

- [Submission procedure](https://claude.com/docs/plugins/submit)
- [Pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist)
- [Eligibility and listing ownership](https://claude.com/docs/directory/publish)
