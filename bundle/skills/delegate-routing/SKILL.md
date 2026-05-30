---
name: delegate-routing
description: Mandatory first step for the assistant on every user turn. Classify intent, pick self vs spawn vs ask, and forbid tool substitutions that cause hallucination.
---

# Delegate routing (assistant only)

Run **before any other tool** on every user message (except pure acknowledgments like "thanks" / "ok").

Output an internal routing decision — do not show the template to the user.

## Decision template

```
INTENT: <one line>
PATH: self | spawn:<agentId> | ask
SKILL: <skill to read if self, or specialist skill hint if spawn>
FORBIDDEN: <tools you must not use for this turn>
```

## Classify → path

| If the user wants… | PATH | Specialist skill hint |
|--------------------|------|------------------------|
| Workout, diet, macros, exercise plan | `spawn:fitness-coach` | fitness-trainer |
| Calendar, email, tasks, schedule blocks | `spawn:productivity-agent` | task-plan / email-triage / calendar-review |
| Expenses, budget, spending | `spawn:finance-agent` | expense-log |
| Images, journaling, creative writing | `spawn:creative-agent` | image-generate / journal-write / writing-assist |
| Articles, study plans, research summaries | `spawn:learning-agent` | study-plan / content-summarize |
| k8s, servers, SSH, infra health | `spawn:sysadmin-agent` | server-health / k8s-debug |
| Morning digest / channel summary | `spawn:social-agent` | daily-briefing / discord-summary |
| **Directions, ETA, commute, traffic, when to leave, places, routes, trips, "how far", "how long to get", nearby X** | **`spawn:navigator-agent`** | commute-plan / place-finder / trip-planner |
| Reminder, profile update, Discord post, gog calendar/gmail, image gen, name/personality | `self` | assistant-personal / reminder-check / discord-post / calendar-block / gmail-action |
| Ambiguous (missing origin, date, or domain) | `ask` | — |

**Navigator triggers (non-exhaustive):** traffic, commute, drive time, ETA, directions, route, detour, leave by, arrive by, how far, distance, nearby, restaurant/cafe/hotel near, trip, itinerary, maps, geocode, "live traffic".

When multiple domains match, pick the **primary** ask. Location/traffic always wins over "also search the web".

## Forbidden substitutions

| User intent | NEVER use | REQUIRED |
|-------------|-----------|----------|
| Traffic, ETA, commute, directions, places, routes, trips | `web_search_exa`, `web_fetch_exa`, guessing, "checking live traffic" without `maps_*` data | `sessions_spawn` → `navigator-agent` |
| Workout / diet plan | web search for a plan | `spawn:fitness-coach` |
| Calendar / email / tasks | `gog` exec yourself | `spawn:productivity-agent` (you execute gog only for direct personal ops the user asked **you** to do) |
| Research article / study material | answering from memory alone | `spawn:learning-agent` |

`web_search_exa` is for **news, docs, and general research** — not for drive times, traffic, or place lookup.

## Spawn path (when PATH starts with `spawn:`)

1. `user_profile_get` — extract the profile slice for that agent (see `assistant-personal`).
2. `memory_search` — keywords from the user message (preferences, prior routes, corrections).
3. `sessions_spawn` with the spawn template — **before** replying to the user.
4. Vet the return (`assistant-personal` vetting gate) → post once.

Do **not** tell the user you are "checking traffic" or "searching the web" while spawning. Either stay silent until the specialist returns, or one short line: "On it — asking Navigator." then spawn immediately.

## Self path

Read the SKILL named in your decision, then act with your own tools. Still run `user_profile_get` / `memory_search` when the skill requires context.

## Ask path

One clarifying question only — no tools except `user_profile_get` if it resolves ambiguity (e.g. saved home address).

## Anti-hallucination rules

- Agents are **never** "on the bench" — if `PATH` is `spawn:*`, call `sessions_spawn`. No exceptions.
- Never claim live traffic, ETAs, or place details you did not receive from a specialist return (Navigator uses `maps_*` MCP).
- Never narrate progress you have not started (`"will have an answer in a moment"` without a spawn in the same turn).
- One user-facing reply per turn after work completes (spawn return or self-path result), unless `ask`.
