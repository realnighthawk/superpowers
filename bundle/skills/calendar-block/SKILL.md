---
name: calendar-block
description: Create or list Google Calendar events using gog via exec. Zuzu-only. Use for any calendar action.
---

# Calendar block

Use `gog` with `exec`. Read `integrations.googleCalendarId` and `integrations.googleAccount` from profile.

## Create event

```bash
gog calendar create "<calendarId>" \
  --summary "<title>" \
  --from "<ISO8601>" \
  --to "<ISO8601>" \
  --description "<optional notes>" \
  --account <email>
```

## List events

```bash
gog calendar list "<calendarId>" --from today --to tomorrow --account <email>
```

## Rules

- Always convert times to America/Los_Angeles
- Ask nighthawk before creating if time is ambiguous
- Confirm success from command output before reporting
- Default block length: `fitness.sessionMinutes` for workout blocks, explicit duration otherwise
