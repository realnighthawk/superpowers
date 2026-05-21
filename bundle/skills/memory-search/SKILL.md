---
name: memory-search
description: Search episodic and semantic memory before asking the user. Also checks for reusable tools built in prior sessions.
---

# Memory search

Use before asking the user for information they may have already shared or decided.

## Before any task

Check for existing tools:
```
memory_search: "tool <task-keyword>"
```
If an artifact memory exists with a matching path, execute that script instead of re-reasoning.

## Before asking a preference

```
memory_search: "user preference <topic>"
```
If found: use it. If not: ask once, then write a memory entry.

## Write on detection

| Signal | Type | Scope |
|--------|------|-------|
| User states a preference | preference | personal |
| Script saved to tools/ | artifact | project |
| Repeated task solved | learning | global |

Write format: self-contained content, no assumed context.
