---
name: calendar-fitness-block
description: Create a Google Calendar workout block for nighthawk using gog via exec. Use after planning a session. Zuzu only.
---

# Calendar fitness block

Use the **`gog`** skill with **`exec`**. Do not use a separate calendar plugin tool.

## Steps

1. `user_profile_get` for `integrations.googleCalendarId` and `integrations.googleAccount` (fallback: env `GOG_CALENDAR_ID`, `GOG_ACCOUNT`).
2. Create event (adjust times to America/Los_Angeles):

```bash
gog calendar create "<calendarId>" \
  --summary "Workout — <short title>" \
  --from "<start ISO8601>" \
  --to "<end ISO8601>" \
  --description "<optional notes from plan>"
```

Add `--account <email>` when profile specifies `googleAccount`.

3. Confirm success from command output; report event details to the user or spawning agent.

## Notes

- Ask nighthawk before creating if time is ambiguous.
- Typical block length: `fitness.sessionMinutes` from profile (default 45).
