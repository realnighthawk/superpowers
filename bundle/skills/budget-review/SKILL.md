---
name: budget-review
description: Summarize spending vs. budget for the current period. Use for weekly summaries or status checks.
---

# Budget review

## Inputs

Profile: `finance.monthlyBudget`, `savingsGoalPct`, `currency`.
Expense log: read CSV at `finance.expenseLogPath`.

## Compute

- Total spent this month: sum rows where date is in current month
- By category: group and sum
- Remaining budget: `monthlyBudget - totalSpent`

## Output format

```markdown
**Budget — Month YYYY**

Total: $X / $Y (Z% used) · Remaining: $W

**By category**
- Food: $X (Z%)
- Transport: $X
...

**Status:** On track / Over budget by $X
```

## Rules

- If `monthlyBudget` is null: summarize spending only, note budget not set
- Flag any category over 30% of total as notable
- Category totals only — no individual transactions
