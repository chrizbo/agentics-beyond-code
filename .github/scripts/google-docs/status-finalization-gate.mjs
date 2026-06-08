export function finalizationGateMarker(lifecycleKey) {
  return `[agentics-finalization-gate:${lifecycleKey}]`;
}

export function finalizationGateHeading(lifecycleKey) {
  const week = lifecycleKey.match(/^weekly-status:(\d{4}-\d{2}-\d{2})$/)?.[1];
  if (!week) {
    throw new Error(`Unsupported finalization gate lifecycle key: ${lifecycleKey}`);
  }
  return `Weekly Status — Week of ${week}`;
}

export function finalizationGateContent(lifecycleKey, discussionUrl) {
  return [
    finalizationGateMarker(lifecycleKey),
    `Target heading: “${finalizationGateHeading(lifecycleKey)}”`,
    "Resolve this comment when the status is ready to move to staged finalization.",
    `Alternatively, comment /finalize-status on the source Discussion: ${discussionUrl}`,
  ].join("\n\n");
}

export function findFinalizationGate(comments, lifecycleKey) {
  const marker = finalizationGateMarker(lifecycleKey);
  const matches = comments.filter((comment) => comment.content?.includes(marker));
  if (matches.length > 1) {
    throw new Error(`Multiple finalization gate comments found for ${lifecycleKey}.`);
  }
  return matches[0];
}
