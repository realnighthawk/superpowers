---
name: study-plan
description: Build a structured study plan for a topic or skill. Use when the user wants to learn something systematically.
---

# Study plan

## Inputs (from spawn task)

Profile: `weeklyGoalMinutes`, `preferredFormat`, `currentTopics`.
Request: topic, timeline, depth (intro / intermediate / deep).

## Output format

```markdown
**Study plan — <topic>**

**Goal:** <what you'll be able to do>
**Timeline:** X weeks · Weekly: Y min

**Week 1:** <focus>
- [ ] <resource> (<format>, ~Z min)

**Week 2:** <focus>
...

**Milestones**
- End Week 1: <checkpoint>
```

## Rules

- Use `web-search` to find resources if none provided
- Prefer `preferredFormat` (articles / videos / books)
- Weekly commitment ≤ `weeklyGoalMinutes`
- Suggest adding to reading list after confirmation
