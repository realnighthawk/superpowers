---
name: expense-log
description: Log a new expense to the local CSV. Use when the user reports a purchase to track.
---

# Expense log

File: `finance.expenseLogPath` from profile (default `finance/expenses.csv`).

## CSV format

```
date,amount,currency,category,description
2026-05-20,12.50,USD,food,Lunch at Chipotle
```

## Log new expense

1. Read current CSV with `read`.
2. Append new row: today's date (America/Los_Angeles), amount, currency, category, description.
3. Write with `write`.

## Categories

food, transport, housing, health, fitness, entertainment, tech, other

## Rules

- Confirm amount and category before writing
- ISO date format: YYYY-MM-DD
- Description ≤ 50 chars
