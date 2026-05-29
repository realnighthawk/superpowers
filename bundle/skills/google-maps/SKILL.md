---
name: google-maps
description: Geocode, search places, get directions, plan routes, and check weather via Google Maps MCP. Use for location lookup, travel planning, commute times, and place comparisons.
---

# Google Maps (MCP)

Uses the **Google Maps MCP server** (`maps_*` tools). Do **not** run `goplaces` CLI via `exec`.

Requires `GOOGLE_PLACES_API_KEY` on the gateway (`mcp.servers.google-maps` → `@cablate/mcp-google-map --stdio`). Enable **Places API (New)** and **Routes API** in Google Cloud.

## Common tools

| Task | Tool |
|------|------|
| Address → coordinates | `maps_geocode` |
| Coordinates → address | `maps_reverse_geocode` |
| Find places by query | `maps_search_places` |
| Nearby by type (cafe, hospital, …) | `maps_search_nearby` |
| Hours, phone, reviews | `maps_place_details` |
| Turn-by-turn route | `maps_directions` |
| Travel time matrix | `maps_distance_matrix` |
| Multi-stop optimized route | `maps_plan_route` |
| Neighborhood overview | `maps_explore_area` |
| Compare options side-by-side | `maps_compare_places` |
| Weather / timezone | `maps_weather`, `maps_timezone` |
| Map image with pins | `maps_static_map` |

## Composite vs atomic

Prefer composite tools when they fit — fewer round trips:

- **`maps_explore_area`** — multiple place types + details in one call
- **`maps_plan_route`** — up to 25 stops with waypoint optimization
- **`maps_compare_places`** — search + details + optional distances
- **`maps_search_along_route`** — places ranked by minimal detour

## Rules

- Summarize results for the user — don't paste raw JSON
- Include place names and addresses in summaries; cite Google Maps when helpful
- For travel planning: geocode → search/explore → directions or plan-route → weather
- Use `memory_search` first if you've looked up the same place recently
