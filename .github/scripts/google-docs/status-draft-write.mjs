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

function documentTextRuns(document) {
  const runs = [];

  function visitContent(content, tabId) {
    for (const element of content || []) {
      if (element.paragraph) {
        for (const paragraphElement of element.paragraph.elements || []) {
          if (paragraphElement.textRun?.content) {
            runs.push({
              ...paragraphElement.textRun,
              startIndex: paragraphElement.startIndex,
              endIndex: paragraphElement.endIndex,
              tabId,
            });
          }
        }
      }
      if (element.table) {
        for (const row of element.table.tableRows || []) {
          for (const cell of row.tableCells || []) {
            visitContent(cell.content, tabId);
          }
        }
      }
      if (element.tableOfContents) {
        visitContent(element.tableOfContents.content, tabId);
      }
    }
  }

  function visitTabs(tabs) {
    for (const tab of tabs || []) {
      visitContent(tab.documentTab?.body?.content || tab.body?.content, tab.tabId);
      visitTabs(tab.childTabs);
    }
  }

  if (document.tabs?.length) {
    visitTabs(document.tabs);
  } else {
    visitContent(document.body?.content);
  }

  return runs;
}

function range(startIndex, endIndex, tabId) {
  return {
    startIndex,
    endIndex,
    ...(tabId ? { tabId } : {}),
  };
}

function location(index, tabId) {
  return {
    index,
    ...(tabId ? { tabId } : {}),
  };
}

export function markdownLinkRequests(document) {
  const links = [];
  const markdownLink = /\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g;

  for (const textRun of documentTextRuns(document)) {
    for (const match of textRun.content.matchAll(markdownLink)) {
      const startIndex = textRun.startIndex + match.index;
      links.push({
        startIndex,
        endIndex: startIndex + match[0].length,
        label: match[1],
        url: match[2],
        tabId: textRun.tabId,
      });
    }
  }

  links.sort((left, right) => right.startIndex - left.startIndex);

  return links.flatMap(({ startIndex, endIndex, label, url, tabId }) => [
    {
      deleteContentRange: {
        range: range(startIndex, endIndex, tabId),
      },
    },
    {
      insertText: {
        location: location(startIndex, tabId),
        text: label,
      },
    },
    {
      updateTextStyle: {
        range: range(startIndex, startIndex + label.length, tabId),
        textStyle: { link: { url } },
        fields: "link",
      },
    },
  ]);
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
  if (markdownLinkRequests(document).length) {
    throw new Error("Draft readback still contains literal Markdown links.");
  }
}
