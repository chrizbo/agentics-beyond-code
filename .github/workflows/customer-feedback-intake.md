---
description: |
  Fixture-first customer feedback intake workflow. Normalizes feedback fixtures
  from the hypothetical agentics-beyond-code-test repo, Discord, and Slack;
  creates deduplicated GitHub feedback intake issues; and adds them to the
  Customer Feedback Queue project.

engine:
  id: codex
  model: gpt-5-mini

on:
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read

strict: true
timeout-minutes: 20
max-ai-credits: 1000

network:
  allowed: [defaults, github]

steps:
  - name: Normalize feedback fixtures
    id: normalize-feedback
    run: |
      node .github/scripts/normalize-feedback-fixtures.mjs --write > feedback-normalizer-output.json

tools:
  bash: ["*"]
  github:
    mode: gh-proxy
    toolsets: [default, issues]
    lockdown: false
    min-integrity: none

safe-outputs:
  mentions: false
  allowed-github-references: []
  create-issue:
    max: 20
    labels:
      - feedback:intake
      - feedback:needs-pm-review
  add-labels:
    allowed:
      - from-open-source-repo
      - from-discord
      - from-slack
    max: 20
  update-project:
    max: 20
    project: "https://github.com/users/chrizbo/projects/3"
    github-token: ${{ secrets.AW_TOKEN }}
---

# Customer Feedback Intake

Run the deterministic customer feedback safe-output emitter:

```sh
node .github/scripts/emit-feedback-safeoutputs.mjs
```

The pre-step already normalized fixture feedback into
`feedback-events/normalized-feedback-events.json`. Do not inspect raw fixture
files, call Slack/Discord/source repository APIs, summarize customer language,
or emit safe outputs manually. Report the script's final count and stop.
