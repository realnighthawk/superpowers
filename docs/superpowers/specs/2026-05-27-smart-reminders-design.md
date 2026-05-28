# Smart Reminders Design

**Goal:** The assistant detects reminder-worthy moments in conversation (proactively and on explicit request), stores them in memory, and a 15-minute polling cron job delivers them to Discord when due.

**Architecture:** Memory-core as the reminder store. Three changes: (1) new detection+write rules in `assistant-personal`, (2) new `reminder-check` skill for the poller, (3) new `reminder-poll` cron job.

---

## Memory Schema

Every reminder is a `task` memory entry written by the assistant:

```json
{
  "type": "task",
  "content": "Reminder at <ISO-8601 timestamp>: <reminder text>",
  "metadata": {
    "subject": "reminder: <short label 3-6 words>",
    "scope": "project",
    "project": "/home/abishek/.openclaw/agents/assistant",
    "topic": "reminder",
    "tags": ["reminder"],
    "importance": 0.8,
    "confidence": 1.0,
    "source": "claude-code",
    "created_from": "conversation",
    "status": "active",
    "dueAt": "<ISO-8601 in America/Los_Angeles>",
    "reminderText": "<human-readable reminder text>"
  }
}
```

**Delivered tracking:** When a reminder fires, the poller writes a second entry to mark it done:

```json
{
  "type": "event",
  "content": "Reminder delivered: <same subject as original>",
  "metadata": {
    "subject": "delivered: <same short label>",
    "scope": "project",
    "project": "/home/abishek/.openclaw/agents/assistant",
    "topic": "reminder",
    "tags": ["reminder-delivered"],
    "importance": 0.5,
    "source": "claude-code",
    "created_from": "observation",
    "status": "active"
  }
}
```

---

## assistant-personal Additions

A new `## Reminder detection` section in `bundle/skills/assistant-personal/SKILL.md`:

### Proactive signals to watch for

During every conversation turn, watch for:
- Explicit user requests: "remind me to…", "don't let me forget…", "set a reminder for…"
- Time-bound commitments: "I'll send that email later", "need to check on X by Friday"
- Future references with action: "before the meeting tomorrow", "once Y is done, I need to Z"
- Loose ends: something discussed that is unresolved and has a stated or implied future action

### Detection rules

| Signal type | Action |
|-------------|--------|
| Explicit with clear time | Write reminder silently. Confirm: "Noted — I'll remind you at [time]." |
| Explicit without time | Ask: "When should I remind you?" Then write. |
| Proactive with clear time | Write silently. No interruption unless it changes the flow. |
| Proactive without time | Optional: "Looks like you might want a reminder for X — want me to set one?" Only ask if it seems genuinely useful, not for every passing mention. |

### How to write a reminder

Use `memory_write` directly:

```
type: task
content: "Reminder at <dueAt>: <reminderText>"
metadata:
  subject: "reminder: <3-6 word label>"
  scope: project
  project: /home/abishek/.openclaw/agents/assistant
  topic: reminder
  tags: ["reminder"]
  importance: 0.8
  dueAt: "<ISO-8601 in America/Los_Angeles, e.g. 2026-05-28T15:00:00-07:00>"
  reminderText: "<full reminder text>"
  status: active
  source: claude-code
  created_from: conversation
```

If `memory_write` is not available (tool not in scope), write a note in the response and ask the user to set the reminder manually.

---

## reminder-check Skill

New skill: `bundle/skills/reminder-check/SKILL.md`

Purpose: used only by the `reminder-poll` cron job. Checks memory for due reminders, posts to Discord, marks delivered.

```markdown
---
name: reminder-check
description: Poll memory for due reminders and post them to Discord. Used by the reminder-poll cron job only — not for conversation use.
---

# Reminder check

## Steps

1. Get current time:
   ```bash
   date -u +"%Y-%m-%dT%H:%M:%SZ"
   ```

2. Search for pending reminders:
   ```
   memory_search(
     query="reminder pending task",
     filters={ memory_type: "task", scope: "project" },
     limit: 20
   )
   ```
   Filter results client-side: keep only entries where `tags` includes `"reminder"` and `status == "active"`.

3. Search for already-delivered reminders:
   ```
   memory_search(
     query="reminder delivered",
     filters={ memory_type: "event", scope: "project" },
     limit: 50
   )
   ```
   Build a set of delivered subjects: entries where `tags` includes `"reminder-delivered"`.

4. For each pending reminder:
   - Check: is `dueAt <= now`? If not, skip.
   - Check: is `subject` already in the delivered set (prefix match "delivered: <label>")? If yes, skip.
   - Post to Discord via `message` tool:
     ```
     ⏰ Reminder: <reminderText>
     ```
     Channel: nighthawk's DM or `integrations.discordGeneralChannelId` from profile.
   - Write delivered entry to memory (schema above).

5. If no reminders are due: exit silently (no Discord message).

## Error handling

- If `memory_write` fails on marking delivered: log the failure but do not re-post. The reminder will re-fire on the next poll cycle; acceptable for rare failures.
- If Discord `message` fails: do not mark delivered. Retry on next cycle.
```

---

## Cron Job Entry

New entry in `bundle/cron/jobs.template.json` (and `cron/jobs.json` on the live server):

```json
{
  "id": "reminder-poll",
  "name": "Reminder poller",
  "description": "Check memory for due reminders every 15 minutes and post to Discord.",
  "enabled": true,
  "agentId": "assistant",
  "schedule": {
    "kind": "cron",
    "expr": "*/15 * * * *",
    "tz": "America/Los_Angeles"
  },
  "sessionTarget": "isolated",
  "wakeMode": "now",
  "payload": {
    "kind": "agentTurn",
    "message": "Run reminder-check skill: search memory for due reminders, post any that are due to Discord, mark them delivered.",
    "lightContext": true
  },
  "delivery": {
    "mode": "none"
  },
  "state": {}
}
```

---

## Files Changed

| File | Change |
|------|--------|
| `bundle/skills/assistant-personal/SKILL.md` | Add `## Reminder detection` section |
| `bundle/skills/reminder-check/SKILL.md` | **Create new** |
| `bundle/config/openclaw.fragment.json` | Add `"reminder-check"` to assistant's `skills` array |
| `bundle/cron/jobs.template.json` | Add `reminder-poll` job entry |
| `superclaw/agents/assistant/workspace/AGENTS.md` | Note reminder skill in personal ops section |
| `superclaw/cron/jobs.json` | Add `reminder-poll` job entry (live server) |
| `superclaw/openclaw.json` | Add `"reminder-check"` to assistant's skills list |

---

## Constraints

- The poller uses `lightContext: true` — no conversation history loaded, fast + cheap.
- `memory_write` for reminders requires the `memory_write` tool in the assistant's `alsoAllow` list — already present via `memory-core` plugin.
- The assistant must have the `message` tool available during polling — already in `alsoAllow`.
- Reminder times must be stored as ISO-8601 with explicit timezone offset (never bare UTC assumed).
- The assistant never posts a reminder proactively to Discord mid-conversation — only the cron poller delivers. In-conversation, the assistant only confirms the reminder was set.
