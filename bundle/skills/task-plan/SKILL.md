---
name: task-plan
description: Break a goal into a time-blocked daily schedule. Use when the user asks for task planning, prioritization, or focus blocks.
---

# Task plan

## Inputs (from spawn task)

Profile: `workStartTime`, `workEndTime`, `focusBlockMinutes`, `preferredTaskStyle`.
Calendar events for today (if provided).
User request: goal or list of tasks.

## Output format

```markdown
**Schedule — YYYY-MM-DD**

- 09:00–10:30 · Deep work: <task> (focus block)
- 10:30–10:45 · Break
- 10:45–11:30 · <task>
...

**Deferred:** <tasks that don't fit today>
```

## Rules

- Respect `workStartTime` / `workEndTime`
- Default focus block: `focusBlockMinutes` (default 90 min)
- Buffer 15 min between heavy tasks
- Never schedule during calendar events provided in spawn task
- Flag conflicts explicitly
