// Pure planning for release-story fixtures. The seeder turns these ops into
// GitHub writes; keeping planning separate makes ordering and validation testable.

const ISSUE_REF = /\{\{issue:([a-z0-9-]+)\}\}/g;

export function issueRefs(text = "") {
  return [...String(text).matchAll(ISSUE_REF)].map((match) => match[1]);
}

export function renderTemplate(text, { issues = {}, date }) {
  return String(text ?? "")
    .replaceAll("{{date}}", date)
    .replace(ISSUE_REF, (_, key) => {
      const issue = issues[key];
      if (!issue?.number) throw new Error(`Unresolved issue reference {{issue:${key}}}`);
      return `#${issue.number}`;
    });
}

export function commentMarker(storyId, stageName, index) {
  return `<!-- release-story:${storyId}:${stageName}:${index} -->`;
}

function actionRefs(action) {
  return [
    action.key,
    ...(action.closes ?? []),
    ...(action.references ?? []),
    ...issueRefs(action.body),
    ...issueRefs(action.comment),
    ...issueRefs(action.content),
    ...issueRefs(action.file),
  ].filter((key) => key && !key.startsWith("pr-"));
}

// Orders issue creation so every {{issue:key}} in a body already exists.
function orderCreates(keys, story, known) {
  const pending = keys.filter((key) => !known.has(key));
  const ordered = [];
  while (pending.length) {
    const index = pending.findIndex((key) => {
      const issue = story.issues.find((item) => item.key === key);
      return issueRefs(issue.body).every((ref) => known.has(ref));
    });
    if (index === -1) {
      throw new Error(`Cannot order issue creation; unresolved references among: ${pending.join(", ")}`);
    }
    const [key] = pending.splice(index, 1);
    known.add(key);
    ordered.push(key);
  }
  return ordered;
}

export function planStage(story, stageName, state = {}) {
  const stage = story.stages.find((item) => item.name === stageName);
  if (!stage) {
    throw new Error(`Unknown stage "${stageName}". Stages: ${story.stages.map((item) => item.name).join(", ")}`);
  }

  const known = new Set(Object.keys(state.issues ?? {}));
  const ops = [];

  stage.actions.forEach((action, index) => {
    if (action.type === "create-issues") {
      for (const key of action.keys) {
        if (!story.issues.some((item) => item.key === key)) throw new Error(`Unknown issue key "${key}"`);
      }
      const created = orderCreates(action.keys, story, known);
      for (const key of created) {
        const issue = story.issues.find((item) => item.key === key);
        ops.push({ op: "create-issue", key, title: issue.title, body: issue.body, labels: issue.labels ?? [] });
      }
      for (const key of created) {
        const issue = story.issues.find((item) => item.key === key);
        if (issue.parent) ops.push({ op: "link-parent", key, parent: issue.parent });
      }
      return;
    }

    const missing = actionRefs(action).filter((key) => !known.has(key));
    if (missing.length) {
      throw new Error(`Stage "${stageName}" action ${index} (${action.type}) needs issues that do not exist yet: ${missing.join(", ")}. Run earlier stages first.`);
    }

    switch (action.type) {
      case "set-phase":
        ops.push({ op: "set-phase", key: action.key, phase: action.phase });
        break;
      case "comment":
        ops.push({ op: "comment", key: action.key, body: action.body, marker: commentMarker(story.id, stageName, index) });
        break;
      case "edit-body":
        ops.push({ op: "edit-body", key: action.key, body: action.body });
        break;
      case "close-issue":
        ops.push({ op: "close-issue", key: action.key, reason: action.reason ?? "completed", comment: action.comment });
        break;
      case "merge-pr":
        ops.push({
          op: "merge-pr",
          key: action.key,
          branch: `release-story/${story.id}/${action.key}`,
          title: action.title,
          body: action.body,
          file: action.file,
          content: action.content,
          closes: action.closes ?? [],
        });
        break;
      default:
        throw new Error(`Unknown action type "${action.type}"`);
    }
  });

  return { stage: stage.name, summary: stage.summary, ops };
}
