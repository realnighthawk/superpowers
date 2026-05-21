---
name: fitness-workout
description: Generate a single-day workout plan from user profile (equipment, injuries, split, experience). Use when the user asks for training, lifts, or exercise.
---

# Fitness workout (one day)

## Inputs

From profile slice passed in spawn task by Zuzu: goals, injuries, equipment, `fitness.experience`, `fitness.preferredSplit`, `fitness.sessionMinutes`.

## Output format (markdown for Discord chart)

```markdown
## Warm-up
- ...

## Main
- Exercise — 3x10 — rest — cues

## Cool-down
- ...
```

Use lines like `- Bench press — 3x10` so charts parse set volume.

## Rules

- Match `fitness.sessionMinutes` (default 45).
- Respect injuries; substitute in notes.
- Keep exercise count modest for small context windows.
