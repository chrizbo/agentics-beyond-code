# Google Calendar Fixtures

Synthetic calendar data for fixture-first testing of the calendar intelligence
workflows. All event IDs, email addresses, and names are fictional.

## Purpose

The calendar workflows (`calendar-load-report`, `calendar-strategy-audit`, and
the meeting prep step in `daily-standup-prep`) run against these fixtures
automatically when `GOOGLE_OAUTH_REFRESH_TOKEN` is not configured. This lets
you develop, test, and demonstrate the full workflow logic without connecting
to a real calendar.

## Files

| File | Used by | Contents |
|---|---|---|
| `manifest.json` | All | Team member map (email → GitHub handle), fixture index |
| `today-sample.json` | `daily-standup-prep` | Four events: standup, sparse 1:1 (Mode B inference), rich design review (Mode A), Zoom vendor call |
| `week-sample.json` | `calendar-load-report`, `calendar-strategy-audit` | Full Mon–Fri week for 5 contributors with varied fragmentation patterns |

## Running a sample output

Trigger either workflow via `workflow_dispatch` from the Actions tab. With no
`GOOGLE_OAUTH_REFRESH_TOKEN` configured, both scripts automatically fall back
to fixture mode — no credentials needed.

```bash
# Calendar load report (fixture mode)
gh workflow run calendar-load-report.lock.yml --repo <owner>/<repo>

# Calendar strategy audit (fixture mode)
gh workflow run calendar-strategy-audit.lock.yml --repo <owner>/<repo>
```

The output appears as a GitHub Discussion in the `reports` category, and the
strategy audit also opens a PR updating `docs/calendar-audit.md`.

## Going live

When you're ready to connect a real calendar:

1. Use a **shared team calendar** — not a personal `primary` calendar — to
   avoid personal events appearing in GitHub artifacts.
2. Add `GOOGLE_OAUTH_REFRESH_TOKEN`, `GOOGLE_OAUTH_CLIENT_ID`, and
   `GOOGLE_OAUTH_CLIENT_SECRET` to the `google-docs-demo` GitHub environment.
   The refresh token needs `calendar.readonly` and `calendar.events` scopes.
3. Set the `GOOGLE_CALENDAR_ID` repo variable to the team calendar's email
   address (e.g. `team@example.com`).
4. Set `CALENDAR_WRITE_ENABLED=true` as a repo variable to enable writing
   meeting briefs back to Google Calendar event descriptions.

See `docs/google-docs-integration-plan.md` for the full OAuth architecture.
