---
name: daily-briefing
description: Generate a concise morning briefing. Called by Zuzu at 7am. Returns bullet-point markdown for Discord.
---

# Daily briefing

## Inputs (from spawn task)

- Today's date and day of week
- Calendar events for today (provided by Zuzu in spawn task)
- Pending tasks from memory: `memory_search "task pending"`
- Notable memory from last 24h: `memory_search "event yesterday"`

## Output format (≤ 10 lines)

```markdown
**Good morning nighthawk 🦉 — Day, Month DD**

📅 **Today**
- HH:MM · <event>

✅ **Pending**
- <task if any>

💡 **Note**
- <one useful thing or omit section>
```

## Rules

- Max 10 lines total
- Skip sections with nothing to report
- Tone: warm, brief, forward-looking
- Do not include fitness plan (handled by fitness-coach separately)
