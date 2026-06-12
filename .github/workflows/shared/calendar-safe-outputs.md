---
safe-outputs:
  jobs:
    calendar-update-event-brief:
      description: "Append a meeting brief to a Google Calendar event description. Dry-run by default; set CALENDAR_WRITE_ENABLED=true to enable writes."
      runs-on: ubuntu-latest
      timeout-minutes: 5
      output: "Calendar event brief written"
      permissions:
        contents: read
        issues: write
      inputs:
        event_id:
          description: "Google Calendar event ID to update."
          required: true
          type: string
        brief_content:
          description: "Meeting brief to append. Must fit between meeting-brief-start and meeting-brief-end markers."
          required: true
          type: string
        calendar_id:
          description: "Google Calendar ID (email address of the calendar). Defaults to the GOOGLE_CALENDAR_ID variable."
          required: false
          type: string
        github_source_url:
          description: "GitHub issue, discussion, pull request, or run URL that is the durable source of this brief."
          required: true
          type: string
      steps:
        - name: Write validated calendar event brief
          uses: actions/github-script@v9.0.0
          env:
            GOOGLE_OAUTH_CLIENT_ID: ${{ secrets.GOOGLE_OAUTH_CLIENT_ID }}
            GOOGLE_OAUTH_CLIENT_SECRET: ${{ secrets.GOOGLE_OAUTH_CLIENT_SECRET }}
            GOOGLE_OAUTH_REFRESH_TOKEN: ${{ secrets.GOOGLE_OAUTH_REFRESH_TOKEN }}
            GOOGLE_CALENDAR_ID: ${{ vars.GOOGLE_CALENDAR_ID }}
            CALENDAR_WRITE_ENABLED: ${{ vars.CALENDAR_WRITE_ENABLED }}
          with:
            script: |
              const fs = require("fs");
              const outputFile = process.env.GH_AW_AGENT_OUTPUT;
              const issueTitle = "[Calendar Integration] Configure GOOGLE_OAUTH_REFRESH_TOKEN";
              const writesEnabled = process.env.CALENDAR_WRITE_ENABLED === "true";
              const defaultCalendarId = process.env.GOOGLE_CALENDAR_ID || "";

              async function fileMissingCredentialIssue() {
                const { owner, repo } = context.repo;
                const existing = await github.rest.issues.listForRepo({
                  owner,
                  repo,
                  state: "open",
                  per_page: 100
                });
                const match = existing.data.find((issue) => issue.title === issueTitle);
                if (match) {
                  core.info(`Configuration issue already open: ${match.html_url}`);
                  return match.html_url;
                }
                const created = await github.rest.issues.create({
                  owner,
                  repo,
                  title: issueTitle,
                  body: [
                    "Calendar write output is enabled, but `GOOGLE_OAUTH_REFRESH_TOKEN` is not configured.",
                    "",
                    "Add `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, and `GOOGLE_OAUTH_REFRESH_TOKEN` to the `google-docs-demo` GitHub environment.",
                    "The refresh token needs `calendar.readonly` and `calendar.events` scopes.",
                    "",
                    "Also set `GOOGLE_CALENDAR_ID` to a shared team calendar address (not `primary`) to avoid",
                    "personal events appearing in GitHub artifacts.",
                    "",
                    `Detected by: ${context.workflow}`,
                    `Run: https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`
                  ].join("\n")
                });
                core.info(`Created configuration issue: ${created.data.html_url}`);
                return created.data.html_url;
              }

              async function getAccessToken() {
                const response = await fetch("https://oauth2.googleapis.com/token", {
                  method: "POST",
                  headers: { "content-type": "application/x-www-form-urlencoded" },
                  body: new URLSearchParams({
                    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
                    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
                    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
                    grant_type: "refresh_token"
                  })
                });
                const result = await response.json();
                if (!response.ok || !result.access_token) {
                  throw new Error(`Google token refresh failed: ${result.error_description || result.error}`);
                }
                return result.access_token;
              }

              async function patchEventDescription(token, calendarId, eventId, briefContent) {
                const MARKER_START = "<!-- meeting-brief-start -->";
                const MARKER_END = "<!-- meeting-brief-end -->";

                const getResp = await fetch(
                  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?fields=description`,
                  { headers: { authorization: `Bearer ${token}` } }
                );
                if (!getResp.ok) {
                  throw new Error(`Failed to read event ${eventId}: HTTP ${getResp.status}`);
                }
                const event = await getResp.json();
                const existing = event.description || "";

                let newDescription;
                const markedSection = `${MARKER_START}\n${briefContent}\n${MARKER_END}`;
                if (existing.includes(MARKER_START) && existing.includes(MARKER_END)) {
                  const before = existing.substring(0, existing.indexOf(MARKER_START));
                  const after = existing.substring(existing.indexOf(MARKER_END) + MARKER_END.length);
                  newDescription = `${before}${markedSection}${after}`;
                } else {
                  newDescription = existing ? `${existing}\n\n${markedSection}` : markedSection;
                }

                const patchResp = await fetch(
                  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
                  {
                    method: "PATCH",
                    headers: {
                      authorization: `Bearer ${token}`,
                      "content-type": "application/json"
                    },
                    body: JSON.stringify({ description: newDescription })
                  }
                );
                if (!patchResp.ok) {
                  const err = await patchResp.json().catch(() => ({}));
                  throw new Error(`Failed to patch event ${eventId}: HTTP ${patchResp.status} ${JSON.stringify(err)}`);
                }
              }

              if (!outputFile || !fs.existsSync(outputFile)) {
                core.info("No agent output found; nothing to write to calendar.");
                await core.summary
                  .addHeading("Calendar safe output")
                  .addRaw("No agent output found; nothing was written to Google Calendar.\n")
                  .write();
                return;
              }

              const payload = JSON.parse(fs.readFileSync(outputFile, "utf8"));
              const items = (payload.items || []).filter((item) => item.type === "calendar_update_event_brief");
              const maxUpdates = 10;

              if (items.length > maxUpdates) {
                core.setFailed(`Too many calendar update requests: ${items.length}. Max is ${maxUpdates}.`);
                return;
              }

              if (!writesEnabled) {
                const dryRunRows = items.map((item) => [
                  String(item.event_id || ""),
                  String(item.calendar_id || defaultCalendarId || "(not set)"),
                  String(item.github_source_url || "")
                ]);
                await core.summary
                  .addHeading("Calendar safe output — dry run")
                  .addRaw(`CALENDAR_WRITE_ENABLED is not set to true. ${items.length} update(s) skipped.\n\n`)
                  .addTable([
                    [{ data: "Event ID", header: true }, { data: "Calendar ID", header: true }, { data: "GitHub source", header: true }],
                    ...dryRunRows
                  ])
                  .write();
                core.info(`Dry-run: ${items.length} calendar update(s) not written. Set CALENDAR_WRITE_ENABLED=true to enable.`);
                return;
              }

              if (!process.env.GOOGLE_OAUTH_REFRESH_TOKEN) {
                const issueUrl = await fileMissingCredentialIssue();
                await core.summary
                  .addHeading("Calendar safe output")
                  .addRaw("GOOGLE_OAUTH_REFRESH_TOKEN is not configured. No events were updated.\n\n")
                  .addLink("Configuration issue", issueUrl)
                  .write();
                core.setFailed("GOOGLE_OAUTH_REFRESH_TOKEN is not configured.");
                return;
              }

              const token = await getAccessToken();
              const written = [];

              for (const item of items) {
                const eventId = String(item.event_id || "").trim();
                const briefContent = String(item.brief_content || "").trim();
                const calendarId = String(item.calendar_id || defaultCalendarId || "").trim();
                const sourceUrl = String(item.github_source_url || "").trim();

                if (!eventId) {
                  core.setFailed("calendar_update_event_brief: event_id is required.");
                  return;
                }
                if (!briefContent) {
                  core.setFailed("calendar_update_event_brief: brief_content is required.");
                  return;
                }
                if (!calendarId) {
                  core.setFailed("calendar_update_event_brief: calendar_id or GOOGLE_CALENDAR_ID must be set.");
                  return;
                }
                if (!sourceUrl.startsWith("https://github.com/")) {
                  core.setFailed("calendar_update_event_brief: github_source_url must be a https://github.com/ URL.");
                  return;
                }

                await patchEventDescription(token, calendarId, eventId, briefContent);
                core.info(`Updated calendar event ${eventId} on calendar ${calendarId}`);
                written.push({ eventId, calendarId, sourceUrl });
              }

              await core.summary
                .addHeading("Calendar safe output")
                .addTable([
                  [{ data: "Event ID", header: true }, { data: "Calendar ID", header: true }, { data: "GitHub source", header: true }],
                  ...written.map((item) => [item.eventId, item.calendarId, item.sourceUrl])
                ])
                .write();
---

<!--
# Calendar Safe Outputs

Import this shared component from workflows that need to write meeting briefs
back to Google Calendar event descriptions.

```md
---
name: My calendar workflow

imports:
  - shared/calendar-safe-outputs.md
---

# My calendar workflow
```

The agent calls the normalized safe-output tool as `calendar_update_event_brief` with:

- `event_id` — Google Calendar event ID
- `brief_content` — the brief to append between meeting-brief markers
- `calendar_id` — optional; falls back to `GOOGLE_CALENDAR_ID` variable
- `github_source_url` — required GitHub URL for audit trail

The safe-output job validates inputs, enforces the `CALENDAR_WRITE_ENABLED` gate
(dry-run by default), exchanges the OAuth refresh token for an access token, and
PATCHes the event description using marker-safe append — never overwriting
organizer-written content above the `<!-- meeting-brief-start -->` marker.

Credentials must live in the `google-docs-demo` GitHub environment:
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN` (needs `calendar.readonly` + `calendar.events` scopes)

`GOOGLE_CALENDAR_ID` must be a shared team calendar, not `primary`, to avoid
personal events appearing in GitHub artifacts.
-->
