---
name: email-triage
description: Categorize emails by priority and draft replies for action items. Use when the user asks to deal with inbox.
---

# Email triage

## Inputs (from spawn task)

Email list (sender, subject, snippet, date — from gmail-action via the assistant).
Profile: `productivity.currentProjects`.

## Output format

```markdown
**Inbox — YYYY-MM-DD**

**Action required**
- [sender] Subject — summary → draft: <2–3 sentence reply>

**FYI / read**
- [sender] Subject — summary

**Can ignore**
- [sender] Subject — why
```

## Rules

- Categories: Action / FYI / Ignore
- Draft replies for Action items only — 2–3 sentences max
- Do not send emails — return drafts to the assistant
- Flag anything from nighthawk's key contacts as high priority
