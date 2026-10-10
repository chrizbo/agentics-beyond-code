// Pure evidence assembly for the release blog pipeline. Takes raw issue,
// timeline, and decision data for an initiative or launch tree and returns
// the "how it evolved" evidence the brief builder reasons over.

const MARKER = /\n*<!-- release-story:[^>]*-->\s*/g;
const SUMMARY_LIMIT = 600;
const DIFF_LIMIT = 2000;
const COMMENT_LIMIT = 1500;

function clip(text, limit) {
  const value = String(text ?? "").replace(MARKER, "").trim();
  return value.length > limit ? `${value.slice(0, limit)}…` : value;
}

export function issueKind(issue) {
  const labels = issue.labels ?? [];
  if (/^\[GTM\]/.test(issue.title)) return "gtm";
  if (labels.includes("initiative") || /^\[Initiative\]/.test(issue.title)) return "initiative";
  if (labels.includes("launch") || /^\[Launch\]/.test(issue.title)) return "launch";
  if (labels.includes("epic")) return "epic";
  return "task";
}

export function issueNumbersIn(text) {
  const numbers = new Set();
  for (const match of String(text ?? "").matchAll(/(?:issues\/|#)(\d+)\b/g)) numbers.add(Number(match[1]));
  return numbers;
}

function decisionMeta(path, content) {
  const title = content.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? path;
  const date = content.match(/\*\*Date\*\*\s*\|\s*([0-9-]{10})/)?.[1] ?? path.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
  const status = content.match(/\*\*Status\*\*\s*\|\s*([^|\n]+)/)?.[1]?.trim() ?? null;
  const decision = clip(content.match(/## Decision\s+([\s\S]*?)(?:\n## |$)/)?.[1], SUMMARY_LIMIT);
  return { path, title, date, status, decision };
}

export function buildInitiativeEvidence({ repo, rootNumber, issues, decisions = [], generatedAt }) {
  const byNumber = new Map(issues.map((issue) => [issue.number, issue]));
  const root = byNumber.get(rootNumber);
  if (!root) throw new Error(`Root issue #${rootNumber} is missing from the fetched data`);

  const treeNumbers = new Set(issues.map((issue) => issue.number));
  const narrativeIssues = issues.filter((issue) => ["initiative", "launch"].includes(issueKind(issue)));

  const toNode = (issue) => ({
    number: issue.number,
    title: issue.title,
    kind: issueKind(issue),
    state: issue.state,
    stateReason: issue.stateReason ?? null,
    url: issue.url,
    children: issues
      .filter((child) => child.parent === issue.number)
      .sort((a, b) => a.number - b.number)
      .map(toNode),
  });

  // Merged PRs, deduplicated across every issue that mentions or is closed by them.
  const prs = new Map();
  const unmerged = new Set();
  for (const issue of issues) {
    for (const event of issue.timeline ?? []) {
      const pr = event.pr ?? event.closer;
      if (!pr) continue;
      if (!pr.merged) {
        unmerged.add(pr.number);
        continue;
      }
      const entry = prs.get(pr.number) ?? {
        number: pr.number,
        title: pr.title,
        url: pr.url,
        mergedAt: pr.mergedAt,
        author: pr.author ?? null,
        summary: clip(pr.body, SUMMARY_LIMIT),
        closes: [],
        references: [],
      };
      const closes = event.type === "closed" || event.willClose;
      const list = closes ? entry.closes : entry.references;
      if (!list.includes(issue.number)) list.push(issue.number);
      entry.references = entry.references.filter((number) => !entry.closes.includes(number));
      prs.set(pr.number, entry);
    }
  }
  const pullRequests = [...prs.values()].sort((a, b) => a.mergedAt.localeCompare(b.mergedAt));

  const scopeEdits = narrativeIssues.flatMap((issue) =>
    [...(issue.edits ?? [])]
      .sort((a, b) => a.editedAt.localeCompare(b.editedAt))
      .slice(1) // the oldest revision is the original body, not an edit
      .map((edit) => ({
        issue: issue.number,
        title: issue.title,
        editedAt: edit.editedAt,
        editor: edit.editor ?? null,
        diff: clip(edit.diff, DIFF_LIMIT),
      })),
  );

  const discussion = narrativeIssues.flatMap((issue) =>
    (issue.comments ?? []).map((comment) => ({
      issue: issue.number,
      author: comment.author ?? null,
      createdAt: comment.createdAt,
      url: comment.url,
      body: clip(comment.body, COMMENT_LIMIT),
    })),
  );

  const descoped = issues
    .filter((issue) => issue.stateReason === "NOT_PLANNED")
    .map((issue) => ({ number: issue.number, title: issue.title, closedAt: issue.closedAt }));

  const linkedDecisions = decisions
    .map(({ path, content }) => ({ ...decisionMeta(path, content), references: [...issueNumbersIn(content)].filter((n) => treeNumbers.has(n)).sort((a, b) => a - b) }))
    .filter((decision) => decision.references.length);

  const gtmDrafts = issues
    .filter((issue) => issueKind(issue) === "gtm")
    .map((issue) => ({ number: issue.number, title: issue.title, url: issue.url, state: issue.state, body: clip(issue.body, COMMENT_LIMIT) }));

  const approvals = issues
    .filter((issue) => issueKind(issue) === "launch")
    .map((issue) => ({
      launch: issue.number,
      approved: (issue.labels ?? []).filter((label) => label.startsWith("approved:")),
      needs: (issue.labels ?? []).filter((label) => /^(ai:)?needs:/.test(label)),
    }));

  const timeline = [
    ...issues
      .filter((issue) => issueKind(issue) !== "gtm")
      .map((issue) => ({ date: issue.createdAt, kind: "opened", ref: issue.number, text: `${issueKind(issue)} opened: ${issue.title}` })),
    ...pullRequests.map((pr) => ({ date: pr.mergedAt, kind: "pr-merged", ref: pr.number, text: `PR merged: ${pr.title}` })),
    ...scopeEdits.map((edit) => ({ date: edit.editedAt, kind: "scope-edit", ref: edit.issue, text: `Body edited: ${edit.title}` })),
    ...descoped.map((issue) => ({ date: issue.closedAt, kind: "descoped", ref: issue.number, text: `Closed as not planned: ${issue.title}` })),
    ...discussion.map((comment) => ({ date: comment.createdAt, kind: "comment", ref: comment.issue, text: comment.body.split("\n")[0].slice(0, 160) })),
    ...linkedDecisions.map((decision) => ({ date: decision.date, kind: "decision", ref: decision.path, text: `Decision: ${decision.title}` })),
  ]
    .filter((entry) => entry.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const tasks = issues.filter((issue) => issueKind(issue) === "task");

  return {
    generatedAt,
    repo,
    root: { number: root.number, title: root.title, kind: issueKind(root), url: root.url },
    tree: toNode(issues.find((issue) => !issue.parent || !byNumber.has(issue.parent)) ?? root),
    pullRequests,
    scopeEdits,
    discussion,
    descoped,
    decisions: linkedDecisions,
    gtmDrafts,
    approvals,
    timeline,
    stats: {
      issues: issues.length,
      tasks: tasks.length,
      closedTasks: tasks.filter((issue) => issue.state === "CLOSED" && issue.stateReason !== "NOT_PLANNED").length,
      descopedTasks: descoped.length,
      mergedPullRequests: pullRequests.length,
      unmergedPullRequests: unmerged.size,
      scopeEdits: scopeEdits.length,
      decisions: linkedDecisions.length,
      firstActivity: timeline[0]?.date ?? null,
      lastActivity: timeline.at(-1)?.date ?? null,
    },
  };
}
