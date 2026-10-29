// Approval gate decisions for the release blog pipeline. GitHub labels are the
// canonical gate state; slash commands (and later Slack) map onto them here.

export const GATES = {
  "/approve-brief": {
    gate: 1,
    requires: "ai:needs:brief-approval",
    grants: "approved:brief",
    nextStatus: "Drafting",
    receipt: "Brief approved. Drafting starts next.",
  },
};

const WRITE_PERMISSIONS = new Set(["admin", "maintain", "write"]);

export function parseCommand(body = "") {
  const first = String(body).trim().split(/\s+/)[0]?.toLowerCase();
  return GATES[first] ? first : null;
}

// allowlist: optional list of logins; when present it replaces the
// write-permission check so marketers without repo write access can approve.
export function decideGate({ body, labels = [], actor, permission, allowlist = [] }) {
  const command = parseCommand(body);
  if (!command) return { action: "ignore", reason: "not a gate command" };
  const gate = GATES[command];

  const allowed = allowlist.length
    ? allowlist.map((login) => login.replace(/^@/, "").toLowerCase()).includes(String(actor).toLowerCase())
    : WRITE_PERMISSIONS.has(permission);
  if (!allowed) return { action: "reject", command, reason: `@${actor} is not an approver for this gate` };
  if (labels.includes(gate.grants)) return { action: "ignore", command, reason: `already has ${gate.grants}` };
  if (!labels.includes(gate.requires)) {
    return { action: "reject", command, reason: `this issue is not waiting at gate ${gate.gate} (no ${gate.requires} label)` };
  }
  return {
    action: "approve",
    command,
    removeLabel: gate.requires,
    addLabel: gate.grants,
    nextStatus: gate.nextStatus,
    receipt: gate.receipt,
  };
}
