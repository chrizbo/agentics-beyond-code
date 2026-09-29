# Productboard porting checklist

## Product evidence

Documentation checked 2026-09-28. For deployment, start with the
[2026-09-29 field observations](observed-productboard-behavior.md) and verify
the relevant current controls. Research unresolved capabilities rather than
repeating a broad product survey.

[Spark skill documentation](https://support.productboard.com/hc/en-us/articles/51202982788755-Agentic-skills-with-Spark)
describes custom instructions, contextual or slash invocation, and disabled
triggers. Creation is under Main menu → Agent → Skills → Add Skill, or via
`/create-skill`. Supply name, description, and instructions; verify visibility
and trigger before saving. The page disagrees with itself about workspace
creation roles and script uploads: verify account controls; package scripts
for upload rather than promising editor support.

For requested archives, use `.zip` or `.skill` with `SKILL.md` at the root or
under one top-level folder. Resources must be UTF-8 text and direct children
of supported resource folders; nested resources are ignored. Documented limits
are 5 MB per archive, 100,000 characters for instructions, and 512 KB per
resource. Recheck these before packaging. Validate dependencies in Spark's
sandbox before promising script execution.

[Productboard MCP documentation](https://developer.productboard.com/reference/mcp-server)
describes external-agent access to specs, comments, and statuses under the
connected user's permissions. This does not establish arbitrary feedback,
roadmap, or skill-management access. Inspect actual operation schemas for the
chosen path when a capability recheck is warranted; use the browser default
for skill administration described in [direct deployment](create-in-productboard.md).

## Contract translation questions

| Source behavior | Decision for the adaptation |
|---|---|
| Schedule, issue event, or human command | Verify an equivalent trigger separately. Agent-selected skill invocation is not evidence of background scheduling. If cadence is unverified, label manual invocation as an alternative requiring acceptance. |
| GitHub issue, project field, label | Identify the actual Productboard entity and field with equivalent meaning; preserve guards and eligibility or mark the port incomplete. |
| Repository strategy or policy | Supply or reference an accessible, current document. Do not adopt demo strategy as the team's strategy. |
| Script-generated input | Inspect the script's schema, filters, joins, and deduplication. Attach matching exports or verify an equivalent retrieval path; do not pretend raw records are transformed inputs. |
| Report, comment, or item creation | Verify the exact write operation and destination. If unavailable, offer a draft artifact and identify the publishing step still needed. |
| Enforced write limits and permissions | Retain exact counts, allowed fields, and exclusions in instructions; state which controls are enforced by tools and which rely on model compliance. |
| Concurrency or duplicate suppression | Determine how the target detects prior results. Search-before-write is best effort; do not claim it prevents concurrent duplicates. |
| Human approval | Identify the approver and explicit action; distinguish draft generation from accepting work, assigning priority, or communicating commitments. |

## Review the output as a procedure

Every required input needs an accessible source or a named prerequisite. Use
consistent placeholders for workspace, entities, time window, and destination.
Preserve links rather than reconstructing them from names. Explain any export
transformation still to implement and keep credentials out of prompts.

Walk through these outcomes before calling the instructions ready:

- Valid evidence: produce the requested artifact within the inherited scope.
- Empty eligible input: report no eligible evidence and stop without inventing
  a report full of recommendations.
- Missing input or access: identify exactly what is unavailable; do not treat
  failed retrieval as an empty dataset or publish a complete-looking analysis.
- Conflicting evidence: show sources and unresolved interpretations for the
  reviewer; do not silently select a convenient account.
- Duplicate result: follow the source rule or an explicitly proposed policy.
- Uncertain write result: inspect the destination before retrying; report
  uncertainty and stop if it cannot be resolved, avoiding duplicate publication.

Record which scenarios were reviewed and whether verification was static or
performed in the target product. A successful repository validator proves file
structure, not Productboard runtime compatibility.

## Instruction quality before deployment

- Preserve the requested name throughout settings, instructions, and invocation.
  Do not introduce repository prefixes or test suffixes on the user's behalf.
- Distinguish mechanically enforced source limits, source recommendations, and
  new adaptation choices. A recommendation to surface three to five findings is
  not an enforced maximum. Do not reconstruct metadata-based guards by guessing
  authorship, bot status, or intake state from prose.
- Give every branch one consistent outcome. Missing referenced context can be
  disclosed while analyzing available material; stop only when the missing input
  prevents meaningful analysis. Distinguish a prior review alone from a new brief
  containing one, and avoid repeating already-addressed findings.
- Describe evidence as absent from the supplied material, not nonexistent.
  Preserve exact quotations, separating multiple excerpts rather than presenting
  a stitched passage as one verbatim quote. Label proposed reviewer roles as
  suggestions; never invent established owners or participants.
- Merge findings that describe the same underlying risk. Reserve Context Gaps
  for referenced but unavailable material or information essential to analysis.
  A no-findings result should not manufacture speculative missing considerations.
- Test an explicit hypothesis with a validation plan as a negative case when
  adapting assumption analysis. Judge grounding, risk reasoning, and useful
  restraint, not a predetermined finding count or mandatory phrase unless the
  actual output contract requires one.
- Do not add irrelevant style rules or claims such as “nothing was saved or
  shared” that the skill cannot establish. Check that the permitted output and
  automation delivery agree before saving.
