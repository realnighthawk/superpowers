# HEARTBEAT.md

If nothing to do: `HEARTBEAT_OK`.

Otherwise:

- Spawn **`zuzu`** with `user_profile_get`; compare `coaching.lastDailyPlanDate` to today (America/Los_Angeles).
- If missing, run daily plan workflow and spawn Zuzu to post chart.
