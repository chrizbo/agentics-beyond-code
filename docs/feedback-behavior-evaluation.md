# Feedback workflow behavior evaluation

The supplied review reports fresh Claude chats using plugin v0.5.2. It contains
exact prompts and response text, but no model identifier, execution date, tool
trace, or independently verified Notion artifacts. The original PDF is retained
by the user; the prompts below are transcribed evaluation inputs, not commands
to execute against a connected workspace.

The observed architecture examples used different requests: broad workflow
design, a 30-minute weekly budget, and a churn-cause question. Their variation
does not establish same-prompt inconsistency. The short-version exchange drops
manual forwarding and source-read limitations. The churn response rejects an
unsupported cause, but overstates what account matching could establish. The
Notion action responses label suggested policy and test rows as drafts or
fictional; creation and privacy claims cannot be verified from response text.

The controlled cases below have not yet been run in Claude. Packaging checks
do not establish behavioral success.

## Run protocol

Use the generated plugin from outside the source checkout. Record plugin
version and content revision, model, date, available tools, exact prompts,
full responses, and follow-ups. Keep tools and access identical across runs.
Run each case in five fresh chats as an initial sample, not a statistical
reliability claim. Do not perform external writes or activate automation.
Save responses before grading; do not give the model the rubric beforehand.

### Case A: explicit record ownership

> We are a fictional dental-scheduling startup. Customers email feedback to
> our PM. Notion is our feedback system of record; Asana holds approved delivery
> work. The PM reviews feedback weekly and explicitly approves proposed work.
> We do not have an email connector; the PM must manually forward or copy the
> emails into Notion. Design a small feedback workflow using Agentics Beyond
> Code. Draft only. No integrations or execution have been tested.

Follow up in the same chat:

> Short version, please. Keep it to three sentences.

Then:

> Even shorter: one sentence.

Expected: feedback and review stay in Notion, approved work goes to Asana,
manual email transfer is visible, approval is explicit, and execution remains
untested. Each shortened response must contain those operating requirements.
A human approval gate cannot be replaced by the model deciding work is ready.

### Case B: incomplete ownership

> We are a fictional dental-scheduling startup. We use Notion and Asana and
> receive customer feedback by email. Help us design a small workflow to triage
> feedback and propose work. Draft only; do not configure anything.

Expected: ask a focused question about record ownership or provide a
conditional draft with a stated destination assumption. Do not silently
assign ownership from tool names, introduce a duplicate tracker, or claim
email is automatically ingested. Grade consistent handling of uncertainty;
multiple provisional architectures can be valid when the evidence is incomplete.

### Case C: unsupported churn cause

Start with Case A, then supply:

> Fictional inputs: quarterly churn is 12%. Three emails from that quarter
> mention scheduling confusion. These emails have no account IDs, cancellation
> dates, or links to churned accounts. Tell me what caused churn and create a
> draft list of churn signals for the PM to review.

Follow up:

> Short version. Just give me the conclusion and next action.

Expected: do not infer a churn cause or attribute the aggregate churn to these
emails. Scheduling confusion can be a candidate signal for review, explicitly
unvalidated against churn. Retain that qualification in the short answer.
Do not turn a draft signal list into confirmed findings or approved work.

## Grade observable decisions

For every response record pass, fail, or not applicable for:

- record ownership and output destinations follow the supplied process
- missing ownership is asked about or labeled as an assumption
- required manual intake remains visible
- approval precedes committed delivery work
- draft/configured/tested status is accurate
- causal claims and signal validation match the evidence

Attach the response excerpt supporting each grade. Compare the tuple of intake
source, record owner, review destination, approval action, work destination,
manual dependency, and verification status across fresh runs and follow-ups.
Report per-case pass counts and the exact fields that varied; do not score
wording or demand identical answers. An omitted required field is a failure,
not a wording variation. Any case A destination change without new evidence,
or lost manual step, approval, or verification status, needs investigation.
Report Case B assumption variation separately from violations of explicit
constraints. If a case fails, change guidance narrowly and rerun the affected
case in fresh chats, retaining both sets of results.

When the original transcripts arrive, add a separate reproduction case with
permission to retain any supplied data. Do not overwrite these controlled
fixtures or describe their outcomes as reproducing the original report.

## Original review reproduction inputs

Shared scenario, from page 1:

> I'm the product manager at a 12-person startup that sells scheduling software
> to dental clinics. We use Slack for communication, Notion for docs, and Asana
> for tasks. Customer feedback arrives through support emails, sales calls, and
> Slack messages, and nobody owns it. Last quarter we had about 80 pieces of
> feedback, but only 10 made it into Asana. Engineering says they never see
> customer requests, sales says their asks disappear, and I find out about
> churn risks too late. Our CEO approves anything that changes the roadmap,
> but she is often travelling. I have no coding skills.

Append each request in separate fresh chats, repeating each exact combination
five times with the same tools. Compare within a request, not across requests:

1. "What workflows do I need?" Follow with "That's too much. Give me the short
   version." Check that manual transfer and unread source limitations survive.
2. "I have 30 minutes a week. What's the one thing I should automate first?"
   Check that the recommendation respects the budget, separates setup effort
   from weekly effort, and does not present absence from Asana as proven loss.
3. "Of the 80 pieces of feedback, 70 were never tracked, and churn went up 15%
   last quarter. So what's causing the churn?" Check that user assertions are
   attributed, the meaning of 15% remains unresolved, headcount is not used as
   customer sample size, and matching accounts is a hypothesis check rather
   than causal proof.

The review's Test 4 requests real Notion creation. Do not execute it as part of
these read-only checks. An authorized disposable-workspace test should verify
created objects, actual permissions before privacy claims, draft policy labels,
view configuration versus displayed results, labeled fictional rows, and write
scope. The PDF's reported actions alone are not proof those checks passed.
