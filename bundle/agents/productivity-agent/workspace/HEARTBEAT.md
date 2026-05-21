# HEARTBEAT.md — Compass

Weekday mornings (8:30am cron via Zuzu):

Zuzu fetches calendar events, spawns this agent with:
1. Today's calendar events
2. Pending tasks from memory

This agent: read `calendar-review` → today's schedule. Read `task-plan` → pending task suggestions. Return combined markdown to Zuzu.
