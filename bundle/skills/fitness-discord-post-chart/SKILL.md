---
name: fitness-discord-post-chart
description: Post a daily fitness chart to Discord using the message tool. Use when publishing workout/diet plans for nighthawk. Zuzu only.
---

# Fitness Discord post chart

Post via the **`message`** tool (see **`discord`** skill). Do not use custom HTTP or exec for Discord.

## Steps

1. `user_profile_get` — read `integrations.discordFitnessChannelId` (default `1505834079134683156`).
2. Build one message body (under 3900 chars):
   - Title: `**Fitness plan — YYYY-MM-DD**`
   - Optional **Workout volume** section: for each exercise line `- Name — 3x10`, show a simple bar with `█` / `░` by set count.
   - Optional **Diet targets** if macros known: calories/protein bars.
   - Full **Workout** and **Diet** markdown sections below the chart.
3. Send:

```json
{
  "action": "send",
  "channel": "discord",
  "to": "channel:1505834079134683156",
  "message": "<your formatted chart + plans>"
}
```

Override channel only if profile or user specifies a different id.

4. `user_profile_update` with `coaching.lastDailyPlanDate` and optional `coaching.lastDiscordMessageId` if returned.

## Rules

- No markdown tables (Discord).
- Use bullet lists for exercises and meals.
