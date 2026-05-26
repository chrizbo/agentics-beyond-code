#!/usr/bin/env bash
# fetch-workflow-health-data.sh
#
# Deterministic pre-step script that collects GitHub Actions run metadata for
# agentic workflows and outputs structured JSON for the workflow-health agent.
#
# Usage:
#   ./.github/scripts/fetch-workflow-health-data.sh <repo> [current-run-id] [output-file]
#
# Requires: gh CLI authenticated with actions:read scope.

set -euo pipefail

REPO="${1:?Usage: $0 <repo> [current-run-id] [output-file]}"
CURRENT_RUN_ID="${2:-}"
OUTPUT_FILE="${3:-workflow-health-data.json}"
DAYS="${WORKFLOW_HEALTH_DAYS:-7}"
RUN_LIST_LIMIT="${WORKFLOW_HEALTH_RUN_LIST_LIMIT:-100}"
TOKEN_SCAN_LIMIT="${WORKFLOW_HEALTH_TOKEN_SCAN_LIMIT:-60}"

python3 - "$REPO" "$CURRENT_RUN_ID" "$OUTPUT_FILE" "$DAYS" "$RUN_LIST_LIMIT" "$TOKEN_SCAN_LIMIT" <<'PY'
import json
import math
import re
import subprocess
import sys
import time
from collections import Counter
from datetime import datetime, timezone, timedelta
from pathlib import Path

repo, current_run_id, output_file, days_s, run_limit_s, token_limit_s = sys.argv[1:7]
days = int(days_s)
run_list_limit = int(run_limit_s)
token_scan_limit = int(token_limit_s)
workspace = Path.cwd()
workflow_dir = workspace / ".github" / "workflows"
now = datetime.now(timezone.utc)
since = now - timedelta(days=days)

RUNNER_PRICE_PER_MINUTE = 0.008
PRICING_SOURCE = "https://openai.com/api/pricing/"
PRICING_EFFECTIVE = "2026-05-15"
OPENAI_PRICES = {
    "gpt-5.5": {"input": 5.00, "cached_input": 0.50, "output": 30.00},
    "gpt-5.4": {"input": 2.50, "cached_input": 0.25, "output": 15.00},
    "gpt-5-mini": {"input": 0.25, "cached_input": 0.025, "output": 2.00},
    "gpt-5.4-nano": {"input": 0.20, "cached_input": 0.02, "output": 1.25},
}
DEFAULT_PRICE_MODEL = "gpt-5.5"


def gh(args, timeout=90):
    last_err = ""
    for attempt in range(5):
        proc = subprocess.run(
            ["gh", *args],
            cwd=workspace,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
        )
        if proc.returncode == 0:
            return proc.stdout
        last_err = proc.stderr.strip()[:1000]
        if attempt < 4:
            time.sleep(2 ** attempt)
    raise RuntimeError(f"gh {' '.join(args)} failed: {last_err}")


def parse_dt(value):
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def iso(value):
    return value.isoformat().replace("+00:00", "Z") if value else None


def minutes_between(start, end):
    if not start or not end:
        return 0.0
    return max(0.0, (end - start).total_seconds() / 60.0)


def money(value):
    return round(float(value), 6)


def load_frontmatter(path):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}, ""
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, ""
    raw = parts[1].strip("\n")
    data = {}
    current_key = None
    block = []
    for line in raw.splitlines():
        if re.match(r"^[A-Za-z0-9_-]+:", line):
            if current_key and block:
                data[current_key] = "\n".join(block).rstrip()
            key, value = line.split(":", 1)
            current_key = key.strip()
            value = value.strip()
            block = [value] if value else []
        elif current_key:
            block.append(line)
    if current_key and block:
        data[current_key] = "\n".join(block).rstrip()
    return data, raw


def summarize_trigger(raw_on):
    if not raw_on:
        return "unknown"
    compact = " ".join(line.strip() for line in raw_on.splitlines() if line.strip())
    return re.sub(r"\s+", " ", compact)[:240]


def engine_field(frontmatter, field):
    engine = frontmatter.get("engine", "")
    if "\n" not in engine:
        return engine if field == "id" else frontmatter.get(field, "")
    match = re.search(rf"(?m)^\s+{re.escape(field)}:\s*([^\n#]+)", engine)
    return match.group(1).strip().strip('"\'') if match else ""


def health_status(total, success_rate, recurring_failure):
    if total == 0:
        return "inactive"
    if success_rate < 50:
        return "critical"
    if success_rate < 70 or recurring_failure:
        return "degraded"
    if success_rate < 90:
        return "needs_attention"
    return "healthy"


