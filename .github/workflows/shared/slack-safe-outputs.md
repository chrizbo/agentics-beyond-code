---
safe-outputs:
  jobs:
    slack-post-message:
      description: "Post a short, validated message to an allowlisted Slack channel or thread"
      runs-on: ubuntu-latest
      timeout-minutes: 5
      output: "Slack message posted"
      permissions:
        contents: read
        issues: write
      inputs:
        channel_id:
          description: "Slack channel ID to post to. Must be allowlisted in SLACK_ALLOWED_CHANNEL_IDS."
          required: true
          type: string
        text:
          description: "Plain-text fallback and message body. Must include a GitHub source URL."
          required: true
          type: string
        github_source_url:
          description: "GitHub issue, discussion, pull request, or run URL that is the durable source of truth."
          required: true
          type: string
        thread_ts:
          description: "Optional Slack thread timestamp for threaded replies."
          required: false
          type: string
      steps:
        - name: Post validated Slack messages
          uses: actions/github-script@v8
          env:
            SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
            SLACK_ALLOWED_CHANNEL_IDS: ${{ vars.SLACK_ALLOWED_CHANNEL_IDS }}
          with:
            script: |
              const fs = require("fs");
              const outputFile = process.env.GH_AW_AGENT_OUTPUT;
              const token = process.env.SLACK_BOT_TOKEN;
              const issueTitle = "[Slack Integration] Configure SLACK_BOT_TOKEN";
              const allowedChannels = new Set(
                (process.env.SLACK_ALLOWED_CHANNEL_IDS || "")
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean)
              );

              async function fileMissingTokenIssue() {
                const { owner, repo } = context.repo;
                const existing = await github.rest.issues.listForRepo({
                  owner,
                  repo,
                  state: "open",
                  per_page: 100
                });
                const match = existing.data.find((issue) => issue.title === issueTitle);
                if (match) {
                  core.info(`Configuration issue already open: ${match.html_url}`);
                  return match.html_url;
                }

                const created = await github.rest.issues.create({
                  owner,
                  repo,
                  title: issueTitle,
                  body: [
                    "Slack output is enabled, but the `SLACK_BOT_TOKEN` repository secret is missing.",
                    "",
                    "Add a Slack bot token with the scopes required by the enabled Slack workflows, then rerun the failed workflow.",
                    "",
                    `Detected by: ${context.workflow}`,
                    `Run: https://github.com/${owner}/${repo}/actions/runs/${context.runId}`
                  ].join("\n")
                });
                core.info(`Created configuration issue: ${created.data.html_url}`);
                return created.data.html_url;
              }

              async function writeFailureSummary(message) {
                await core.summary
                  .addHeading("Slack safe output")
                  .addRaw(`❌ ${message}\n`)
                  .write();
              }

              if (!token) {
                const issueUrl = await fileMissingTokenIssue();
                await core.summary
                  .addHeading("Slack safe output")
                  .addRaw(`❌ Slack message not posted: \`SLACK_BOT_TOKEN\` is missing.\n\n`)
                  .addLink("Configuration issue", issueUrl)
                  .write();
                core.setFailed("SLACK_BOT_TOKEN is not configured.");
                return;
              }

              if (!allowedChannels.size) {
                await writeFailureSummary("No message posted because `SLACK_ALLOWED_CHANNEL_IDS` is empty.");
                core.setFailed("SLACK_ALLOWED_CHANNEL_IDS must contain at least one channel ID.");
                return;
              }

              if (!outputFile || !fs.existsSync(outputFile)) {
                core.info("No agent output found; nothing to post to Slack.");
                await core.summary
                  .addHeading("Slack safe output")
                  .addRaw("ℹ️ No agent output found; nothing was posted to Slack.\n")
                  .write();
                return;
              }

              const payload = JSON.parse(fs.readFileSync(outputFile, "utf8"));
              const items = (payload.items || []).filter((item) => item.type === "slack_post_message");
              const maxPosts = 3;
              const posted = [];

              if (items.length > maxPosts) {
                await writeFailureSummary(`Rejected ${items.length} Slack post requests; the maximum is ${maxPosts}.`);
                core.setFailed(`Too many Slack post requests: ${items.length}. Max is ${maxPosts}.`);
                return;
              }

              for (const item of items) {
                const channel = String(item.channel_id || "").trim();
                const text = String(item.text || "").trim();
                const sourceUrl = String(item.github_source_url || "").trim();
                const threadTs = String(item.thread_ts || "").trim();

                if (!allowedChannels.has(channel)) {
                  await writeFailureSummary(`Rejected a post to non-allowlisted channel \`${channel}\`.`);
                  core.setFailed(`Slack channel is not allowlisted: ${channel}`);
                  return;
                }

                if (!sourceUrl.startsWith("https://github.com/")) {
                  await writeFailureSummary("Rejected a post whose `github_source_url` is not a GitHub URL.");
                  core.setFailed("github_source_url must be a https://github.com/ URL.");
                  return;
                }

                if (!text || text.length > 3000) {
                  await writeFailureSummary("Rejected a post whose message body was empty or exceeded 3000 characters.");
                  core.setFailed("Slack message text is required and must be 3000 characters or fewer.");
                  return;
                }

                if (!text.includes(sourceUrl)) {
                  await writeFailureSummary("Rejected a post whose message did not include its GitHub source URL.");
                  core.setFailed("Slack message text must include the GitHub source URL.");
                  return;
                }

                const body = {
                  channel,
                  text,
                  unfurl_links: false,
                  unfurl_media: false
                };

                if (threadTs) {
                  body.thread_ts = threadTs;
                }

                const response = await fetch("https://slack.com/api/chat.postMessage", {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json; charset=utf-8"
                  },
                  body: JSON.stringify(body)
                });

                const result = await response.json();
                if (!response.ok || !result.ok) {
                  await writeFailureSummary(`Slack API rejected a post to \`${channel}\`: ${result.error || response.statusText}.`);
                  core.setFailed(`Slack post failed: ${result.error || response.statusText}`);
                  return;
                }

                core.info(`Posted Slack message to ${channel} at ${result.ts}`);
                posted.push({ channel, ts: result.ts, sourceUrl });
              }

              await core.summary
                .addHeading("Slack safe output")
                .addTable([
                  [{ data: "Channel", header: true }, { data: "Slack timestamp", header: true }, { data: "GitHub source", header: true }],
                  ...posted.map((item) => [item.channel, item.ts, item.sourceUrl])
                ])
                .write();
---

<!--
# Slack Safe Outputs

Import this shared component from workflows that need to post short summaries
back to Slack.

```md
---
name: My reporting workflow

imports:
  - shared/slack-safe-outputs.md
---

# My reporting workflow
```

The agent calls the normalized safe-output tool as `slack_post_message` with:

- `channel_id`
- `text`
- `github_source_url`
- optional `thread_ts`

The custom safe-output job validates the target channel, requires a GitHub
source URL, limits message length and volume, and performs the Slack API write
with `SLACK_BOT_TOKEN` after the agent job completes.
-->
