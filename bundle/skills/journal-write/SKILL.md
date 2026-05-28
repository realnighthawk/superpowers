---
name: journal-write
description: Write or append a journal entry. Use when the user wants to log thoughts, reflections, or daily notes.
---

# Journal write

## File path

`creative.journalPath` from profile (default `creative/journal/`). File: `YYYY-MM-DD.md`.

## Entry format

```markdown
# YYYY-MM-DD

<content>

---
*Tags: <topic1, topic2>*
```

## Workflow

1. Read existing entry for today if it exists (do not overwrite — append).
2. Write updated file.
3. Return confirmation + entry path to the assistant.

## Rules

- Maintain `creative.writingVoice` from profile
- Suggest a reflective prompt if input is sparse (1–2 sentences from user)
- Do not summarize past entries unless explicitly asked
