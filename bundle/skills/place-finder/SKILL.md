---
name: place-finder
description: Find, filter, and compare places — restaurants, cafes, services, shops, attractions. Use for "where can I…", "best X near me", and side-by-side place comparisons.
---

# Place finder

For discovering and comparing places. Uses the **Google Maps MCP** (`maps_*`) — see the `google-maps` skill for parameters.

## Choose the tool

| Need | Tool |
|------|------|
| Free-text search ("ramen in Tokyo") | `maps_search_places` |
| Near a point by type (cafe, hospital, ATM) | `maps_search_nearby` |
| Hours, phone, reviews, website | `maps_place_details` |
| Compare a few options side-by-side | `maps_compare_places` |
| Survey a whole neighborhood | `maps_explore_area` |

## Steps

1. **Anchor the location.** Geocode "near me"/"near X" to coordinates first (use profile `location.home` if appropriate).
2. **Search** with sensible filters: radius, `min-rating`, open-now when the user wants to go now.
3. **Enrich** the top candidates with `maps_place_details` (hours, rating, address) before recommending.
4. **Compare** with `maps_compare_places` when the user is choosing between options — include distance/time if they care about getting there.

## Output

- 3–5 ranked options, each: name, one-line why, rating, short address, open/closed if relevant.
- Note distance or travel time from the anchor when the user is deciding where to go.
- Offer a follow-up: "want directions to one of these?" (hand back to `commute-plan`).

## Rules

- Don't pad lists with low-signal results — quality over count.
- Summarize reviews; never dump raw JSON.
- Respect any profile constraints the assistant passes (dietary, accessibility, budget).
