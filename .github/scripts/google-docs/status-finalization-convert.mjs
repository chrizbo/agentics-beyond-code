function escapeMarkdown(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("|", "\\|");
}

function renderTextRun(textRun) {
  let content = textRun.content || "";
  if (!content) {
    return "";
  }

  content = content.replace(/\n$/, "");
  if (!content) {
    return "";
  }

  const style = textRun.textStyle || {};
  if (style.link?.url) {
    content = `[${content}](${style.link.url})`;
  }
  if (style.bold) {
    content = `**${content}**`;
  }
  return content;
}

function paragraphText(paragraph) {
  return (paragraph.elements || [])
    .map((element) => renderTextRun(element.textRun || {}))
    .join("");
}

function paragraphPlainText(paragraph) {
  return (paragraph.elements || [])
    .map((element) => element.textRun?.content || "")
    .join("")
    .replace(/\n$/, "");
}

function renderParagraph(paragraph) {
  const text = paragraphText(paragraph).trimEnd();
  if (!text) {
    return "";
  }

  const namedStyle = paragraph.paragraphStyle?.namedStyleType || "";
  const headingLevel = namedStyle.match(/^HEADING_(\d)$/)?.[1];
  if (headingLevel) {
    return `${"#".repeat(Number(headingLevel))} ${text}`;
  }
  if (namedStyle === "TITLE") {
    return `# ${text}`;
  }
  if (paragraph.bullet) {
    return `${"  ".repeat(paragraph.bullet.nestingLevel || 0)}- ${text}`;
  }
  return text;
}

function renderTable(table) {
  const rows = (table.tableRows || []).map((row) =>
    (row.tableCells || []).map((cell) =>
      escapeMarkdown(
        (cell.content || [])
          .map((element) =>
            element.paragraph ? paragraphText(element.paragraph).trim() : "",
          )
          .filter(Boolean)
          .join(" "),
      ),
    ),
  );
  if (!rows.length) {
    return "";
  }

  const columnCount = Math.max(...rows.map((row) => row.length));
  const normalize = (row) => [
    ...row,
    ...Array(Math.max(0, columnCount - row.length)).fill(""),
  ];
  const line = (row) => `| ${normalize(row).join(" | ")} |`;

  return [
    line(rows[0]),
    line(Array(columnCount).fill("---")),
    ...rows.slice(1).map(line),
  ].join("\n");
}

function publishableContent(document) {
  const tab = document.tabs?.[0];
  return tab?.documentTab?.body?.content || tab?.body?.content || document.body?.content || [];
}

export function documentToStatusMarkdown(document) {
  const content = publishableContent(document);
  const startIndex = content.findIndex((element) => {
    if (!element.paragraph) {
      return false;
    }
    const style = element.paragraph.paragraphStyle?.namedStyleType;
    return (
      style === "HEADING_1" &&
      /^weekly status\b/i.test(paragraphPlainText(element.paragraph).trim())
    );
  });

  if (startIndex === -1) {
    throw new Error("Google Doc is missing the publishable Weekly Status heading.");
  }

  const blocks = [];
  for (const element of content.slice(startIndex)) {
    if (element.paragraph) {
      const rendered = renderParagraph(element.paragraph);
      if (rendered) {
        blocks.push(rendered);
      }
    } else if (element.table) {
      const rendered = renderTable(element.table);
      if (rendered) {
        blocks.push(rendered);
      }
    } else if (element.horizontalRule) {
      blocks.push("---");
    }
  }

  const markdown = `${blocks.join("\n\n").trim()}\n`;
  for (const required of ["What Shipped", "What We Learned", "FYI", "SOS", "Portfolio Snapshot"]) {
    if (!markdown.includes(required)) {
      throw new Error(`Published Markdown is missing required section: ${required}`);
    }
  }
  return markdown;
}
