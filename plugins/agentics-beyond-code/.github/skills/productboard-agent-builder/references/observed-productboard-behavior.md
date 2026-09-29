# Productboard field observations — 2026-09-29

Source: user-supplied reports from Claude browser tests and Spark outputs in one
signed-in workspace. These were not independently observed by the author of
this reference. They establish a tested route in that workspace, not universal
product guarantees. No private workspace IDs, addresses, or output links are
needed to reuse the findings. Verify current controls at the point of action;
do not repeat the entire investigation for every deployment.

| Area | Reported observation | Consequence for the builder |
|---|---|---|
| MCP | The connected integration exposed 21 tools for identity, documents, comments, entities, field options, and feedback, with no skill or schedule administration. | Default to browser deployment. Recheck MCP/API only for new capability evidence or a user request. This is not a claim that every Productboard integration lacks these operations. |
| Editor | Agent → Skills → Add Skill offered Create with Spark, Write Skill instructions, and Upload a Skill. Direct editing worked. | Prefer the editor for prepared instructions; inspect current labels. Upload support was not exercised. |
| Defaults | Creation defaulted to Agent & Slash command. Personal visibility and manual-only invocation were saved successfully. | Inspect and deliberately set defaults before saving. |
| Persistence | A same-browser reopen and normalized hash matched a local draft while another session still showed older server content. A subsequent explicit save was confirmed in the independent session. | Verify persisted state independently; local draft matches do not prove a successful save. |
| Automation form | Manual, Hourly, Daily, Weekdays, and Weekly were visible. No one-time option was seen. Selecting a skill added `Use /assumption-surfacer` to Instructions. | Use observed options and explicit invocation text. Do not assume all accounts have identical options. |
| Skill picker | The saved picker reloaded blank despite selection and another save. Both output chats showed the intended skill chip. | Preserve the invocation text and verify execution. Do not assume the picker persisted or keep retrying saves after invocation is established. |
| Delivery | Email was shown as delivery to the registered account with no document creation; Document showed a Personal-section destination. One manual and one timed run delivered email to the registered account and generated output chats. | Verify requested destination, actual receipt, and chat separately. Document delivery was not tested; title searches found no output document but were not exhaustive. |
| Activation | Manual mode had no visible activation control. After saving Daily, a switch appeared; turning it on changed Paused to Active. | Inspect controls after selecting and saving a scheduled frequency. Switching the control off was not tested, so pause effectiveness remains to verify. |
| Timing | Daily was configured for 11:24 America/Los_Angeles. Displayed next run shifted to 11:25 and 11:26; execution was reported at 11:27. The following day's displayed time was 11:28. | Report configured, displayed, and observed times separately. Cause, long-term recurrence accuracy, and daylight-saving behavior remain unresolved. |
| Cleanup | Authorized deletion removed the automation from the list; its URL reported not found. The skill remained. Emails and output chats remained accessible at verification time. | Preserve required run evidence before deletion. Do not generalize retention guarantees or treat deletion as default cleanup. |

## What the behavioral tests established

The adapted Assumption Surfacer identified evidence-grounded risks in a
fictional brief and recognized a labeled hypothesis with a validation plan as
a no-high-risk-findings case. Revisions improved overlapping-risk merging,
suggested-role labels, and missing-context handling. Both manual and timed
automation reports showed the skill loaded and email received. Exact wording
varied; evaluate semantic correctness unless exact wording is required.

## Still unverified

- Native event/webhook triggering or public skill-management API operations.
- One-time scheduling outside the tested form, pause effectiveness, and queued
  run cancellation when changing to Manual.
- The internal email delivery mechanism, other recipients/destinations, uploads,
  other workspaces, and other permission levels.

For setup details not resolved by current controls, consult the official
[automation guide](https://support.productboard.com/hc/en-us/articles/51602415708563-Schedule-automations-with-Spark)
and [skill guide](https://support.productboard.com/hc/en-us/articles/51202982788755-Agentic-skills-with-Spark).
These links are references for further verification, not claims that every
observation above is documented there.
