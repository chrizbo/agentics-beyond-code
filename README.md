# 🚀 Agentics Beyond Code

Agentic Workflows for PMs, ops, compliance, and other non-engineering roles — built on [GitHub Agentic Workflows](https://githubnext.com/projects/agentic-workflows/).

While [The Agentics](https://github.com/githubnext/agentics) focuses on engineering use cases (CI, code review, testing), **Agentics Beyond Code** brings the same power to the people who ship, govern, and operate products — without writing a line of code.

## 🎯 Who is this for?

- **Product Managers** — track launches, monitor feature health, keep roadmaps honest
- **Product Operations** — surface risks, automate status reporting, keep processes running
- **Compliance & Governance** — audit trails, policy checks, regulatory readiness

## 📂 Available Workflows

### 🚢 Launch Tracking

Workflows that help teams ship with confidence and visibility.

| Workflow | Description |
|----------|-------------|
| 🚦 Launch Readiness Checker | Scan issues/PRs against a launch checklist and report go/no-go status |
| 📋 Launch Countdown | Daily digest of remaining launch blockers with timeline risk assessment |
| 📣 Launch Announcement Drafter | Auto-draft release comms from merged PRs and closed issues |

### 🏥 Health & Risk

Workflows that surface problems before they become fires.

| Workflow | Description |
|----------|-------------|
| 🔴 Stale Work Detector | Flag issues/PRs that have gone quiet and may be at risk |
| 📊 Team Pulse Report | Weekly health summary — velocity, blockers, workload balance |
| ⚠️ Risk Radar | Identify and escalate cross-repo risks based on labels, staleness, and activity patterns |

### ✅ Compliance

Workflows that keep your repos audit-ready and policy-compliant.

| Workflow | Description |
|----------|-------------|
| 📝 Policy Gate | Verify PRs include required sign-offs, labels, or documentation before merge |
| 🔍 Audit Log Generator | Produce periodic compliance reports from repo activity |
| 📜 License & Attribution Checker | Scan dependencies for license compliance and flag issues |

## 🛠️ Getting Started

### Prerequisites

- [GitHub CLI](https://cli.github.com/) (`gh`)
- [Agentic Workflows CLI extension](https://github.com/github/gh-aw) (`gh extension install github/gh-aw`)

### Setup

```bash
# Clone this repo
gh repo clone chrizbo/agentics-beyond-code
cd agentics-beyond-code

# Initialize agentic workflows (if not already done)
gh aw init

# Add a workflow to your repo
gh aw add workflows/launch-readiness.md

# Compile and run
gh aw compile
gh aw run launch-readiness
```

## 🤝 Contributing

This is an early-stage project. We'd love ideas for workflows that help non-engineering roles work better with GitHub repos. Open an issue or submit a PR!

## 📖 Learn More

- [GitHub Agentic Workflows docs](https://github.github.io/gh-aw/)
- [The Agentics (engineering-focused)](https://github.com/githubnext/agentics)
- [GitHub Next — Agentic Workflows](https://githubnext.com/projects/agentic-workflows/)
