## Freshness Check

> **Note for live deployments:** Remove this section (or the `imports` reference to it) when your team is actively generating project data. In a live environment, an empty report is meaningful signal — you want to see it even if nothing changed. This check exists only to avoid noisy empty reports when the sample data simulator is paused.

Before doing any analysis, check when the project data was last generated:

```bash
jq -r '"Data generated: \(.generatedAt) | Launches: \(.launches | length)"' launch-data-summary.json
```

If the `generatedAt` timestamp is more than 7 days ago, the data simulator is likely paused and the data is stale. Call `noop` with the message: "Skipping — project data is more than 7 days old. Trigger the sample-data-simulator workflow manually to refresh before running this report." Do not post a report based on stale data.
