# Google Workspace porting checklist

Documentation checked 2026-09-29. No field test has been recorded yet; see
[field observations](observed-google-workspace-behavior.md). Surface
availability, editions, and quotas are in [surfaces and plans](surfaces-and-plans.md).
Other unverified details, such as exact step names and variable syntax, are
listed under "Still unverified" in the field observations. Cite that list, or
say "unverified" without a source, rather than attributing them to this
checklist.

## Contract translation questions

| Source behavior | Decision for the adaptation |
|---|---|
| Schedule | Scheduled starter with an explicit timezone and lookback window. Writing a cadence in skill instructions does not schedule anything. Weekly and daily runs cost 4–31 runs a month. |
| Issue opened, labeled, or commented | Gmail starter on a label or sender condition, a Sheets row starter, or a Forms or Chat starter, with conditions reproducing the source's eligibility and exclusions. Estimate volume against the quota. |
| Human command | Invoking a Studio skill in Gemini in Workspace, or a manual starter. Name which and who can use it. |
| Project status change | A Sheets starter on a status column, or a custom starter. Verify the starter exists on the domain. |
| GitHub issue, label, project field | A Sheets row with columns of equivalent meaning, or a labeled email thread. Preserve guards or mark the port incomplete. |
| Repository strategy or policy | A current Doc the flow's account can read, passed to Ask Gemini or referenced by the skill. Do not adopt demo strategy as the team's strategy. |
| Script-generated input | Inspect the script's filters and joins; reproduce with flow steps, a Sheets query, or an Apps Script custom step. Do not pretend raw records are transformed inputs. |
| Comment, report, or item creation | A flow step fed by the Ask Gemini response: reply to email, send a Chat reply, create or update a Doc, add a Sheets row. Verify the exact step exists. |
| Cross-tool write (GitHub, Jira, Slack) | Integration step (beta), webhook, or custom step. Each needs admin enablement; name it. |
| Enforced write limits | Encode counts and targets as specific steps and conditions; state which remain model compliance. |
| Duplicate suppression | A Sheets lookup, Gmail label, or Doc title check before the write. Best effort; do not claim it prevents concurrent duplicates. |
| Human approval | A named person approves in the Approvals page, edits a draft, or changes a Sheet value. The flow may draft or recommend; it must not set the approving value itself. |
| Self-triggered loops | Exclude the flow's own outputs: skip messages from the flow account, apply a marker label the starter's conditions skip, or write to a different Sheet range than the starter watches. |

## Review the output as a procedure

Every required input needs an accessible source or named prerequisite. Use
consistent placeholders for domain, mailbox, label, Drive folder, Sheet,
Chat space, time window, and destination. Preserve links rather than
reconstructing them from titles. Keep credentials and webhook secrets out of
skill instructions and prompts.

Walk through these outcomes before calling the configuration ready:

- Valid evidence: produce the artifact within the inherited scope.
- Empty eligible input: report no eligible evidence and stop; ensure later
  steps do not send or publish an empty or invented report.
- Missing input or access: identify what is unavailable; do not treat a
  permission-filtered read as an empty dataset.
- Conflicting evidence: show sources and unresolved interpretations.
- Duplicate result: follow the source rule or an explicitly proposed policy.
- Quota reached: the flow stops until the daily reset; say what the owner sees
  and what is missed.
- Uncertain write: inspect the destination and the Studio Activity tab before
  retrying; report uncertainty rather than sending twice.

Record which scenarios were reviewed and whether verification was static or
performed in a Workspace domain. Repository validators prove file structure,
not Studio runtime behavior.

## Instruction quality before deployment

- Preserve the requested name throughout skill, flow, and messages.
- Distinguish mechanically enforced limits, source recommendations, and new
  adaptation choices.
- Give every branch one consistent outcome; stop only when missing input
  prevents meaningful analysis.
- When later steps use the response, define one exact output shape, including
  the empty case, and a fallback branch for malformed or unexpected responses
  that writes nothing and notifies the owner.
- Describe evidence as absent from the supplied material, not nonexistent.
  Preserve exact quotations. Label proposed reviewers as suggestions.
- When adapting analysis workflows such as assumption surfacing, include a
  negative case: a clearly labeled hypothesis with a validation plan should
  produce no high-risk findings. A no-findings result should not manufacture
  speculative missing considerations. Judge grounding and restraint, not a
  predetermined finding count.
- List every source guard that was dropped, including label-based exclusions.
- Keep the Drive, Gmail, and Chat scope as narrow as the workflow allows.
- Do not add claims the flow cannot establish, such as "nothing was changed".
