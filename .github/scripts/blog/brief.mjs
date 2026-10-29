// Parses a Release Blog Brief issue body (GitHub issue form markdown) into
// structured fields. Pure, so the brief builder's pre-step stays testable.

export const BRIEF_FIELDS = {
  "Initiative or launch": "target",
  "Content type": "contentType",
  Audience: "audience",
  "Key message": "keyMessage",
  "Proof points wanted": "proofPoints",
  "Call to action": "cta",
  "Claims to avoid / legal notes": "claimsToAvoid",
  "Target publish date": "targetDate",
  Owner: "owner",
};

const REQUIRED = ["target", "contentType", "audience", "keyMessage", "cta", "owner"];

export function parseBrief(body = "") {
  const fields = Object.fromEntries(Object.values(BRIEF_FIELDS).map((key) => [key, null]));
  const sections = String(body).replace(/\r\n/g, "\n").split(/^###\s+/m).slice(1);
  for (const section of sections) {
    const newline = section.indexOf("\n");
    const heading = (newline === -1 ? section : section.slice(0, newline)).trim();
    const key = BRIEF_FIELDS[heading];
    if (!key) continue;
    const value = newline === -1 ? "" : section.slice(newline + 1).trim();
    fields[key] = value && value !== "_No response_" ? value : null;
  }

  const targetMatch = fields.target?.match(/(?:issues\/|#)(\d+)\b/) ?? fields.target?.match(/^\s*(\d+)\s*$/);
  const targetNumber = targetMatch ? Number(targetMatch[1]) : null;
  const owner = fields.owner?.match(/@?([A-Za-z0-9-]+)/)?.[1] ?? null;
  const targetDateValid = !fields.targetDate || /^\d{4}-\d{2}-\d{2}$/.test(fields.targetDate);

  const problems = [
    ...REQUIRED.filter((key) => !fields[key]).map((key) => `missing ${key}`),
    ...(fields.target && !targetNumber ? ["target is not an issue reference like #338"] : []),
    ...(targetDateValid ? [] : ["target publish date is not YYYY-MM-DD"]),
  ];

  return { fields, targetNumber, owner, problems };
}
