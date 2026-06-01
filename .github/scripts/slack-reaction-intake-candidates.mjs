import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

function listFixtureFiles() {
  if (process.env.GITHUB_EVENT_NAME === "push") {
    try {
      const output = execFileSync("git", ["diff", "--name-only", "HEAD~1", "HEAD"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      return output
        .split(/\r?\n/)
        .filter((file) => /^slack-fixtures\/.*\.json$/.test(file));
    } catch {
      return [];
    }
  }

  const root = "slack-fixtures";
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

function textFrom(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isReadableAuthor(value) {
  return value && !/^[UWB][A-Z0-9]+$/.test(value) && value.toLowerCase() !== "unknown";
}

function authorName(message) {
  const name = textFrom(message.author_name || message.username || message.user_name);
  if (isReadableAuthor(name)) {
    return name;
  }
  if (message.bot_id) {
    return "Slack app";
  }
  return "Slack participant";
}

function validPermalink(value) {
  const link = textFrom(value);
  return /^https?:\/\//.test(link) ? link : "";
}

function collectMessages(value, messages = []) {
  if (!value || typeof value !== "object") {
    return messages;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectMessages(item, messages);
    }
    return messages;
  }

  if (textFrom(value.text) && (value.message_ts || value.ts)) {
    messages.push(value);
  }

  for (const nested of Object.values(value)) {
    if (nested && typeof nested === "object") {
      collectMessages(nested, messages);
    }
  }

  return messages;
}

function hasInboxTray(message) {
  const reactions = Array.isArray(message.reactions) ? message.reactions : [];
  return reactions.some((reaction) => {
    if (typeof reaction === "string") {
      return reaction === "inbox_tray";
    }
    return reaction && reaction.name === "inbox_tray";
  });
}

function summarizeTitle(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const issueFor = cleaned.match(/^(?:please\s+)?can we\s+open\s+an?\s+issue\s+for\s+(.+?)(?:\?|\.|$)/i);
  if (issueFor?.[1]) {
    const subject = issueFor[1].replace(/^(the|a|an)\s+/i, "").trim();
    const titled = `${subject.charAt(0).toUpperCase()}${subject.slice(1)} follow-up`;
    return titled.length > 90 ? `${titled.slice(0, 87).trim()}...` : titled;
  }
  const withoutLead = cleaned.replace(/^(please\s+)?(can we\s+)?(open|create|track)\s+(an?\s+)?(issue|ticket)\s+(for|to)?\s*/i, "");
  const title = withoutLead || cleaned || "Slack reaction intake request";
  return title.length > 90 ? `${title.slice(0, 87).trim()}...` : title;
}

const files = listFixtureFiles();
const seen = new Set();
const candidates = [];

for (const fixture of files) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(fixture, "utf8"));
  } catch {
    continue;
  }

  for (const message of collectMessages(parsed)) {
    if (!hasInboxTray(message)) {
      continue;
    }

    const channelId = textFrom(message.channel_id || message.channel);
    const messageTs = textFrom(message.message_ts || message.ts);
    const text = textFrom(message.text);
    if (!channelId || !messageTs || !text) {
      continue;
    }

    const idempotencyKey = `slack-reaction-intake:${channelId}:${messageTs}:inbox_tray`;
    if (seen.has(idempotencyKey)) {
      continue;
    }
    seen.add(idempotencyKey);

    candidates.push({
      idempotency_key: idempotencyKey,
      title: summarizeTitle(text),
      summary: text,
      copied_context: text.length > 500 ? `${text.slice(0, 497).trim()}...` : text,
      author_name: authorName(message),
      channel_id: channelId,
      channel_name: textFrom(message.channel_name || channelId),
      message_ts: messageTs,
      thread_ts: textFrom(message.thread_ts || messageTs),
      permalink: validPermalink(message.permalink),
      fixture,
    });
  }
}

console.log(JSON.stringify({ fixture_files: files, candidates }, null, 2));
