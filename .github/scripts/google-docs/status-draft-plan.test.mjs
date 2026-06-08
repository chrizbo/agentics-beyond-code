import assert from "node:assert/strict";
import test from "node:test";
import { buildStatusDraftPlan } from "./status-draft-plan.mjs";

const discussion = {
  discussionTitle: "[Weekly Status] Week of 2026-06-08",
  discussionUrl:
    "https://github.com/chrizbo/agentics-beyond-code/discussions/123",
  discussionBody: `# Weekly Status — Week of 2026-06-08

> **4 initiatives** · **7 active launches** · **2 items shipped** · **3 items needing attention**

---

## 🚀 What Shipped

* [Audit export](https://example.com/audit) - Beta is live.
* [Status reports](https://example.com/status) - New summary launched.

## 🧠 What We Learned

* Longer retention needs an explicit customer tier.

## 📢 FYI

* Security review moved to Thursday.

## 🆘 SOS

* Atlas Bank needs an owner for migration support.

---

### 📊 Portfolio Snapshot

| Metric | Count |
|---|---:|
| Active initiatives | 4 |
| Active launches | 7 |
| Launches on track (🟢) | 3 |
| Launches needing attention (🟡) | 2 |
| Launches at risk (🟠) | 1 |
| Launches high risk (🔴) | 1 |
| Open blockers | 2 |
`,
};

test("builds a complete staged status draft plan", () => {
  const plan = buildStatusDraftPlan({
    ...discussion,
    owner: "chrizbo",
    reviewDeadline: "2026-06-11",
    titlePrefix: "[Status Draft]",
  });

  assert.equal(plan.staged, true);
  assert.equal(plan.lifecycle_key, "weekly-status:2026-06-08");
  assert.equal(plan.proposed_title, "[Status Draft] Week of 2026-06-08");
  assert.equal(plan.replacements["{{OWNER}}"], "chrizbo");
  assert.equal(plan.replacements["{{INITIATIVE_COUNT}}"], "4");
  assert.equal(plan.replacements["{{ACTIVE_LAUNCH_COUNT}}"], "7");
  assert.equal(plan.replacements["{{SHIPPED_COUNT}}"], "2");
  assert.equal(plan.replacements["{{ATTENTION_COUNT}}"], "3");
  assert.equal(plan.replacements["{{ON_TRACK_LAUNCH_COUNT}}"], "3");
  assert.equal(plan.replacements["{{ATTENTION_LAUNCH_COUNT}}"], "2");
  assert.equal(plan.replacements["{{AT_RISK_LAUNCH_COUNT}}"], "1");
  assert.equal(plan.replacements["{{HIGH_RISK_LAUNCH_COUNT}}"], "1");
  assert.equal(plan.replacements["{{OPEN_BLOCKER_COUNT}}"], "2");
  assert.match(plan.replacements["{{WHAT_SHIPPED}}"], /Beta is live/);
  assert.doesNotMatch(plan.replacements["{{WHAT_SHIPPED}}"], /^\*/m);
});

test("fails closed when a required section is missing", () => {
  assert.throws(
    () =>
      buildStatusDraftPlan({
        ...discussion,
        discussionBody: discussion.discussionBody.replace(
          /## 🆘 SOS[\s\S]*?(?=\n---)/,
          "",
        ),
      }),
    /missing sections: SOS/,
  );
});

test("fails closed when the reporting week is absent", () => {
  assert.throws(
    () =>
      buildStatusDraftPlan({
        ...discussion,
        discussionTitle: "Weekly Status",
        discussionBody: discussion.discussionBody.replaceAll(
          "Week of 2026-06-08",
          "Current week",
        ),
      }),
    /Week of YYYY-MM-DD/,
  );
});

