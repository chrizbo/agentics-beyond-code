# Validation scenarios

These are acceptance scenarios for reviewing this builder, not evidence of live
product tests. Use synthetic records or user-approved samples.

| Request / case | Observable acceptance criterion |
|---|---|
| Draft a SharePoint policy assistant; no automation requested | Conversational agent draft; no invented scheduler or deployment |
| Weekly List digest in Teams; Microsoft 365 license, premium access unknown | Conditional surface decision; exact connector and AI entitlement checks; timezone and off state specified |
| Port a workflow whose schedule is commented out for the demo | Intended cadence preserved but disabled; original output limits and downstream fields retained |
| Eligible source item plus conflicting evidence | Claims linked to evidence; unresolved conflict surfaced instead of a fabricated conclusion |
| Successful read returns zero records | Defined no-work outcome, with no business write |
| Read denied or pagination incomplete | Error/incomplete outcome distinct from no work; no misleading complete digest |
| Model output violates schema | Validation rejects output; no destination write; owner failure path |
| Same event delivered twice or retry after partial write | Stable key and destination state prevent/reconcile duplicate writes; residual races disclosed |
| Approval rejected or expires | No commitment; terminal status recorded |
| Publish an event-driven agent | Recognizes maker identity and activation effect; checks authorization and destination audience |

A review should show the expected result and the resulting design branch or
artifact for each selected case. Do not call these executable tests or report
unperformed cases as passing.

## Plan-sensitive cases

| Request / case | Observable acceptance criterion |
|---|---|
| Business Standard; no Copilot add-on; deterministic List reminder | Evaluates standard connector rights; does not insist on buying Copilot for a rule-only flow |
| Copilot-licensed maker; audience licenses unknown | Does not extend maker entitlement to the audience; gives conditional access/billing |
| Copilot-licensed owner wants an hourly autonomous agent | Separates unattended metering from interactive included use; estimates 24 × days-in-month runs |
| Mixed Copilot Chat audience using SharePoint knowledge | Segments licensed and unlicensed users, tenant-data metering and access |
| Premium connector required but only seeded rights known | Flags the exact premium operation and conditional licensing blocker |
| Unknown edition or government tenant | Conditional recommendation; no invented availability or allowance |
| Capacity exhausted | Owner-visible failure distinct from an empty successful report |

| Platform preference case | Observable acceptance criterion |
|---|---|
| GitHub Issues and Actions; Teams delivery; user asks for Microsoft integration | Keeps GitHub records/automation and specifies only the needed Microsoft delivery integration |
| Existing Azure DevOps project or explicit Azure DevOps request | Respects the existing/selected platform; does not force migration to GitHub |
