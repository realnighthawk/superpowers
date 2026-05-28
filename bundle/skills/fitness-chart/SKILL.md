---
name: fitness-chart
description: Format a daily fitness chart message for Discord. Prepare the body and pass to discord-post via message. the assistant-only.
---

# Fitness chart

Prepare the chart message body — do not post directly. Use `discord-post` skill via `message`.

## Inputs

From profile: `integrations.discordFitnessChannelId`.
From spawn task: `workoutMarkdown`, `dietMarkdown`, `date`.

## Build message (≤ 3900 chars)

```
**Fitness plan — YYYY-MM-DD**

**Volume**
<for each "- Exercise — 3x10" line: render bar with █░ by set count>

**Workout**
<workoutMarkdown>

**Diet**
<dietMarkdown>
```

## Post

Channel: `integrations.discordFitnessChannelId` from profile.

After posting: `user_profile_update coaching.fitness.lastDailyPlanDate=YYYY-MM-DD`.

## Rules

- No markdown tables
- If > 3900 chars: split workout and diet into two messages
- Use profile channel ID — do not hardcode
