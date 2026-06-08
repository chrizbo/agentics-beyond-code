const SECTION_MARKERS = [
  ["WHAT_SHIPPED", /what shipped/i],
  ["WHAT_WE_LEARNED", /what we learned/i],
  ["FYI", /^fyi$/i],
  ["SOS", /^sos$/i],
  ["PORTFOLIO_SNAPSHOT", /portfolio snapshot/i],
];

const PORTFOLIO_PLACEHOLDERS = new Map([
  ["active initiatives", "{{INITIATIVE_COUNT}}"],
  ["active launches", "{{ACTIVE_LAUNCH_COUNT}}"],
  ["launches on track", "{{ON_TRACK_LAUNCH_COUNT}}"],
  ["launches needing attention", "{{ATTENTION_LAUNCH_COUNT}}"],
  ["launches at risk", "{{AT_RISK_LAUNCH_COUNT}}"],
  ["launches high risk", "{{HIGH_RISK_LAUNCH_COUNT}}"],
  ["open blockers", "{{OPEN_BLOCKER_COUNT}}"],
]);

function cleanHeading(value) {
  return value
    .replace(/^#+\s*/, "")
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
    .trim();
}

function normalizeSection(value) {
  const lines = value
    .trim()
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*+]\s+/, "").trimEnd())
    .filter((line) => line.trim() && !/^---+$/.test(line.trim()));

  return lines.join("\n").trim();
}

function sectionKey(heading) {
  const cleaned = cleanHeading(heading);
  return SECTION_MARKERS.find(([, pattern]) => pattern.test(cleaned))?.[0];
}

function splitSections(body) {
  const sections = {};
  let current;

  for (const line of body.split(/\r?\n/)) {
    if (/^#{2,6}\s+/.test(line)) {
      current = sectionKey(line);
      if (current) {
        sections[current] = [];
      }
      continue;
    }
    if (current) {
      sections[current].push(line);
    }
  }

  return Object.fromEntries(
    Object.entries(sections).map(([key, lines]) => [
      key,
      normalizeSection(lines.join("\n")),
    ]),
  );
}

function parseSummaryCounts(body) {
  const summary = body
    .split(/\r?\n/)
    .find((line) => /initiatives.*active launches.*items shipped.*needing attention/i.test(line));

  if (!summary) {
    return {};
  }

  const count = (pattern) => summary.match(pattern)?.[1];
  return {
    "{{INITIATIVE_COUNT}}": count(/(\d+)\s+initiatives/i),
    "{{ACTIVE_LAUNCH_COUNT}}": count(/(\d+)\s+active launches/i),
    "{{SHIPPED_COUNT}}": count(/(\d+)\s+items shipped/i),
    "{{ATTENTION_COUNT}}": count(/(\d+)\s+items needing attention/i),
  };
}

function parsePortfolioCounts(section) {
  const replacements = {};
  const lines = section.split(/\r?\n/).filter((line) => line.trim().startsWith("|"));

  for (const line of lines.slice(2)) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length < 2) {
      continue;
    }

    const metric = cells[0]
      .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    const placeholder = [...PORTFOLIO_PLACEHOLDERS].find(([name]) =>
      metric.startsWith(name),
    )?.[1];
    const numericValue = cells[1].match(/\d+/)?.[0];

    if (placeholder && numericValue) {
      replacements[placeholder] = numericValue;
    }
  }

  return replacements;
}

function weekOfFrom(title, body) {
  const match = `${title}\n${body}`.match(/Week of\s+(\d{4}-\d{2}-\d{2})/i);
  if (!match) {
    throw new Error("Discussion title or body must contain 'Week of YYYY-MM-DD'.");
  }
  return match[1];
}

export function buildStatusDraftPlan({
  discussionTitle,
  discussionBody,
  discussionUrl,
  owner,
  reviewDeadline,
  titlePrefix = "[Status Draft]",
}) {
  if (!discussionTitle || !discussionBody || !discussionUrl) {
    throw new Error("Discussion title, body, and URL are required.");
  }

  const weekOf = weekOfFrom(discussionTitle, discussionBody);
  const lifecycleKey = `weekly-status:${weekOf}`;
  const sections = splitSections(discussionBody);
  const requiredSections = ["WHAT_SHIPPED", "WHAT_WE_LEARNED", "FYI", "SOS"];
  const missingSections = requiredSections.filter((key) => !sections[key]);

  if (missingSections.length) {
    throw new Error(`Discussion is missing sections: ${missingSections.join(", ")}`);
  }

  const replacements = {
    "{{LIFECYCLE_KEY}}": lifecycleKey,
    "{{OWNER}}": owner || "Weekly Status team",
    "{{REVIEW_DEADLINE}}": reviewDeadline || "Not set",
    "{{GITHUB_SOURCE_URL}}": discussionUrl,
    "{{WEEK_OF}}": weekOf,
    "{{WHAT_SHIPPED}}": sections.WHAT_SHIPPED,
    "{{WHAT_WE_LEARNED}}": sections.WHAT_WE_LEARNED,
    "{{FYI}}": sections.FYI,
    "{{SOS}}": sections.SOS,
    ...parseSummaryCounts(discussionBody),
    ...parsePortfolioCounts(sections.PORTFOLIO_SNAPSHOT || ""),
  };

  const missingPlaceholders = Object.entries(replacements)
    .filter(([, value]) => value === undefined || value === "")
    .map(([placeholder]) => placeholder);

  if (missingPlaceholders.length) {
    throw new Error(
      `Discussion could not populate placeholders: ${missingPlaceholders.join(", ")}`,
    );
  }

  return {
    operation: "google_docs_create_collaboration_draft",
    staged: true,
    lifecycle_key: lifecycleKey,
    proposed_title: `${titlePrefix} Week of ${weekOf}`,
    github_source_url: discussionUrl,
    replacements,
  };
}

