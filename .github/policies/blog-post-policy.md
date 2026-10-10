# Blog Post Policy

This policy governs release blog posts produced by the release blog pipeline
(`docs/release-blog-pipeline.md`). The brief builder, draft writer, and
publisher read it at runtime, and the guardrail check parses the
**Banned phrases** and **Never publish** lists. Voice comes from
`voice-and-tone-policy.md`; this file adds the rules specific to blog posts.
Edit it to change what every future post must do.

## Evidence rule

Every factual claim must trace to evidence: a merged PR, an issue, a comment
on the initiative or launch, or a decision record. That covers what the
feature does, numbers, dates, customer quotes, and how the work changed.

- A claim with no evidence is cut, or flagged for the brief owner to supply.
- Numbers are used exactly as they appear in the evidence. No rounding up, no
  "up to".
- Customer quotes are verbatim and anonymous ("a beta admin"), and only used
  if they appear in the evidence.
- Work closed as not planned is never described as shipped.

## Public vs. internal evidence

Some evidence explains a decision but must not be published. Translate it
into the customer benefit instead.

| Internal (do not publish) | Publish instead |
|---|---|
| Infrastructure or aggregation cost, cost ratios | "Loads quickly at any workspace size" |
| Headcount, team names, people's names (except the post author) | "The team" |
| Issue, PR, or decision numbers and internal codenames | Plain-language description |
| Alpha or beta workspace counts unless the brief owner approves | "Beta customers" |

## Never publish

- pricing or plan changes not stated in the brief
- names of customers or beta participants
- competitor names
- unreleased or descoped features
- future dates stated as commitments
- security or compliance claims without a matching `approved:*` label on the launch

## Structure

Release posts are 600–900 words with these sections, in order:

1. **Headline**: the reader benefit, in sentence case, under 70 characters.
2. **Lede** (1 paragraph): who this is for and what they can now do.
3. **The problem**: what was hard before, in the reader's terms.
4. **What's new**: the shipped capabilities, specific and concrete. Use a
   short list when there are three or more.
5. **How we got here**: how the plan changed and why, told honestly. This is
   what makes a release post more than a changelog. If the scope changed,
   say what we chose not to build and what the reader got instead.
6. **What customers are seeing**: only evidenced results or quotes. Omit the
   section if there are none.
7. **Get started**: the brief's call to action, plus a docs link.

## Front matter

```yaml
title: "<headline>"
date: YYYY-MM-DD
slug: <kebab-case-headline>
summary: "<one sentence, under 160 characters>"
author: "<brief owner's display name>"
content_type: release-post
launch: <launch issue number>
tags: [<2-4 lowercase tags>]
```

## Banned phrases

Do not use any of these phrases, in any capitalization or verb form:

- revolutionary
- game-changing
- groundbreaking
- seamless
- seamlessly
- blazing fast
- lightning fast
- effortless
- frictionless
- best-in-class
- world-class
- cutting-edge
- next-generation
- leverage
- synergy
- supercharge
- unlock the power
- we are pleased to announce
- we're excited to announce

## Approvals

A post can be drafted once the brief is approved (`approved:brief`). It can
only be published if both of these hold:

- the draft is approved (`approved:draft`)
- every review the launch still needs (`needs:*` or `ai:needs:*` label) has a
  matching `approved:*` label

The brief builder reports any missing approvals as publish blockers so they
surface early.
