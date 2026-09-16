import fs from "node:fs";
import path from "node:path";

const FIXTURE_ROOT = "feedback-fixtures";
const DEFAULT_OUTPUT = "feedback-events/normalized-feedback-events.json";

function textFrom(value) {
  return typeof value === "string" ? value.trim() : "";
}

function arrayFrom(value) {
  return Array.isArray(value) ? value.filter((item) => item !== undefined && item !== null) : [];
}

function listJsonFiles(root = FIXTURE_ROOT) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        files.push(fullPath);
      }
    }
  };
  walk(root);
  return files.sort();
}

function validUrl(value) {
  const url = textFrom(value);
  return /^https?:\/\//.test(url) ? url : "";
}

function sourceSystemForFixture(fixture) {
  if (fixture.includes(`${path.sep}open-source-repos${path.sep}`)) return "open-source-repo";
  if (fixture.includes(`${path.sep}discord${path.sep}`)) return "discord";
  if (fixture.includes(`${path.sep}slack${path.sep}`)) return "slack";
  return "unknown";
}

function normalizeCommon({
  sourceSystem,
  sourceType,
  sourceId,
  sourceUrl,
  observedAt,
  authorName,
  authorRole = "community member",
  channelOrRepo,
  text,
  exactPhrases,
  terminology,
  errorStrings,
  productArea,
  feedbackType,
  severity,
  reach,
  reactionCount = 0,
  threadReplyCount = 0,
  fixture,
}) {
  const cleanSourceId = textFrom(sourceId);
  const event = {
    source_system: sourceSystem,
    source_type: sourceType,
    source_id: cleanSourceId,
    source_url: validUrl(sourceUrl) || `fixture://${fixture}`,
    observed_at: textFrom(observedAt),
    author: {
      display_name: textFrom(authorName) || "Public participant",
      role: authorRole,
      is_internal: false,
    },
    channel_or_repo: channelOrRepo,
    content: {
      text: textFrom(text),
      verbatim_excerpts: arrayFrom(exactPhrases).map(textFrom).filter(Boolean),
      terminology: arrayFrom(terminology).map(textFrom).filter(Boolean),
      error_strings: arrayFrom(errorStrings).map(textFrom).filter(Boolean),
      redacted: false,
      language: "en",
    },
    product: {
      area: textFrom(productArea) || "unknown",
      feature: "unknown",
    },
    customer_context: {
      segment: "unknown",
      account: "omitted",
      plan: "unknown",
    },
    signals: {
      feedback_type: textFrom(feedbackType) || "Other",
      sentiment: "unknown",
      urgency: severityToUrgency(severity),
      severity: textFrom(severity) || "Unknown",
      reach: textFrom(reach) || "Unknown",
      reaction_count: reactionCount,
      thread_reply_count: threadReplyCount,
    },
    ingestion: {
      fixture_file: fixture,
      idempotency_key: `feedback:${sourceSystem}:${cleanSourceId}`,
    },
  };
  event.intake = buildIntakePayload(event);
  return event;
}

function severityToUrgency(severity) {
  switch (textFrom(severity).toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "medium":
      return "medium";
    case "low":
      return "low";
    default:
      return "unknown";
  }
}

function sourceLabel(sourceSystem) {
  if (sourceSystem === "open-source-repo") return "from-open-source-repo";
  if (sourceSystem === "discord") return "from-discord";
  if (sourceSystem === "slack") return "from-slack";
  return "from-feedback-fixture";
}

function sourceName(sourceSystem) {
  if (sourceSystem === "open-source-repo") return "Open Source Repo";
  if (sourceSystem === "discord") return "Discord";
  if (sourceSystem === "slack") return "Slack";
  return "Unknown";
}

function truncate(value, max = 82) {
  const clean = textFrom(value).replace(/\s+/g, " ");
  return clean.length > max ? `${clean.slice(0, max - 3).trim()}...` : clean;
}

function firstLine(value) {
  return textFrom(value).split(/\r?\n/).find(Boolean) || "Customer feedback";
}

function bulletList(items) {
  const values = arrayFrom(items).map(textFrom).filter(Boolean);
  return values.length ? values.map((item) => `- "${item}"`).join("\n") : "- _None captured_";
}

function terminologyList(items) {
  const values = arrayFrom(items).map(textFrom).filter(Boolean);
  return values.length ? values.map((item) => `- \`${item}\``).join("\n") : "- _None captured_";
}

function buildIntakePayload(event) {
  const title = `[Feedback] ${truncate(firstLine(event.content.text))}`;
  const sourceLabelName = sourceLabel(event.source_system);
  const fields = {
    Source: sourceName(event.source_system),
    "Product Area": event.product.area,
    "Feedback Type": event.signals.feedback_type,
    Severity: event.signals.severity,
    Reach: event.signals.reach,
  };

  const body = `## Customer Language

### Exact Phrases

${bulletList(event.content.verbatim_excerpts)}

### Terminology

${terminologyList(event.content.terminology)}

### Error Messages / Commands / Product Names

${terminologyList(event.content.error_strings)}

## Source Evidence

- Source link: ${event.source_url}
- Source context: ${truncate(event.content.text, 600)}

## Agent Triage Notes

This item came from ${sourceName(event.source_system)} and preserves the source wording for PM review. Triage should compare the exact phrases above against duplicates before relying on any summary.

<!-- workflow-metadata
feedback_key: ${event.ingestion.idempotency_key}
source_type: ${event.source_type}
dedupe_key_candidates:
${event.content.verbatim_excerpts.map((phrase) => `  - ${phrase}`).join("\n") || "  - none"}
-->`;

  return {
    title,
    labels: ["feedback:intake", "feedback:needs-pm-review", sourceLabelName],
    body,
    project_fields: fields,
  };
}

