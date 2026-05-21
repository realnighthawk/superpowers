---
name: calendar-review
description: Analyze today's or this week's calendar and flag conflicts or optimization opportunities.
---

# Calendar review

## Inputs (from spawn task)

Calendar events list (fetched by Zuzu via gog).
Profile: `workStartTime`, `workEndTime`, `focusBlockMinutes`.

## Output format

```markdown
**Calendar — YYYY-MM-DD**

**Events**
- HH:MM–HH:MM · <title>

**Focus windows** (free blocks ≥ focusBlockMinutes)
- HH:MM–HH:MM (<X> min)

**Flags**
- Back-to-back: <which meetings>
- Outside work hours: <if any>
```

## Rules

- Highlight free blocks ≥ `focusBlockMinutes`
- Flag: back-to-back meetings, no lunch break, meetings outside work hours
- Do not suggest canceling — flag for nighthawk to decide