def classify_failure(text, run):
    text_l = (text or "").lower()
    checks = [
        ("safeoutputs/tool signaling issue", ["safeoutputs", "report_incomplete", "safe output"]),
        ("GitHub authentication or permission issue", ["not authenticated", "resource not accessible", "permission denied", "403"]),
        ("missing data or file path issue", ["no such file", "not found", "missing_data", "could not find project"]),
        ("command failed with non-zero exit", ["process completed with exit code", "exit status", "returned non-zero"]),
        ("timeout/cancellation", ["timed out", "timeout", "cancelled"]),
        ("workflow syntax/configuration error", ["invalid workflow", "yaml", "syntax error"]),
        ("network/API availability issue", ["api rate limit", "connection refused", "temporary failure", "502", "503", "504"]),
    ]
    found = [label for label, needles in checks if any(n in text_l for n in needles)]
    if found:
        return found[:3]
    if run.get("conclusion") == "cancelled":
        return ["cancelled"]
    if run.get("status") != "completed":
        return ["still running or queued"]
    if run.get("conclusion") not in (None, "success"):
        return ["failure details unavailable"]
    return []


def run_jobs(run_id):
    try:
        data = json.loads(gh(["run", "view", str(run_id), "--repo", repo, "--json", "jobs"], timeout=90))
        return data.get("jobs") or [], None
    except Exception as exc:
        return [], str(exc)[:300]


def parse_token_usage(log_text):
    usages = set()
    models = Counter()
    for line in log_text.splitlines():
        if "codex.turn.token_usage" not in line:
            continue
        pairs = dict(re.findall(r"codex\.turn\.token_usage\.([a-z_]+)=([0-9]+)", line))
        if not pairs or "total_tokens" not in pairs:
            continue
        model_match = re.search(r"\bmodel=([A-Za-z0-9_.:-]+)", line)
        if model_match:
            models[model_match.group(1)] += 1
        usage = (
            int(pairs.get("input_tokens", 0)),
            int(pairs.get("cached_input_tokens", 0)),
            int(pairs.get("non_cached_input_tokens", 0)),
            int(pairs.get("output_tokens", 0)),
            int(pairs.get("reasoning_output_tokens", 0)),
            int(pairs.get("total_tokens", 0)),
        )
        usages.add(usage)
    if not usages:
        return None
    summed = {
        "inputTokens": sum(u[0] for u in usages),
        "cachedInputTokens": sum(u[1] for u in usages),
        "nonCachedInputTokens": sum(u[2] for u in usages),
        "outputTokens": sum(u[3] for u in usages),
        "reasoningOutputTokens": sum(u[4] for u in usages),
        "totalTokens": sum(u[5] for u in usages),
        "turnsObserved": len(usages),
        "models": dict(models),
    }
    if summed["nonCachedInputTokens"] == 0 and summed["inputTokens"] >= summed["cachedInputTokens"]:
        summed["nonCachedInputTokens"] = summed["inputTokens"] - summed["cachedInputTokens"]
    return summed


def normalize_model(model):
    if not model:
        return DEFAULT_PRICE_MODEL
    m = model.lower()
    if "gpt-5.5" in m:
        return "gpt-5.5"
    if "gpt-5.4-nano" in m or ("gpt-5" in m and "nano" in m):
        return "gpt-5.4-nano"
    if "gpt-5-mini" in m or ("gpt-5" in m and "mini" in m):
        return "gpt-5-mini"
    if "gpt-5.4" in m:
        return "gpt-5.4"
    return DEFAULT_PRICE_MODEL


def token_cost(usage, configured_model=None):
    if not usage:
        return None
    model_counts = usage.get("models") or {}
    model = normalize_model(configured_model)
    if isinstance(model_counts, dict) and model_counts:
        model = normalize_model(max(model_counts.items(), key=lambda item: item[1])[0])
    prices = OPENAI_PRICES[model]
    cost = (
        usage["nonCachedInputTokens"] / 1_000_000 * prices["input"]
        + usage["cachedInputTokens"] / 1_000_000 * prices["cached_input"]
        + usage["outputTokens"] / 1_000_000 * prices["output"]
    )
    return {"model": model, "usd": money(cost), "pricesPerMillionTokens": prices}


def extract_failure_snippet(log_text):
    lines = []
    for line in log_text.splitlines():
        low = line.lower()
        if any(k in low for k in ("error", "failed", "fatal", "exception", "could not find project", "exit code")):
            cleaned = re.sub(r"\s+", " ", line).strip()
            if cleaned and cleaned not in lines:
                lines.append(cleaned[:220])
        if len(lines) >= 5:
            break
    return lines


