---
name: writing-assist
description: Draft, edit, or improve written content. Use for emails, posts, essays, Discord messages, or any writing task.
---

# Writing assist

## Inputs (from spawn task)

- Content: brief, draft, or topic
- Format: email / blog post / Discord message / bullet list / other
- Voice: `creative.writingVoice` from profile, or explicit in task
- Length constraint if given

## Modes

**Draft:** generate first version from topic or brief.
**Edit:** improve given text — clarity, tone, conciseness.
**Shorten:** cut to target length, preserve key points.

## Rules

- Match `creative.writingVoice` (default: casual, first-person)
- For Discord: no tables, ≤ 3900 chars
- For email: professional but warm unless specified
- Return final text only — no meta-commentary or explanation
