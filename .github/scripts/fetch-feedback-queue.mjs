#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const PROJECT_NUMBER = Number(process.env.FEEDBACK_PROJECT_NUMBER || "3");
const OUTPUT_PATH = process.argv[2] || "feedback-queue.json";
const SUMMARY_PATH = process.argv[3] || "feedback-queue-summary.json";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    input: options.input,
    stdio: options.input === undefined ? ["ignore", "pipe", "pipe"] : ["pipe", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    const stderr = result.stderr ? `\n${result.stderr}` : "";
    throw new Error(`${command} ${args.join(" ")} failed${stderr}`);
  }

  return result.stdout ?? "";
}

function tempFile(prefix, contents) {
  const dir = mkdtempSync(path.join(tmpdir(), "feedback-queue-"));
  const file = path.join(dir, prefix);
  writeFileSync(file, contents);
  return file;
}

function graphql(query, variables = {}) {
  const inputFile = tempFile("graphql.json", JSON.stringify({ query, variables }));
  return JSON.parse(run("gh", ["api", "graphql", "--input", inputFile]));
}

function fieldValue(node) {
  if (!node?.field?.name) return null;
  if (node.__typename === "ProjectV2ItemFieldTextValue") {
    return [node.field.name, node.text ?? ""];
  }
  if (node.__typename === "ProjectV2ItemFieldSingleSelectValue") {
    return [node.field.name, node.name ?? ""];
  }
  if (node.__typename === "ProjectV2ItemFieldNumberValue") {
    return [node.field.name, node.number ?? null];
  }
  if (node.__typename === "ProjectV2ItemFieldDateValue") {
    return [node.field.name, node.date ?? ""];
  }
  return null;
}

const result = graphql(
  `query($number: Int!) {
    viewer {
      projectV2(number: $number) {
        id
        title
        url
        items(first: 100) {
          nodes {
            id
            content {
              __typename
              ... on Issue {
                number
                title
                body
                url
                state
                createdAt
                updatedAt
                labels(first: 30) {
                  nodes {
                    name
                  }
                }
              }
            }
            fieldValues(first: 30) {
              nodes {
                __typename
                ... on ProjectV2ItemFieldTextValue {
                  text
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldNumberValue {
                  number
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldDateValue {
                  date
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`,
  { number: PROJECT_NUMBER },
);

const project = result?.data?.viewer?.projectV2;
if (!project?.id) {
  throw new Error(`Unable to load feedback project ${PROJECT_NUMBER}`);
}

const issues = (project.items?.nodes ?? [])
  .filter((item) => item?.content?.__typename === "Issue")
  .map((item) => {
    const fields = {};
    for (const node of item.fieldValues?.nodes ?? []) {
      const entry = fieldValue(node);
      if (entry) fields[entry[0]] = entry[1];
    }

    const labels = (item.content.labels?.nodes ?? []).map((label) => label.name).filter(Boolean);
    return {
      project_item_id: item.id,
      number: item.content.number,
      title: item.content.title,
      url: item.content.url,
      state: item.content.state,
      created_at: item.content.createdAt,
      updated_at: item.content.updatedAt,
      labels,
      project_fields: fields,
      body: item.content.body,
    };
  })
  .filter((issue) => issue.labels.includes("feedback:intake"))
  .sort((a, b) => a.number - b.number);

const payload = {
  generated_at: new Date().toISOString(),
  project: {
    id: project.id,
    title: project.title,
    url: project.url,
    number: PROJECT_NUMBER,
  },
  issues,
};

const summary = {
  generated_at: payload.generated_at,
  project: payload.project,
  issues: issues.map((issue) => ({
    number: issue.number,
    title: issue.title,
    url: issue.url,
    labels: issue.labels,
    project_fields: issue.project_fields,
    excerpts: excerptSection(issue.body, "### Exact Phrases"),
    terminology: excerptSection(issue.body, "### Terminology"),
    errors_commands_products: excerptSection(issue.body, "### Error Messages / Commands / Product Names"),
    source: excerptSection(issue.body, "## Source Evidence"),
  })),
};

mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
writeFileSync(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`);

console.log(`Wrote ${issues.length} feedback issue(s) to ${OUTPUT_PATH} and ${SUMMARY_PATH}.`);

function excerptSection(body, heading) {
  const text = typeof body === "string" ? body : "";
  const start = text.indexOf(heading);
  if (start === -1) return "";
  const afterHeading = text.slice(start + heading.length);
  const next = afterHeading.search(/\n#{2,3} /);
  const section = next === -1 ? afterHeading : afterHeading.slice(0, next);
  return section.replace(/<!--[\s\S]*?-->/g, "").trim();
}
