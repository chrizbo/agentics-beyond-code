# Automation and deployment

Use this when the user requests a schedule, event, or actual setup. This procedure
has not been tested in a tenant. Inspect live controls rather than trusting
remembered labels; verify operation availability in official connector docs.

## Execution contract

Record the selected runtime and trigger separately from the agent instructions.
For recurrence include timezone, daylight-saving expectations, reporting window,
and catch-up behavior. For events include object scope, eligibility filters,
stable event/item IDs, and self-trigger prevention. A Teams message destination
does not imply a Teams event trigger exists for the requested scope.

For each step name the operation, input/output fields, connection identity,
permission scope, and failure branch. Separate connector reads, model reasoning,
validation, and writes. Never treat retrieval failure as an empty result. Use
bounded retry for transient errors; halt and notify on persistent access failures.
Do not blindly repeat non-idempotent sends after an ambiguous timeout.

Use a stable processing key and a durable ledger suited to the environment
(such as a List or Dataverse table). Specify uniqueness or serialization and
states such as pending, approved, completed, and failed. Store destination IDs
so retries can recover after partial success. If atomic reservation is not
available, report the duplicate risk. Bind approval to the proposed action and
version; a changed proposal needs review again. Generate the digest in the
automation and show the proposed snapshot through the approval interface. The
reviewer approves readable content rather than manually supplying a hash. Name
the trigger or check that handles rejection and expiration. Reject/timeout performs no
commitment. Ensure the chosen approval mechanism can accommodate the required
wait without exceeding applicable run limits.

## Authorized setup

1. Confirm the intended account and environment from context or visible state.
   Discover available APIs/connectors before browser automation. Authoring tools
   and data-access connectors have different capabilities; do not infer that an
   Outlook connector can create a Copilot Studio agent.
2. Finish the instructions and flow configuration. Use scoped test data and
   preserve existing flows/settings. Creating, sharing, publishing, and turning
   on execution have distinct effects; use the authorization already given.
3. Configure knowledge, tools, connection references, conditions, approval,
   ledger, and failure handling. Keep recurrence off or the agent unpublished
   when activation was not requested. Inspect save behavior: some creation paths
   enable a flow immediately, so establish a safe creation path before saving.
4. Read back names, instructions, knowledge scope, tool parameters, identities,
   audience, and trigger state. A save confirmation alone is not a behavior test.
5. Run an authorized low-stakes test, inspect the run history and destination,
   and verify repeat delivery and rejection handling where feasible. A test can
   cause real writes; its scope must be authorized. Preserve the requested final
   state and report exactly what ran and what remains untested.

If setup is blocked, deliver the completed configuration and precise remaining
manual step. Do not bypass tenant policy, request broad consent by default, or
invent an importable solution ZIP/schema. For lifecycle-managed deployments,
use supported solutions, connection references, and environment variables when
appropriate, with ownership and rollback documented.
