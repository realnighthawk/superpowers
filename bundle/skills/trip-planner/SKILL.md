---
name: trip-planner
description: Plan multi-stop outings, day trips, and road trips with optimized routes and stops along the way. Use for itineraries, "visit these N places efficiently", and route + stop combos.
---

# Trip planner

For multi-stop and itinerary planning. Uses the **Google Maps MCP** (`maps_*`) — see the `google-maps` skill for parameters.

## Steps

1. **Collect stops.** Geocode every stop with `maps_geocode` (or `maps_batch_geocode` for many). Confirm the list back to the user.
2. **Optimize order.** `maps_plan_route` (waypoint optimization, up to 25 stops) for the most efficient sequence from a start point.
3. **Fill gaps along the way.** `maps_search_along_route` to add stops (food, fuel, rest) ranked by minimal detour.
4. **Scout a destination** with `maps_explore_area` when the user is open-ended ("things to do near X").
5. **Add timing + context.** `maps_directions` between legs for ETAs; `maps_weather` / `maps_timezone` for day-of planning.

## Output

- Ordered itinerary: stop name, short address, leg time/distance, suggested time at each.
- Total trip time + distance up front.
- Optional: a `maps_static_map` image of the route for the assistant to share.
- Call out any long detours or closed stops.

## Rules

- Always confirm the optimized order — the user may have a fixed sequence.
- Keep itineraries realistic (travel + dwell time within the day).
- Save reusable trip templates to `workspace/tools/`.
