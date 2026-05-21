# HEARTBEAT.md — Zuzu

Morning briefing (triggered by 7am cron):

1. Spawn `social-agent`: "Generate morning digest for nighthawk. Include today's calendar events (googleCalendarId from profile), pending tasks from memory. Return bullet-point markdown, max 10 lines."
2. Vet digest against profile (no surprises, correct tone).
3. Post to `integrations.discordGeneralChannelId` via `message`.
4. If nothing to report: post `Good morning nighthawk 🦉 — clear skies.`
