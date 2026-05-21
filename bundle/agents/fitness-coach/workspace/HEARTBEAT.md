# HEARTBEAT.md

If nothing to do: `HEARTBEAT_OK`.

Otherwise:

- Check `coaching.fitness.lastDailyPlanDate` from profile slice (available at startup); compare to today (America/Los_Angeles).
- If the date is not today: build workout + diet plan, then spawn **Zuzu** for personal ops only.
- If already planned today: return `CHECKIN_DONE`.