function normalizeOpenSourceFixture(parsed, fixture) {
  const repo = textFrom(parsed.repository) || "agentics-beyond-code-test";
  const repoUrl = validUrl(parsed.repository_url);
  const channelOrRepo = {
    id: repo,
    name: repo,
    kind: "github-repository",
    allowlisted: true,
  };

  const normalizeGitHubItem = (item, sourceType) => {
    const number = item.number;
    const sourceId = `${repo}:${sourceType}:${number}`;
    const body = [textFrom(item.title), textFrom(item.body)].filter(Boolean).join("\n\n");
    return normalizeCommon({
      sourceSystem: "open-source-repo",
      sourceType,
      sourceId,
      sourceUrl: item.url || (repoUrl && `${repoUrl}/${sourceType}s/${number}`),
      observedAt: item.created_at || parsed.captured_at,
      authorName: item.author,
      channelOrRepo,
      text: body,
      exactPhrases: item.exact_phrases,
      terminology: item.terminology,
      errorStrings: item.error_strings,
      productArea: item.product_area,
      feedbackType: item.feedback_type,
      severity: item.severity,
      reach: item.reach,
      reactionCount: arrayFrom(item.reactions).reduce((sum, reaction) => sum + Number(reaction.count || 0), 0),
      threadReplyCount: arrayFrom(item.comments).length,
      fixture,
    });
  };

  return [
    ...arrayFrom(parsed.issues).map((item) => normalizeGitHubItem(item, "issue")),
    ...arrayFrom(parsed.discussions).map((item) => normalizeGitHubItem(item, "discussion")),
    ...arrayFrom(parsed.pull_requests).map((item) => normalizeGitHubItem(item, "pull-request")),
  ];
}

function normalizeDiscordFixture(parsed, fixture) {
  const events = [];
  for (const channel of arrayFrom(parsed.channels)) {
    const channelOrRepo = {
      id: textFrom(channel.id),
      name: textFrom(channel.name) || textFrom(channel.id),
      kind: "discord-channel",
      allowlisted: true,
    };
    for (const message of arrayFrom(channel.messages)) {
      const reactionCount = arrayFrom(message.reactions).reduce((sum, reaction) => sum + Number(reaction.count || 0), 0);
      events.push(normalizeCommon({
        sourceSystem: "discord",
        sourceType: "discord-message",
        sourceId: `${parsed.guild_id || "discord"}:${channel.id}:${message.id}`,
        sourceUrl: message.permalink,
        observedAt: message.timestamp || parsed.captured_at,
        authorName: message.author_display_name,
        channelOrRepo,
        text: message.content,
        exactPhrases: message.exact_phrases,
        terminology: message.terminology,
        errorStrings: message.error_strings,
        productArea: message.product_area,
        feedbackType: message.feedback_type,
        severity: message.severity,
        reach: message.reach,
        reactionCount,
        threadReplyCount: arrayFrom(message.replies).length,
        fixture,
      }));
    }
  }
  return events;
}

function normalizeSlackFixture(parsed, fixture) {
  const events = [];
  for (const channel of arrayFrom(parsed.channels)) {
    const channelOrRepo = {
      id: textFrom(channel.id),
      name: textFrom(channel.name) || textFrom(channel.id),
      kind: "slack-channel",
      allowlisted: true,
    };
    for (const message of arrayFrom(channel.messages)) {
      const reactionCount = arrayFrom(message.reactions).reduce((sum, reaction) => sum + Number(reaction.count || 0), 0);
      events.push(normalizeCommon({
        sourceSystem: "slack",
        sourceType: "slack-message",
        sourceId: `${parsed.workspace_id || "slack"}:${channel.id}:${message.ts}`,
        sourceUrl: message.permalink,
        observedAt: message.timestamp || parsed.captured_at,
        authorName: message.author_name,
        authorRole: "field team",
        channelOrRepo,
        text: message.text,
        exactPhrases: message.exact_phrases,
        terminology: message.terminology,
        errorStrings: message.error_strings,
        productArea: message.product_area,
        feedbackType: message.feedback_type,
        severity: message.severity,
        reach: message.reach,
        reactionCount,
        threadReplyCount: arrayFrom(message.replies).length,
        fixture,
      }));
    }
  }
  return events;
}

function normalizeFixtureFile(fixture) {
  const parsed = JSON.parse(fs.readFileSync(fixture, "utf8"));
  const sourceSystem = sourceSystemForFixture(fixture);
  if (sourceSystem === "open-source-repo") return normalizeOpenSourceFixture(parsed, fixture);
  if (sourceSystem === "discord") return normalizeDiscordFixture(parsed, fixture);
  if (sourceSystem === "slack") return normalizeSlackFixture(parsed, fixture);
  return [];
}

function normalizeAll() {
  const fixtureFiles = listJsonFiles();
  const events = [];
  const seen = new Set();

  for (const fixture of fixtureFiles) {
    for (const event of normalizeFixtureFile(fixture)) {
      const key = event.ingestion.idempotency_key;
      if (!key || seen.has(key)) {
        continue;
      }
      seen.add(key);
      events.push(event);
    }
  }

  events.sort((a, b) => {
    const byTime = a.observed_at.localeCompare(b.observed_at);
    return byTime || a.source_id.localeCompare(b.source_id);
  });

  return {
    generated_at: "fixture-normalizer",
    fixture_files: fixtureFiles,
    events,
  };
}

const result = normalizeAll();

if (process.argv.includes("--write")) {
  fs.mkdirSync(path.dirname(DEFAULT_OUTPUT), { recursive: true });
  fs.writeFileSync(DEFAULT_OUTPUT, `${JSON.stringify(result, null, 2)}\n`);
}

console.log(JSON.stringify(result, null, 2));
