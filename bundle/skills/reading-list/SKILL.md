---
name: reading-list
description: Add to, review, or curate the reading list file. Use for weekly recommendations or managing reading backlog.
---

# Reading list

## File path

`learning.readingListPath` from profile (default `learning/reading-list.md`).

## Add item

Append:
```markdown
- [ ] **<Title>** — <Source> | <topic-tag> | Added: YYYY-MM-DD
  > <one-line description>
```

## Weekly recommendation

1. `web-search` for top articles on `currentTopics`.
2. Pick 3–5 items not already in the list (check for duplicates first).
3. Add to file.
4. Return formatted list to the assistant.

## Review

Read file. Group: unread / in-progress / done. Return summary.

## Rules

- `- [x]` for completed items
- Check for duplicates before adding
