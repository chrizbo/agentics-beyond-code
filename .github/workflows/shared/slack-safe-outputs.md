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
              const allowedChannels = new Set(
                (process.env.SLACK_ALLOWED_CHANNEL_IDS || "")
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean)
              );

              if (!token) {
                core.setFailed("SLACK_BOT_TOKEN is not configured.");
                return;
              }

              if (!allowedChannels.size) {
                core.setFailed("SLACK_ALLOWED_CHANNEL_IDS must contain at least one channel ID.");
                return;
              }

              if (!outputFile || !fs.existsSync(outputFile)) {
                core.info("No agent output found; nothing to post to Slack.");
                return;
              }

              const payload = JSON.parse(fs.readFileSync(outputFile, "utf8"));
              const items = (payload.items || []).filter((item) => item.type === "slack_post_message");
              const maxPosts = 3;

              if (items.length > maxPosts) {
                core.setFailed(`Too many Slack post requests: ${items.length}. Max is ${maxPosts}.`);
                return;
              }

              for (const item of items) {
                const channel = String(item.channel_id || "").trim();
                const text = String(item.text || "").trim();
                const sourceUrl = String(item.github_source_url || "").trim();
                const threadTs = String(item.thread_ts || "").trim();

                if (!allowedChannels.has(channel)) {
                  core.setFailed(`Slack channel is not allowlisted: ${channel}`);
                  return;
                }

                if (!sourceUrl.startsWith("https://github.com/")) {
                  core.setFailed("github_source_url must be a https://github.com/ URL.");
                  return;
                }

                if (!text || text.length > 3000) {
                  core.setFailed("Slack message text is required and must be 3000 characters or fewer.");
                  return;
                }

                if (!text.includes(sourceUrl)) {
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
                  core.setFailed(`Slack post failed: ${result.error || response.statusText}`);
                  return;
                }

                core.info(`Posted Slack message to ${channel} at ${result.ts}`);
              }
---

# Slack Safe Outputs

Import this shared component from workflows that need to post short summaries
back to Slack.

```yaml
imports:
  - shared/slack-safe-outputs.md
```

The agent calls the normalized safe-output tool as `slack_post_message` with:

- `channel_id`
- `text`
- `github_source_url`
- optional `thread_ts`

The custom safe-output job validates the target channel, requires a GitHub
source URL, limits message length and volume, and performs the Slack API write
with `SLACK_BOT_TOKEN` after the agent job completes.
