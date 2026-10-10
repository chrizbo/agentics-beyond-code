import assert from "node:assert/strict";
import test from "node:test";
import { parseBrief } from "./brief.mjs";

const body = `### Initiative or launch

#338

### Content type

Release post

### Audience

Workspace admins who file usage tickets.

### Key message

See and control usage yourself.

### Proof points wanted

- Ticket drop during beta

### Call to action

Open Settings → Usage.

### Claims to avoid / legal notes

_No response_

### Target publish date

2027-02-01

### Owner

@chrizbo`;

test("parses issue form sections into fields", () => {
  const { fields, targetNumber, owner, problems } = parseBrief(body);
  assert.equal(targetNumber, 338);
  assert.equal(owner, "chrizbo");
  assert.equal(fields.contentType, "Release post");
  assert.equal(fields.proofPoints, "- Ticket drop during beta");
  assert.equal(fields.claimsToAvoid, null);
  assert.deepEqual(problems, []);
});

test("accepts issue URLs as the target", () => {
  const { targetNumber } = parseBrief(body.replace("#338", "https://github.com/chrizbo/agentics-beyond-code/issues/339"));
  assert.equal(targetNumber, 339);
});

test("reports missing required fields, bad targets, and bad dates", () => {
  const { problems } = parseBrief(
    body.replace("#338", "the usage thing").replace("@chrizbo", "_No response_").replace("2027-02-01", "Feb 1"),
  );
  assert.deepEqual(problems, ["missing owner", "target is not an issue reference like #338", "target publish date is not YYYY-MM-DD"]);
});

test("handles CRLF bodies and an empty body", () => {
  assert.equal(parseBrief(body.replace(/\n/g, "\r\n")).targetNumber, 338);
  assert.ok(parseBrief("").problems.includes("missing target"));
});
