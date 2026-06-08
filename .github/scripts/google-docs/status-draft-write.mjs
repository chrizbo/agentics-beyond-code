function escapeDriveQueryValue(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

export function lifecycleSearchQuery(folderId, lifecycleKey) {
  return [
    `'${escapeDriveQueryValue(folderId)}' in parents`,
    "trashed = false",
    `appProperties has { key='agenticsLifecycleKey' and value='${escapeDriveQueryValue(lifecycleKey)}' }`,
  ].join(" and ");
}

export function placeholderRequests(replacements) {
  return Object.entries(replacements).map(([placeholder, replacement]) => ({
    replaceAllText: {
      containsText: {
        text: placeholder,
        matchCase: true,
      },
      replaceText: String(replacement),
    },
  }));
}

export function verifyFilledDocument(document, plan) {
  const serialized = JSON.stringify(document);
  const unresolved = Object.keys(plan.replacements).filter((placeholder) =>
    serialized.includes(placeholder),
  );
  if (unresolved.length) {
    throw new Error(`Draft still contains placeholders: ${unresolved.join(", ")}`);
  }
  if (!serialized.includes(plan.lifecycle_key)) {
    throw new Error("Draft readback is missing the lifecycle key.");
  }
  if (!serialized.includes(plan.github_source_url)) {
    throw new Error("Draft readback is missing the GitHub source URL.");
  }
}

