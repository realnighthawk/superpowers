---
name: commute-plan
description: Answer "how long to get there", "when should I leave", and traffic-aware routing questions. Use for commutes, ETAs, departure timing, and route comparisons.
---

# Commute planning

For travel-time, departure-timing, and traffic questions. Uses the **Google Maps MCP** (`maps_*`) — see the `google-maps` skill for parameters.

## Steps

1. **Resolve endpoints.** Geocode origin and destination with `maps_geocode` (use profile `location.home` / `location.work` when the user says "home"/"work"). Confirm the resolved address.
2. **Pick mode.** Default to profile `navigation.preferredMode`; otherwise `driving`. Offer transit/walking if the user implies it.
3. **Get the route.** `maps_directions` for turn-by-turn + duration. For "when do I leave to arrive by X", compute backward from the target arrival.
4. **Compare options** when useful: call `maps_directions` per mode, or `maps_distance_matrix` for several origins/destinations at once.
5. **Add context** only if relevant: `maps_weather` (rain → leave earlier), `maps_timezone` for cross-zone arrivals.

## Output

- Lead with the answer: total time + recommended departure time (user's timezone).
- One line on the route (main roads) and the traffic assumption ("typical traffic").
- If multiple modes: a short bullet per mode (time + note).
- Flag uncertainty ("live traffic not available — typical estimate").

## Rules

- Never invent durations — always from a `maps_*` call.
- Confirm the geocoded address so the user can catch a wrong match.
- Save recurring commutes as a tool script in `workspace/tools/`.