workflow_meta = {}
for path in sorted(workflow_dir.glob("*.md")):
    frontmatter, raw = load_frontmatter(path)
    workflow_meta[path.stem] = {
        "id": path.stem,
        "file": str(path.relative_to(workspace)),
        "lockFile": f".github/workflows/{path.stem}.lock.yml",
        "description": re.sub(r"\s+", " ", frontmatter.get("description", "")).strip(),
        "engine": engine_field(frontmatter, "id"),
        "model": engine_field(frontmatter, "model"),
        "trigger": summarize_trigger(frontmatter.get("on", "")),
        "timeoutMinutes": frontmatter.get("timeout-minutes", ""),
    }

all_runs = []
workflows = {}
run_errors = []

for name, meta in workflow_meta.items():
    try:
        raw = gh([
            "run", "list",
            "--repo", repo,
            "--workflow", f"{name}.lock.yml",
            "--limit", str(run_list_limit),
            "--json", "databaseId,status,conclusion,createdAt,updatedAt,event,headBranch,url",
        ])
        listed = json.loads(raw)
    except Exception as exc:
        workflows[name] = {**meta, "runs": [], "lastRunAt": None, "error": str(exc)[:500]}
        run_errors.append({"workflow": name, "error": str(exc)[:500]})
        continue

    runs = []
    last_run_at = listed[0]["createdAt"] if listed else None
    for item in listed:
        run_id = str(item["databaseId"])
        created = parse_dt(item.get("createdAt"))
        if not created or created < since or (current_run_id and run_id == str(current_run_id)):
            continue

        jobs, jobs_error = run_jobs(run_id)
        starts = [parse_dt(j.get("startedAt")) for j in jobs if parse_dt(j.get("startedAt"))]
        ends = [parse_dt(j.get("completedAt")) for j in jobs if parse_dt(j.get("completedAt"))]
        job_minutes = sum(minutes_between(parse_dt(j.get("startedAt")), parse_dt(j.get("completedAt"))) for j in jobs)
        timing_source = "jobs"
        if not jobs:
            job_minutes = minutes_between(parse_dt(item.get("createdAt")), parse_dt(item.get("updatedAt")))
            timing_source = "run-wall-clock"
        run_start = min(starts) if starts else parse_dt(item.get("createdAt"))
        run_end = max(ends) if ends else parse_dt(item.get("updatedAt"))
        failing_steps = []
        for job in jobs:
            for step in job.get("steps") or []:
                if step.get("conclusion") and step.get("conclusion") not in ("success", "skipped"):
                    failing_steps.append({
                        "job": job.get("name"),
                        "step": step.get("name"),
                        "conclusion": step.get("conclusion"),
                    })
        run = {
            **item,
            "databaseId": int(item["databaseId"]),
            "runStart": iso(run_start),
            "runEnd": iso(run_end),
            "durationMinutes": round(job_minutes, 3),
            "timingSource": timing_source,
            "jobsError": jobs_error,
            "jobs": [
                {
                    "name": j.get("name"),
                    "conclusion": j.get("conclusion"),
                    "startedAt": j.get("startedAt"),
                    "completedAt": j.get("completedAt"),
                }
                for j in jobs
            ],
            "failingSteps": failing_steps[:8],
            "failurePatterns": [],
            "failureSnippets": [],
            "tokenUsage": None,
            "openAICost": None,
        }
        runs.append(run)
        all_runs.append({"workflow": name, **run})
    workflows[name] = {**meta, "runs": runs, "lastRunAt": last_run_at}

if workflow_meta and len(run_errors) == len(workflow_meta):
    print("Error: could not collect run data for any workflow; refusing to write a misleading empty health report.", file=sys.stderr)
    for err in run_errors[:5]:
        print(f"  {err['workflow']}: {err['error']}", file=sys.stderr)
    sys.exit(1)

token_candidates = sorted(
    [r for r in all_runs if r.get("status") == "completed"],
    key=lambda r: r.get("createdAt") or "",
    reverse=True,
)[:token_scan_limit]
token_scanned = 0
token_scan_errors = []
logs_by_run = {}

for run in token_candidates:
    rid = str(run["databaseId"])
    try:
        log = gh(["run", "view", rid, "--repo", repo, "--log"], timeout=120)
        token_scanned += 1
        logs_by_run[rid] = log
        usage = parse_token_usage(log)
        if usage:
            run["tokenUsage"] = usage
            configured_model = workflows.get(run["workflow"], {}).get("model") or None
            run["openAICost"] = token_cost(usage, configured_model)
    except Exception as exc:
        token_scan_errors.append({"runId": rid, "workflow": run["workflow"], "error": str(exc)[:300]})

