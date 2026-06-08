import assert from "node:assert/strict";
import test from "node:test";
import {
  lifecycleSearchQuery,
  markdownLinkRequests,
  placeholderRequests,
  verifyFilledDocument,
} from "./status-draft-write.mjs";

test("builds a folder-scoped lifecycle search query", () => {
  assert.equal(
    lifecycleSearchQuery("folder-id", "weekly-status:2026-06-08"),
    "'folder-id' in parents and trashed = false and appProperties has { key='agenticsLifecycleKey' and value='weekly-status:2026-06-08' }",
  );
});

test("builds deterministic replaceAllText requests", () => {
  assert.deepEqual(
    placeholderRequests({
      "{{LIFECYCLE_KEY}}": "weekly-status:2026-06-08",
      "{{COUNT}}": "2",
    }),
    [
      {
        replaceAllText: {
          containsText: { text: "{{LIFECYCLE_KEY}}", matchCase: true },
          replaceText: "weekly-status:2026-06-08",
        },
      },
      {
        replaceAllText: {
          containsText: { text: "{{COUNT}}", matchCase: true },
          replaceText: "2",
        },
      },
    ],
  );
});

test("verifies lifecycle and source markers after filling", () => {
  const plan = {
    lifecycle_key: "weekly-status:2026-06-08",
    github_source_url: "https://github.com/example/repo/discussions/1",
    replacements: { "{{LIFECYCLE_KEY}}": "weekly-status:2026-06-08" },
  };

  assert.doesNotThrow(() =>
    verifyFilledDocument(
      {
        body: {
          content:
            "weekly-status:2026-06-08 https://github.com/example/repo/discussions/1",
        },
      },
      plan,
    ),
  );
  assert.throws(
    () => verifyFilledDocument({ body: "{{LIFECYCLE_KEY}}" }, plan),
    /still contains placeholders/,
  );
});

test("converts Markdown links into native Google Docs hyperlinks", () => {
  const document = {
    tabs: [
      {
        tabId: "t.0",
        documentTab: {
          body: {
            content: [
              {
                paragraph: {
                  elements: [
                    {
                      startIndex: 10,
                      endIndex: 71,
                      textRun: {
                        content:
                          "See [Issue 1](https://github.com/example/repo/issues/1).\n",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    ],
  };

  assert.deepEqual(markdownLinkRequests(document), [
    {
      deleteContentRange: {
        range: { startIndex: 14, endIndex: 65, tabId: "t.0" },
      },
    },
    {
      insertText: {
        location: { index: 14, tabId: "t.0" },
        text: "Issue 1",
      },
    },
    {
      updateTextStyle: {
        range: { startIndex: 14, endIndex: 21, tabId: "t.0" },
        textStyle: {
          link: { url: "https://github.com/example/repo/issues/1" },
        },
        fields: "link",
      },
    },
  ]);
});

test("converts later Markdown links first so document indexes remain stable", () => {
  const document = {
    body: {
      content: [
        {
          paragraph: {
            elements: [
              {
                startIndex: 1,
                textRun: {
                  content:
                    "[One](https://example.com/1) then [Two](https://example.com/2)",
                },
              },
            ],
          },
        },
      ],
    },
  };

  const requests = markdownLinkRequests(document);
  assert.equal(requests[0].deleteContentRange.range.startIndex, 35);
  assert.equal(requests[3].deleteContentRange.range.startIndex, 1);
});

test("rejects literal Markdown links during readback verification", () => {
  const plan = {
    lifecycle_key: "weekly-status:2026-06-08",
    github_source_url: "https://github.com/example/repo/discussions/1",
    replacements: {},
  };
  const document = {
    body: {
      content: [
        {
          paragraph: {
            elements: [
              {
                startIndex: 1,
                textRun: {
                  content:
                    "weekly-status:2026-06-08 https://github.com/example/repo/discussions/1 [Issue](https://github.com/example/repo/issues/1)",
                },
              },
            ],
          },
        },
      ],
    },
  };

  assert.throws(
    () => verifyFilledDocument(document, plan),
    /still contains literal Markdown links/,
  );
});
