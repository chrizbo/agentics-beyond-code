export function draftSlackMessage({ discussionTitle, discussionUrl, documentUrl }) {
  return [
    `*DRAFT: ${discussionTitle}*`,
    "This weekly status is in team-shaping mode and is not the final report.",
    `• <${documentUrl}|Edit and review the collaborative Google Doc>`,
    `• <${discussionUrl}|View the source Discussion or comment /finalize-status>`,
    "Resolve the finalization gate comment in the Doc when the report is ready.",
  ].join("\n");
}

export function slackDraftChannel(
  configuredDraftChannel,
  channelMapValue,
  allowedChannelsValue,
) {
  const channelMap = JSON.parse(channelMapValue || "{}");
  const channel = String(
    configuredDraftChannel || channelMap["Weekly Leadership Status Update"] || "",
  ).trim();
  if (!channel) {
    return undefined;
  }

  const allowedChannels = new Set(
    String(allowedChannelsValue || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  if (!allowedChannels.has(channel)) {
    throw new Error(`Weekly Status Slack channel is not allowlisted: ${channel}`);
  }
  return channel;
}