for run in all_runs:
    if run.get("conclusion") in (None, "success") and run.get("status") == "completed":
        continue
    log = logs_by_run.get(str(run["databaseId"]), "")
    run["failurePatterns"] = classify_failure(log, run)
    run["failureSnippets"] = extract_failure_snippet(log)

# Copy updated all_runs records back into per-workflow run lists.
by_id = {(r["workflow"], r["databaseId"]): r for r in all_runs}
for name, wf in workflows.items():
    updated = []
    for run in wf["runs"]:
        merged = by_id.get((name, run["databaseId"]), run)
        updated.append({k: v for k, v in merged.items() if k != "workflow"})
    wf["runs"] = updated

summaries = []
for name, wf in workflows.items():
    runs = wf["runs"]
    completed_or_cancelled = [r for r in runs if r.get("status") == "completed"]
    successes = sum(1 for r in runs if r.get("conclusion") == "success")
    failures = sum(1 for r in runs if r.get("conclusion") == "failure")
    cancelled = sum(1 for r in runs if r.get("conclusion") == "cancelled")
    active = sum(1 for r in runs if r.get("status") != "completed")
    rated_total = len(completed_or_cancelled)
    success_rate = successes * 100.0 / rated_total if rated_total else 0.0
    minutes = sum(r.get("durationMinutes") or 0 for r in runs)
    observed_costs = [r["openAICost"]["usd"] for r in runs if r.get("openAICost")]
    missing_token_runs = sum(1 for r in runs if r.get("status") == "completed" and not r.get("tokenUsage"))
    avg_observed_cost = sum(observed_costs) / len(observed_costs) if observed_costs else None
    projected_openai = sum(observed_costs) + ((avg_observed_cost or 0) * missing_token_runs)
    token_totals = Counter()
    models = Counter()
    for r in runs:
        usage = r.get("tokenUsage") or {}
        for key in ("inputTokens", "cachedInputTokens", "nonCachedInputTokens", "outputTokens", "reasoningOutputTokens", "totalTokens"):
            token_totals[key] += usage.get(key, 0)
        for model, count in (usage.get("models") or {}).items():
            models[model] += count
    patterns = Counter(p for r in runs for p in (r.get("failurePatterns") or []))
    triggers = Counter(r.get("event") or "unknown" for r in runs)
    longest = max(runs, key=lambda r: r.get("durationMinutes") or 0, default=None)
    summary = {
        "workflow": name,
        "runs": len(runs),
        "successes": successes,
        "failures": failures,
        "cancelled": cancelled,
        "active": active,
        "ratedTotal": rated_total,
        "successRate": round(success_rate, 1),
        "runnerMinutes": round(minutes, 3),
        "avgDurationMinutes": round(minutes / len(runs), 3) if runs else 0,
        "runnerCostUsd": money(minutes * RUNNER_PRICE_PER_MINUTE),
        "observedOpenAICostUsd": money(sum(observed_costs)),
        "projectedOpenAICostUsd": money(projected_openai) if observed_costs else None,
        "tokenRunsObserved": len(observed_costs),
        "tokenRunsMissing": missing_token_runs,
        "tokenTotals": dict(token_totals),
        "modelsObserved": dict(models),
        "triggerBreakdown": dict(triggers),
        "failurePatterns": dict(patterns),
        "health": health_status(rated_total, success_rate, bool(patterns)),
        "longestRun": {
            "id": longest.get("databaseId"),
            "durationMinutes": longest.get("durationMinutes"),
            "url": longest.get("url"),
        } if longest else None,
        "lastRunAt": wf.get("lastRunAt"),
        "trigger": wf.get("trigger"),
        "model": wf.get("model"),
    }
    summaries.append(summary)

def overlaps(a, b):
    a_start, a_end = parse_dt(a.get("runStart")), parse_dt(a.get("runEnd"))
    b_start, b_end = parse_dt(b.get("runStart")), parse_dt(b.get("runEnd"))
    if not a_start or not b_start:
        return False
    if a_end and b_end and a_start <= b_end and b_start <= a_end:
        return True
    return abs((a_start - b_start).total_seconds()) <= 30 * 60

