import assert from "node:assert/strict";
import test from "node:test";
import { documentToStatusMarkdown } from "./status-finalization-convert.mjs";

function paragraph(text, namedStyleType = "NORMAL_TEXT", extra = {}) {
  return {
    paragraph: {
      elements: [{ textRun: { content: `${text}\n`, textStyle: {} } }],
      paragraphStyle: { namedStyleType },
      ...extra,
    },
  };
}

test("converts only the publishable status report into Markdown", () => {
  const document = {
    tabs: [
      {
        documentTab: {
          body: {
            content: [
              paragraph("Lifecycle key: weekly-status:2026-06-08"),
              paragraph("Weekly Status — Week of 2026-06-08", "HEADING_1"),
              paragraph("What Shipped", "HEADING_2"),
              {
                paragraph: {
                  elements: [
                    {
                      textRun: {
                        content: "Frontend Implementation",
                        textStyle: { link: { url: "https://example.com/issue/1" } },
                      },
                    },
                    { textRun: { content: " shipped.\n", textStyle: {} } },
                  ],
                  paragraphStyle: { namedStyleType: "NORMAL_TEXT" },
                  bullet: { nestingLevel: 0 },
                },
              },
              paragraph("What We Learned", "HEADING_2"),
              paragraph("A useful lesson.", "NORMAL_TEXT", { bullet: {} }),
              paragraph("FYI", "HEADING_2"),
              paragraph("For awareness.", "NORMAL_TEXT", { bullet: {} }),
              paragraph("SOS", "HEADING_2"),
              paragraph("No items.", "NORMAL_TEXT", { bullet: {} }),
              paragraph("Portfolio Snapshot", "HEADING_3"),
              {
                table: {
                  tableRows: [
                    {
                      tableCells: [
                        { content: [paragraph("Metric")] },
                        { content: [paragraph("Count")] },
                      ],
                    },
                    {
                      tableCells: [
                        { content: [paragraph("Active initiatives")] },
                        { content: [paragraph("1")] },
                      ],
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

  assert.equal(
    documentToStatusMarkdown(document),
    [
      "# Weekly Status — Week of 2026-06-08",
      "",
      "## What Shipped",
      "",
      "- [Frontend Implementation](https://example.com/issue/1) shipped.",
      "",
      "## What We Learned",
      "",
      "- A useful lesson.",
      "",
      "## FYI",
      "",
      "- For awareness.",
      "",
      "## SOS",
      "",
      "- No items.",
      "",
      "### Portfolio Snapshot",
      "",
      "| Metric | Count |",
      "| --- | --- |",
      "| Active initiatives | 1 |",
      "",
    ].join("\n"),
  );
});

test("fails closed when the publishable report heading is absent", () => {
  assert.throws(
    () => documentToStatusMarkdown({ body: { content: [paragraph("Lifecycle")] } }),
    /missing the publishable Weekly Status heading/,
  );
});
