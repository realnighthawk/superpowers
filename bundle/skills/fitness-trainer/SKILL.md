---
name: fitness-trainer
description: Core fitness coaching workflow. Read first before fitness-workout or fitness-diet.
---

# Fitness trainer (core)

## Every task

1. `memory_search "tool fitness"` — use existing scripts if found.
2. Pick one: `fitness-workout` (training request) OR `fitness-diet` (nutrition request).
3. Produce markdown plan.
4. Spawn `assistant` (personal ops only) to post chart and update profile.

## the assistant spawn template

```
Agent: assistant
Task: Personal ops only — post fitness chart for <DATE>. Attach workoutMarkdown and/or dietMarkdown. Update coaching.fitness.lastDailyPlanDate=<DATE>. Do not replan.
```

## Safety

Not medical advice. Respect injuries and diet restrictions from profile slice.
