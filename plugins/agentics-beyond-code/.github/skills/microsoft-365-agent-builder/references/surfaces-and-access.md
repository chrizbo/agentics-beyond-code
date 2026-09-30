# Microsoft surfaces and access

Documentation checked 2026-09-29. This is a routing baseline, not proof of the
user's entitlement. Recheck official documentation for capability or licensing
claims that determine the recommendation, especially before deployment. Report
separately what Microsoft documents, what this session can access, and what was
verified in the target tenant. Do not hard-code prices or capacity allowances.

| Need | Candidate | Check before committing |
|---|---|---|
| On-demand knowledge assistant | Agent Builder in Microsoft 365 Copilot | User access, supported knowledge, audience, sharing and tenant policy |
| Judgment with tools or autonomous events | Copilot Studio custom agent | Environment access, orchestration, connections, event availability, capacity and publishing rights |
| Predictable sequence with conditions and writes | Agent flow or Power Automate cloud flow | Supported trigger/action, connector tier, flow licensing, connection owner and run limits |
| Unsupported operation or external integration | Graph/custom connector/custom runtime | Exact API permissions, consent, hosting, authentication, licensing and maintenance owner |

[Agent Builder](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agent-builder-build-agents)
creates declarative agents. Its availability is not proof that full Copilot
Studio, unattended execution, or premium connectors are included.
[Agent flows](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-overview)
provide explicit automation steps. Verify which invocation and integration path
is supported rather than treating every flow as interchangeable.

[Copilot Studio event triggers](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers-about)
support external events and recurrence for agents with generative orchestration.
The documented trigger path uses maker credentials, and autonomous actions need
working authentication without user interaction. Publishing with a new trigger
allows automatic reactions. Check data policies and solution-aware cloud flow
sharing. Do not assume conversational end-user access boundaries apply to an
unattended run using the maker's connections.

[Power Automate license types](https://learn.microsoft.com/en-us/power-platform/admin/power-automate-licensing/types)
and the [licensing FAQ](https://learn.microsoft.com/en-us/power-platform/admin/power-automate-licensing/faqs)
distinguish Microsoft 365 standard-connector rights from premium capabilities.
Check the exact connector, flow type, owner/run-user licensing, and any assigned
process capacity. A Microsoft 365 subscription is not blanket entitlement for
premium or custom connectors. Confirm AI consumption separately.

For a conditional draft, enumerate the unknowns that affect execution: license,
environment role, data policies, geographic availability, connection identity,
shared-mailbox or site rights, and consumption capacity. Do not require every
fact for a simple on-demand draft. Do not change admin policy to make a build fit;
identify the administrator-owned prerequisite.

## Plan and entitlement matrix

A plan name alone does not determine the build. Record the exact SKU and assigned
service plans, then evaluate the maker, each audience segment, and unattended
execution separately. Business Basic/Standard/Premium and enterprise E/F plans
are starting facts, not synonyms for a Microsoft 365 Copilot add-on. Do not infer
Teams, Exchange, SharePoint, or Planner service access solely from an edition
name; bundles, regions, and assigned services differ.

| User / entitlement situation | Candidate path | Decision-changing check |
|---|---|---|
| Personal Microsoft account or consumer subscription | Conditional redesign using a verified supported surface | Do not assume organizational Agent Builder, Power Platform environment, or tenant data access; establish the account type first |
| Work/school Microsoft 365, without a Microsoft 365 Copilot user license | Copilot Chat agent where supported; Power Automate for deterministic rules | Tenant-data agent use can be metered; establish billing enablement and actual knowledge access |
| Microsoft 365 Copilot assigned to the interacting user | Employee-facing agent in the licensed user's context | Confirm the authenticated user, supported channel/features, and applicable included-use conditions; maker licensing alone does not cover the audience |
| Mixed audience with and without Copilot licenses | Same agent only if both access and billing paths are supported | Segment the estimate and check metered capacity for users without the add-on |
| Copilot Studio capacity or pay-as-you-go configured | Custom agent or agent flow for supported automation | Maker access, environment allocation, usage billing and publishing rights are separate checks |
| Only Microsoft 365 seeded Power Automate rights | Standard-connector cloud flow where the exact subscription permits | Inspect every operation; premium/custom connectors and AI steps need separate entitlement verification |
| Power Automate Premium or Process capacity | Cloud flow with the needed premium operations | Apply the license to the correct owner/user/process and invocation model; do not treat one maker license as universal audience coverage |
| Trial, developer environment, education, government or sovereign cloud | Conditional prototype or supported tenant-specific path | Verify production rights, expiry, regional feature/connector availability, and administrative restrictions; do not extrapolate commercial availability |

The [Copilot extensibility cost guidance](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/cost-considerations)
distinguishes licensed Microsoft 365 Copilot use from usage-based agent access
for users without that license. Shared tenant knowledge can introduce metering.
The [Copilot Studio access guide](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-licensing)
separates author access from tenant licensing and capacity. Preserve these
separations in the recommendation instead of saying simply "Copilot included."

## Interactive versus unattended billing

The [billing rules](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management)
condition included employee-facing usage on an authenticated Microsoft 365
Copilot licensed user. Agent-flow inclusion is specifically for the agent-call
trigger in that context; other triggers consume credits. A scheduled run does
not become included because its maker has Copilot. Agent flows and Power
Automate cloud flows have different billing models. Check separately billed AI
or external services within either design.

Treat capacity exhaustion as an operational failure, not empty evidence.
Determine how the chosen runtime handles exhausted capacity and how the owner
will learn about blocked runs. Set a monitoring owner and an agreed spending
boundary; enabling pay-as-you-go or purchasing capacity needs authorization.

## Decision procedure

1. Extract required operations before choosing a SKU: invocation, data reads,
   model judgment, writes, audience, and expected volume.
2. Record known facts and assumptions: base SKU, Copilot assignment for maker
   and users, Studio author access and capacity/billing, Power Automate rights,
   environment/region, data policies, and connection owners. Ask only for facts
   that change this workflow. With unknowns, give conditional paths and an
   explicit prerequisite list.
3. Mark each required operation as included under verified conditions,
   separately licensed, metered, admin-blocked, unsupported, or unverified.
   Cite the current official source for a recommendation-changing claim.
4. Prefer a deterministic standard-connector flow for rules that need no AI.
   For an on-demand assistant, evaluate Agent Builder first. For tools or
   autonomous judgment, evaluate Copilot Studio and the actual trigger. Use a
   premium flow only when its operations need it and rights are established.
5. Estimate volume with arithmetic: for example, 40 eligible events per working
   day × 22 days = 880 runs/month; 6 connector actions per run gives 5,280
   actions before pagination and retries. Estimate AI features/tokens separately
   using current rates and licensed/unlicensed audience segments. State unknown
   rates rather than producing an invented bill. Compare against capacity
   already consumed by other workflows and account for bursts and retries.
6. If the design exceeds access or capacity, narrow scope, filter or batch,
   remove unnecessary AI, or offer an on-demand alternative. Explain any latency
   or behavior change. Present an add-on or external runtime as a choice, not
   an automatic purchase or silent platform switch.
7. Put the chosen path, entitlement facts, unresolved blockers, usage estimate,
   and conditions that would change the choice at the top of the deliverable.
   Confirm them in the tenant before activation.
