# HEARTBEAT.md — Ledger

Monday mornings (9:00am cron):

1. Read `budget-review` → generate week's spending summary.
2. Read `finance-alert` → check for threshold breaches.
3. Spawn `zuzu` with summary + alerts (or `ALERT_NONE`).
4. Zuzu posts summary to `integrations.discordGeneralChannelId`.
