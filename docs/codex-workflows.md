# Codex workflow configuration

ABC runs Codex inside GitHub Agentic Workflows (gh-aw). The runtime, model,
inference provider, and workflow permissions are separate choices. This guide
records the configuration audit prompted by the
[gh-aw Codex article](https://github.github.com/gh-aw/engines/codex/).

## Committed configuration

All 27 workflows now pin gh-aw **v0.89.21** and Codex CLI **0.154.0**, using
OpenAI API credentials. The upgrade replaces the previous mixed v0.79.6 /
v0.88.7 baseline and aligns setup tooling and the upstream skill. v0.89.21 was
the latest stable [release](https://github.com/github/gh-aw/releases/tag/v0.89.21)
checked on September 24, 2026.

The model distribution remains 11 `gpt-5-mini`, 8 `gpt-4o`, and 8 `gpt-5-codex`.
Model pins are retained pending runtime evidence.

The article's general-purpose-model warning appears in its **Copilot-backed
inference** section. It does not establish that the existing OpenAI-backed
configurations fail. [OpenAI's model documentation](https://learn.chatgpt.com/docs/models)
also distinguishes API-key availability from ChatGPT sign-in availability.
Validate the exact model, provider, and CLI version used by Actions.

This inventory is a static configuration review. Compilation checks schema and
generated policy; it does not test account access, model tool behavior, or
output quality. No live inference comparison was performed for this audit.

| Workflow | Model | Shell declaration | Why the current prompt needs shell |
|---|---|---|---|
| [adversarial-pm](../.github/workflows/adversarial-pm.md) | `gpt-5-mini` | Explicit `*` | Read pre-fetched decisions and strategy; inspect existing comments. |
| [assumption-surfacer](../.github/workflows/assumption-surfacer.md) | `gpt-5-mini` | Explicit `*` | Read issue labels and content with gh. |
| [calendar-load-report](../.github/workflows/calendar-load-report.md) | `gpt-4o` | Explicit `*` | Query pre-fetched calendar data and prepare report content. |
| [calendar-strategy-audit](../.github/workflows/calendar-strategy-audit.md) | `gpt-5-codex` | Explicit `*` | Query calendar data, strategy, and PR evidence; prepare proposed artifacts. |
| [chaos-monkey](../.github/workflows/chaos-monkey.md) | `gpt-4o` | Explicit `*` | Read precomputed signals, strategy, and repository history. |
| [commitment-reconciler](../.github/workflows/commitment-reconciler.md) | `gpt-5-codex` | Explicit `*` | Query launch data and inspect recent repository evidence. |
| [compliance-review](../.github/workflows/compliance-review.md) | `gpt-5-codex` | Explicit `*` | Read review policies, launch data, and issue context. |
| [compliance-team-reports](../.github/workflows/compliance-team-reports.md) | `gpt-4o` | Explicit `*` | Query launch data and prepare report content. |
| [create-work-item](../.github/workflows/create-work-item.md) | `gpt-5-mini` | Explicit `*` | Read policy files and issue/project context. |
| [daily-standup-prep](../.github/workflows/daily-standup-prep.md) | `gpt-4o` | Explicit `*` | Query launch data and prepare standup content. |
| [decision-log](../.github/workflows/decision-log.md) | `gpt-4o` | Explicit `*` | Read source context and prepare decision files for a PR. |
| [feedback-dedupe-triage](../.github/workflows/feedback-dedupe-triage.md) | `gpt-5-mini` | Explicit `*` | Read feedback JSON and strategy. |
| [friday-feedback-trends-report](../.github/workflows/friday-feedback-trends-report.md) | `gpt-5-mini` | Explicit `*` | Query pre-fetched feedback and launch JSON. |
| [gtm-content](../.github/workflows/gtm-content.md) | `gpt-5-codex` | Explicit `*` | Read launch data and writing policy; prepare draft content. |
| [gtm-team-reports](../.github/workflows/gtm-team-reports.md) | `gpt-5-codex` | Explicit `*` | Query launch data and prepare report content. |
| [intake-triage](../.github/workflows/intake-triage.md) | `gpt-5-codex` | Explicit `*` | Read issue context, strategy, and scoring policy. |
| [launch-readiness](../.github/workflows/launch-readiness.md) | `gpt-5-codex` | Explicit `*` | Query launch data and readiness policy. |
| [leadership-brief](../.github/workflows/leadership-brief.md) | `gpt-4o` | Explicit `*` | Read leader policies and query portfolio evidence. |
| [process-analyzer](../.github/workflows/process-analyzer.md) | `gpt-4o` | Explicit `*` | Read operating docs, transcripts, and git history; prepare proposed edits. |
| [sample-data-launch-creator](../.github/workflows/sample-data-launch-creator.md) | `gpt-5-mini` | Explicit `*` | Query launch summaries for bounded demo creation. |
| [sample-data-simulator](../.github/workflows/sample-data-simulator.md) | `gpt-5-mini` | Explicit `*` | Read demo context and prepare fixture changes for a PR. |
| [slack-context-processor](../.github/workflows/slack-context-processor.md) | `gpt-5-mini` | Explicit `*` | Read fixture files, launch JSON, and issue comments. |
| [slack-reaction-intake](../.github/workflows/slack-reaction-intake.md) | `gpt-5-mini` | Explicit `*` | Run the local candidate parser and check existing issues. |
| [strategy-alignment](../.github/workflows/strategy-alignment.md) | `gpt-5-codex` | Explicit `*` | Read strategy and work evidence; prepare proposed strategy edits. |
| [transcript-processor](../.github/workflows/transcript-processor.md) | `gpt-5-mini` | Explicit `*` | Read transcripts, launch JSON, and repository context. |
| [weekly-status](../.github/workflows/weekly-status.md) | `gpt-5-mini` | Explicit `*` | Read policy and query pre-fetched launch data and comments. |
| [workflow-health](../.github/workflows/workflow-health.md) | `gpt-4o` | Explicit `*` | Read the precomputed health summary and query detailed run data. |

Update this inventory and [model sizing](how-it-works.md#model-sizing) when
changing engine settings. The `.md` frontmatter and generated `.lock.yml` are
the configuration source of truth.

## Shell access and boundaries

All current prompts depend on shell access, either for local data and policy
files, GitHub CLI reads, or preparing local files for safe outputs. Omitting
`tools.bash` does not disable Codex's shell. All workflows now explicitly
declare `bash: ["*"]` to preserve their shell-dependent behavior. This allows
unrestricted command selection inside the workflow sandbox; it is not a
per-command allowlist.

The current upstream engine guide says Codex cannot enforce a nonempty
per-command `tools.bash` allowlist. Do not describe a list such as `cat`, `jq`,
and `gh` as a security boundary, or treat a prompt's read-only instruction as
an enforced shell restriction. Shell can be disabled entirely on supporting
gh-aw releases, but that requires rewriting shell-dependent prompts and
verifying the generated Codex configuration first. Do not disable it on these
workflows without providing equivalent data access.

Keep the existing ABC pattern when adding or changing workflows:

1. Collect and summarize data in deterministic pre-steps with scoped
   credentials. Have the agent read the small summary before drilling down.
2. Keep agent GitHub permissions read-only. Use gh-proxy, the firewall, and
   declared network access; keep privileged fetch credentials in pre-steps.
3. Route external mutations through bounded safe outputs and their separate
   jobs. Local file preparation for a PR is distinct from publishing it.
4. Preserve each workflow's output limits, duplicate checks, and intentional
   no-op behavior. For a required report, validate that it produced the
   required artifact or an explicit incomplete result.

The v0.89.21 migration defaults `min-integrity: none` workflows to disabled
shell and local MCP when shell access is unspecified. That automatic change
would break ABC's existing shell examples. Explicit shell declarations retain
the prior execution capability and gh-proxy read path; integrity thresholds,
network policies, and safe-output limits remain unchanged.

The `codex` network ecosystem used by two workflows is supported by this
release. Compile with the pinned version when validating engine-specific
network and tool settings.

## Web search and plugins

No current ABC workflow declares `tools.web-search` or `plugins`. The pinned
compiler explicitly disables native web search when it is not requested.
Keep portfolio reports grounded in their repository and pre-fetched evidence.
If a future workflow needs external research, declare it explicitly and define
source, freshness, and citation requirements.

The compiler now emits `plugins = false` in the generated agent configuration
for every workflow because none declares plugins. This implements the article's
startup behavior without manual lock-file edits. Direct MCP configuration is
a separate capability. Verify generated settings again when adding plugins or
upgrading the compiler.

## Upgrade adjustments

The v0.89.21 upgrade refreshed all compiled workflows, action pins, maintenance
workflow, setup tooling, and the upstream dispatcher skill and agent. Alongside
the explicit shell declarations:

- The Slack and calendar custom outputs now place their five-minute timeout
  on the actual write step. The newer custom-job schema rejects the former
  job-level field; the generated job retains the compiler's enclosing timeout.
- Intake Triage's conclusion concurrency uses the same issue/run discriminator
  as its workflow group, avoiding a shared slot for unrelated manual dispatches.
- Model choices, triggers, existing integrity policies, and bounded output
  behavior are preserved. New inference credential names appearing in generated
  manifests are optional compiler capabilities, not a switch of billing provider.

## Evaluating a model or provider change

Use [the setup guide](setup.md#optional-codex-with-github-copilot-inference) for
the optional Copilot billing route. The following procedure applies to both
model changes and provider changes:

1. Select representative cases: Weekly Status for summary transformation and
   Strategy Alignment for judgment and proposed edits. Include missing/stale
   data, empty input, duplicates, and conflicting evidence alongside a normal
   case. Preserve the input snapshot, policy files, commit, and reporting window.
2. Establish a baseline from run artifacts. Record actual observed model and
   provider, compiler/CLI versions, run URL, success or failure, required safe
   output, wall time, input/cached/output tokens, and pricing date/coverage.
3. Change one variable at a time in a trial branch or sandbox repository. Keep
   the same inputs and budgets. Compile with the repository-pinned gh-aw:

   ```bash
   gh aw compile weekly-status strategy-alignment --strict --staged
   ```

   Inspect generated locks for read permissions, network policy, model/provider
   wiring, staged safe outputs, and threat-detection credentials. Staging is a
   trial setting: restore source-derived locks with ordinary strict compilation
   before delivering a production change. Use fixtures and disable separate
   publisher workflows in the sandbox so a trial cannot trigger downstream
   Slack, Docs, or calendar publication.
4. Run baseline and candidate against the preserved cases in that sandbox.
   `gh aw audit <run-id>` and Workflow Health provide operational evidence.
   Check source-linked claims, policy adherence, omissions, duplicates,
   appropriate no-op/incomplete behavior, and the intended artifact. For
   judgment cases, review the recommendation and its supporting evidence.
5. Reject candidates with incorrect or missing outputs even if cheaper. Report
   quality results alongside duration, usage, sample count, and failures. Repeat
   enough cases to distinguish a consistent improvement from a single lucky run.
6. Adopt only after the evidence supports the change. Commit both source and
   regenerated locks; retain the previous pins and run references for rollback.

### Cost interpretation

Workflow Health's checked-in rate table has an effective date. It is an
estimate, not current billing truth. Unknown models (including the currently
unlisted `gpt-4o` and `gpt-5-codex`), absent model telemetry, and mixed-model
totals remain unpriced. They must not silently inherit `gpt-5.5` pricing.
Provider-qualified names must remain intact in token parsing; Copilot usage
must not be costed as OpenAI API usage.

`tokenRunsObserved` counts runs with usage, while `costRunsPriced` and
`costRunsUnpriced` describe pricing coverage. Null cost means unavailable;
zero is only a measured/priced value. Aggregate priced costs are partial when
coverage is incomplete. Projections are withheld when observed usage contains
unpriced runs or multiple model names. Verify rates and provider billing
before drawing a purchasing or model-selection conclusion.

## Local validation

```bash
python3 .github/scripts/test-workflow-health-data.py
gh aw compile --strict --no-emit
.github/scripts/sync-agent-skills.sh --check
git diff --check
```

Use gh-aw v0.89.21. Compilation does not execute models or publish artifacts.
After changing a workflow, regenerate its lock with `gh aw compile <workflow-id> --strict`. Future compiler upgrades should follow the
[upstream skill synchronization procedure](skills.md).
