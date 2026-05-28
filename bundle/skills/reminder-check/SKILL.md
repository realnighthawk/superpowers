---
name: reminder-check
description: Poll memory for due reminders and post them to Discord. Used by the reminder-poll cron job only — not for conversation use.
---

# Reminder check

Called by the `reminder-poll` cron job every 15 minutes. Checks memory for pending reminders that are due, posts each to Discord, then marks them delivered.

## Steps

### 1. Get current time

```bash
date -u +"%Y-%m-%dT%H:%M:%SZ"
```

Note the result — this is `now`.

### 2. Search for pending reminders

Call `memory_search`:
- query: `"reminder pending"`
- filters: `{ "memory_type": "task" }`
- limit: `30`

From results, keep only entries where **all** of:
- `tags` includes `"reminder"`
- `status` is `"active"` (or absent — default is active)

### 3. Search for already-delivered reminders

Call `memory_search`:
- query: `"reminder delivered"`
- filters: `{ "memory_type": "event" }`
- limit: `100`

Build a set of delivered labels: entries where `tags` includes `"reminder-delivered"`. Extract the short label from each subject (format: `"delivered: <label>"`).

### 4. For each pending reminder

For each entry from Step 2:

**a. Parse `dueAt`** from metadata. If absent or malformed, skip and continue.

**b. Check due:** is `dueAt <= now`? If not, skip.

**c. Check delivered:** does the delivered set contain a subject matching `"delivered: <this label>"`? If yes, skip.

**d. Post to Discord** via `message` tool:
```
⏰ Reminder: <reminderText from metadata>
```
Use channel from `integrations.discordGeneralChannelId` in the user profile (via `user_profile_get`), or fall back to the default Discord channel.

**e. Mark delivered** — call `memory_write`:
```
type: event
content: "Reminder delivered: <same subject as original entry>"
metadata:
  subject: "delivered: <same short label>"
  scope: personal
  topic: reminder
  tags: ["reminder-delivered"]
  importance: 0.5
  source: claude-code
  created_from: observation
  status: active
```

**f. Error handling:**
- If `message` fails: do NOT write the delivered entry. The reminder will re-fire next cycle.
- If `memory_write` (marking delivered) fails: log it but do not re-post. Acceptable — reminder was already delivered.

### 5. If no reminders are due

Exit silently. Do not post anything to Discord.
