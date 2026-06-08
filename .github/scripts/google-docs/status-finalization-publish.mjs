export function canPublishFinalization({
  enabled,
  triggerKind,
  gateResolved,
}) {
  if (!enabled) {
    return false;
  }
  if (triggerKind === "discussion_comment") {
    return true;
  }
  return gateResolved;
}

export function finalSlackChannel(channelMapValue, allowedChannelsValue) {
  const channelMap = JSON.parse(channelMapValue || "{}");
  const channel = String(channelMap["Weekly Leadership Status Update"] || "").trim();
  if (!channel) {
    throw new Error("No final Weekly Status Slack channel is configured.");
  }

  const allowed = new Set(
    String(allowedChannelsValue || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  if (!allowed.has(channel)) {
    throw new Error(`Final Weekly Status Slack channel is not allowlisted: ${channel}`);
  }
  return channel;
}

export function finalSlackMessage({ discussionTitle, discussionUrl, discussionBody }) {
  const summary = String(discussionBody || "")
    .split(/\r?\n/)
    .find((line) => /initiatives.*active launches.*items shipped.*needing attention/i.test(line))
    ?.replaceAll("**", "");
  return [
    `*FINAL: ${discussionTitle}*`,
    "The shaped weekly status has been published.",
    ...(summary ? [summary] : []),
    `<${discussionUrl}|Read the final Weekly Status report>`,
  ].join("\n");
}