concurrent = []
for i, a in enumerate(all_runs):
    for b in all_runs[i + 1:]:
        if a["workflow"] == b["workflow"]:
            continue
        if overlaps(a, b):
            concurrent.append({
                "timeWindow": (a.get("runStart") or a.get("createdAt")),
                "workflowA": a["workflow"],
                "runA": a["databaseId"],
                "workflowB": b["workflow"],
                "runB": b["databaseId"],
                "risk": "medium" if a.get("event") == b.get("event") == "schedule" else "low",
            })

cascades = []
source_events = {"schedule", "workflow_dispatch"}
trigger_events = {"push", "issues", "pull_request", "issue_comment", "discussion"}
for a in all_runs:
    a_end = parse_dt(a.get("runEnd") or a.get("updatedAt"))
    if a.get("event") not in source_events or not a_end:
        continue
    for b in all_runs:
        if a["databaseId"] == b["databaseId"] or b.get("event") not in trigger_events:
            continue
        b_start = parse_dt(b.get("runStart") or b.get("createdAt"))
        if not b_start:
            continue
        delta = (b_start - a_end).total_seconds() / 60
        if 0 <= delta <= 30:
            cascades.append({
                "sourceWorkflow": a["workflow"],
                "sourceRun": a["databaseId"],
                "sourceEvent": a.get("event"),
                "triggeredWorkflow": b["workflow"],
                "triggeredRun": b["databaseId"],
                "triggeredEvent": b.get("event"),
                "minutesAfter": round(delta, 1),
            })

total_runner_minutes = sum(s["runnerMinutes"] for s in summaries)
observed_openai_cost = sum(s["observedOpenAICostUsd"] for s in summaries)
projectable = [s for s in summaries if s["projectedOpenAICostUsd"] is not None]
projected_openai_cost = sum(s["projectedOpenAICostUsd"] for s in projectable) if projectable else None

summary_doc = {
    "metadata": {
        "repository": repo,
        "generatedAt": iso(now),
        "windowStart": iso(since),
        "windowDays": days,
            "currentRunIdExcluded": current_run_id or None,
            "runListLimitPerWorkflow": run_list_limit,
        "pricing": {
            "source": PRICING_SOURCE,
            "effectiveDate": PRICING_EFFECTIVE,
            "runnerUsdPerMinute": RUNNER_PRICE_PER_MINUTE,
            "openaiUsdPerMillionTokens": OPENAI_PRICES,
            "defaultModelForMissingLogModel": DEFAULT_PRICE_MODEL,
        },
        "tokenLogScan": {
            "limit": token_scan_limit,
            "scanned": token_scanned,
            "errors": token_scan_errors[:10],
        },
        "collectionErrors": run_errors,
    },
    "totals": {
        "workflows": len(summaries),
        "runs": sum(s["runs"] for s in summaries),
        "successes": sum(s["successes"] for s in summaries),
        "failures": sum(s["failures"] for s in summaries),
        "cancelled": sum(s["cancelled"] for s in summaries),
        "active": sum(s["active"] for s in summaries),
        "runnerMinutes": round(total_runner_minutes, 3),
        "runnerCostUsd": money(total_runner_minutes * RUNNER_PRICE_PER_MINUTE),
        "observedOpenAICostUsd": money(observed_openai_cost),
        "projectedOpenAICostUsd": money(projected_openai_cost) if projected_openai_cost is not None else None,
    },
    "workflowSummaries": sorted(summaries, key=lambda s: s["workflow"]),
    "interactions": {
        "concurrentCount": len(concurrent),
        "concurrentExamples": sorted(concurrent, key=lambda x: x["timeWindow"] or "")[:30],
        "cascadeCount": len(cascades),
        "cascadeExamples": sorted(cascades, key=lambda x: x["minutesAfter"])[:30],
        "resourceConflictNote": "Resource-level conflicts require safe-output/resource logs; this pre-step reports timing and trigger risk unless log snippets expose specific resources.",
    },
}

full_doc = {**summary_doc, "workflows": workflows}

Path(output_file).write_text(json.dumps(full_doc, indent=2, sort_keys=True) + "\n", encoding="utf-8")
summary_file = str(Path(output_file).with_name(Path(output_file).stem + "-summary.json"))
Path(summary_file).write_text(json.dumps(summary_doc, indent=2, sort_keys=True) + "\n", encoding="utf-8")

print(f"Wrote workflow health data to {output_file}", file=sys.stderr)
print(f"Wrote workflow health summary to {summary_file}", file=sys.stderr)
print(f"Collected {summary_doc['totals']['runs']} runs across {summary_doc['totals']['workflows']} workflows", file=sys.stderr)
PY
