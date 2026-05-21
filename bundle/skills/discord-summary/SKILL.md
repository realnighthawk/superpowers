---
name: discord-summary
description: Summarize recent Discord activity for nighthawk. Use for catch-up digests or "what did I miss" requests.
---

# Discord summary

## Inputs (from spawn task)

- Channel or thread to summarize
- Time window (default: last 24h)
- Message content passed in task context

## Output format

```markdown
**Discord digest — #<channel> (<time window>)**

- <key decision or action item>
- <notable message if relevant>

<N messages — nothing notable>
```

## Rules

- 5 bullet points max
- Lead with decisions and action items
- Omit pleasantries and noise
- Do not attribute messages to specific users without clear reason
