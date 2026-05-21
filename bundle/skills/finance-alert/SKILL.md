---
name: finance-alert
description: Detect budget threshold breaches in spending. Return ALERT_NONE if all clear — used in proactive monitoring.
---

# Finance alert

## Checks

1. **Over budget:** `totalSpent > monthlyBudget` → alert
2. **Large single expense:** any row amount > `alertThresholdUSD` → flag
3. **Category spike:** any category > 40% of monthly budget → flag

## Output

All clear:
```
ALERT_NONE
```

Issues:
```markdown
**Finance alert**
- Over budget: $X spent of $Y (Z% over)
- Large expense: $W on <description> (<date>)
```

## Rules

- Return `ALERT_NONE` for clean runs — Zuzu will stay silent
- If `alertThresholdUSD` is null: skip large-expense check
- If `monthlyBudget` is null: skip over-budget check
