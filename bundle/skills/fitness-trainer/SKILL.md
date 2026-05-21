---
name: fitness-trainer
description: Use for fitness coaching routing, safety, and daily plan workflow. Read first before fitness-workout or fitness-diet.
---

# Fitness trainer (core)

## Workflow

1. Spawn **`zuzu`** for `user_profile_get` when profile may be stale (Zuzu holds nighthawk personal data).
2. Pick **one** topic skill: `fitness-workout` OR `fitness-diet`.
3. Produce markdown plans.
4. Spawn **`zuzu`** (personal ops only) to run **`fitness-discord-post-chart`** + profile updates.
5. Log generic coaching notes in `memory/YYYY-MM-DD.md`.

## Zuzu handoff template

```
Spawn zuzu (personal ops only):
- user_profile_get if needed
- fitness-discord-post-chart: date=YYYY-MM-DD, attach workoutMarkdown and dietMarkdown
- user_profile_update coaching.lastDailyPlanDate=YYYY-MM-DD
Return confirmation; do not replan fitness.
```

## Safety

Not medical advice. Respect injuries and diet restrictions.
