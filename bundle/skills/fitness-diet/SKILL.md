---
name: fitness-diet
description: Generate a single-day meal plan and macros from user profile (restrictions, calorie/protein targets). Use when the user asks for meals, diet, or nutrition.
---

# Fitness diet (one day)

## Inputs

From profile: `diet.restrictions`, `diet.calorieTarget`, `diet.proteinTargetG`, goals, metrics.

## Output format (markdown for Discord chart)

```markdown
## Targets
- Calories, protein (estimate if targets missing)

## Meals
### Breakfast
- foods + rough portions

### Lunch
...

### Dinner
...

## Snacks (optional)
- ...

## Notes
- prep tips, hydration
```

## Rules

- If targets missing, estimate from weight/goal with conservative assumptions and state them.
- Respect restrictions strictly.
- Practical home-cooking portions; no medical claims.
