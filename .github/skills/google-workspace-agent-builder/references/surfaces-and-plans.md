# Google surfaces, plans, and quotas

Documentation checked 2026-09-29. Google changes availability, quotas, and
admin defaults often; treat this as the starting point for a draft and verify
the specific row the recommendation depends on before creating or enabling
anything. Items not stated in the sources below are listed as unverified in
[field observations](observed-google-workspace-behavior.md).

## Capability by surface

| Surface | Good for | Availability and gates |
|---|---|---|
| Workspace Studio flow | Starter → steps. Scheduled, Gmail, Calendar, Sheets, Drive, and manual starters; Ask Gemini; Workspace actions such as reply to email, send a Chat reply (markdown), copy or move Drive files, and write to Sheets; NotebookLM and Gemini Enterprise agent steps; an Approvals page for sensitive actions | Business Starter, Standard, Plus; Enterprise Standard, Plus; Education Fundamentals, Standard, Plus; Teaching and Learning add-on; Google AI Pro for Education. An admin must turn Gemini on. Personal accounts only through Google Workspace Experiments. Users under 18 on school accounts cannot use AI steps |
| Studio skill | Reusable instructions used on demand in Gemini in Workspace, in Studio, and by an Ask Gemini step | Broader: Business and Enterprise Starter/Standard/Plus, Education editions, Frontline, Enterprise Essentials and Essentials Plus, Nonprofits, AI Pro for Education, AI Expanded Access. Admin setting turns skills on or off |
| Custom starters | Real-time triggers from other applications | Same editions as Studio, plus AI Expanded Access. Generally available. **Off by default**; admin enables in the Admin console. End users: Rapid Release from 2026-09-21, Scheduled Release gradual from 2026-09-30 |
| Custom steps (Apps Script) | Custom logic inside a flow, such as a call to the GitHub API | Same as custom starters. Off by default; separate approval settings |
| Third-party integrations | Asana, Confluence, HubSpot, Jira, Mailchimp, QuickBooks, Salesforce, Slack | Same editions. **Beta.** Off by default; admins can allow or block individual integration steps. Integration steps can share Google account data |
| Webhooks | Outbound only: HTTP requests from a flow to external endpoints, such as GitHub `repository_dispatch`. Inbound events from other systems need a custom starter or a polling schedule | Same editions. Off by default; respects sensitive-step approval settings. **URL allowlist only on Business Plus, Enterprise Standard and Plus, Education Standard and Plus.** Without an allowlist, webhooks still work once enabled; the admin simply cannot restrict destinations, which some admins will treat as a reason to leave them off |
| Gemini Enterprise agent | Agent Designer (no-code, GA 2026-01-12) agents over enterprise data; callable from Studio flows | Separate Google Cloud license, roughly $21 (Business), $30 (Standard), $50–60 (Plus) per user per month, plus usage for custom agents. Third-party pricing summaries; confirm with Google |
| Apps Script alone | Time-driven and event triggers with deterministic logic; no Studio quota. Can call the Gemini API for a judgment step | All Workspace editions and consumer accounts, under Apps Script quotas. A Gemini API call needs an API key or Cloud project owned by someone; keep the key in script properties, never in code or prompts, and note it is billed and governed separately from Gemini in Workspace |
| Workspace MCP server | External agents reading and writing Gmail, Drive, Docs, Sheets, Calendar, Chat | All Workspace customers (gradual rollout from 2026-05-01); admin API controls apply. Runs outside Google: use `claude-native-workflow-builder` |

Admins can also turn off individual Studio steps and require end-user approval
when an action may share data outside the organization.

## Studio run quotas

| Plan | Flow runs per month |
|---|---|
| Business Starter | 100 |
| Business Standard or Plus | 400 |
| AI Expanded Access add-on (Business or Enterprise Standard/Plus) | 2,000 |
| AI Ultra Access | 10,000 |

Per-month figures come from third-party summaries of Google's limits page;
Google's own limits page states the structural limits below and a daily cap
without a number. Enterprise and Education monthly figures were not found.

- A daily run cap for all of a user's flows combined; the number is not
  published. When hit, active flows stop and the Activity tab shows the
  failures until the 24-hour reset.
- At most 25 flows per user, on or off.
- At most 20 steps per flow.
- At most 25 active flows started by Gmail events.

All of a user's flows share the quota, so estimate the new flow against what
the owner already runs.

## Decision rules

Apply in order; the first that fits is the recommendation, with the next one
named as the alternative.

1. Personal account, Gemini turned off, or the owner does not want a Google
   dependency → `claude-native-workflow-builder`. If a personal-account user
   specifically wants Gemini, name Apps Script calling the Gemini API as the
   alternative, with its key ownership and code maintenance cost.
2. Deterministic rule with no judgment step → Apps Script alone, or a Studio
   flow without Ask Gemini if the quota allows and the owner prefers no code.
3. On-demand or chat use only → Studio skill.
4. Unattended run, the edition supports Studio, the needed steps are native
   or their admin settings are on, and the estimated runs fit the quota → Studio
   flow with Ask Gemini using a Studio skill.
5. As 4, but runs do not fit → narrow the starter; else batch on a schedule;
   else skill-only or Apps Script; else AI Expanded Access or Ultra (name the
   cost as a decision for the owner).
6. Records stay in GitHub or Jira → hybrid: the record system keeps its own
   builder; Studio handles Google-side intake or delivery. Studio to GitHub:
   a webhook, custom step, or integration. GitHub to Studio: a custom
   starter, or a scheduled flow that reads a Sheet or email the record system
   already writes. Flag admin enablement, beta status for
   integrations, and the absence of a webhook URL allowlist below Business
   Plus.
7. Enterprise-data agents needed and a Gemini Enterprise license exists →
   Gemini Enterprise agent called from a Studio flow.

## Sources

- [Get started with Workspace Studio](https://support.google.com/workspace-studio/answer/16444479)
- [Workspace Studio limits](https://support.google.com/workspace-studio/answer/16765942)
- [Custom starters and steps, integrations, and webhooks (2026-09-17)](https://workspaceupdates.googleblog.com/2026/09/automate-workflows-with-custom-starters-and-steps-third-party-integrations-and-webhooks-in-Workspace-Studio.html)
- [New Drive, Gmail, and Chat steps (2026-09)](https://workspaceupdates.googleblog.com/2026/09/automate-drive-gmail-and-google-chat-actions-with-new-steps-in-Workspace-Studio.html)
- [AI Expanded Access](https://workspaceupdates.googleblog.com/2026/02/google-workspace-ai-expanded-access.html)
- [Turn skills on or off](https://knowledge.workspace.google.com/admin/studio/turn-skills-on-or-off)
- [Workspace Studio updates from Cloud Next 2026](https://pulse.appsscript.info/p/2026/05/workspace-studio-updates-from-cloud-next-2026-skills-agents-and-approvals/)
- [10 more announcements for Workspace at Next 2026](https://workspace.google.com/blog/product-announcements/10-more-announcements-workspace-at-next-2026)
- [Gemini Enterprise](https://cloud.google.com/blog/products/ai-machine-learning/the-new-gemini-enterprise-one-platform-for-agent-development)
