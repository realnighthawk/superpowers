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

The **label** for a reminder entry is derived from its `subject` field by stripping the leading `"reminder: "` prefix. Example: subject `"reminder: call dentist friday"` → label `"call dentist friday"`. If the subject field is absent or does not start with `"reminder: "`, use the full subject string as the label.

### 3. Search for already-delivered reminders

Call `memory_search`:
- query: `"reminder delivered"`
- filters: `{ "memory_type": "event" }`
- limit: `100`

Build a set of delivered labels: entries where `tags` includes `"reminder-delivered"`. Extract the label from each subject by stripping the leading `"delivered: "` prefix. Example: subject `"delivered: call dentist friday"` → label `"call dentist friday"`.

### 4. For each pending reminder

For each entry from Step 2:

**a. Parse `dueAt`** from metadata. Expected format: ISO-8601 with explicit timezone offset, e.g. `2026-05-28T15:00:00-07:00`. Convert both `dueAt` and `now` (from Step 1, which is UTC) to comparable timestamps before evaluating `dueAt <= now`. If `dueAt` is absent, not a string, or not parseable as ISO-8601, skip this entry and continue.

**b. Check due:** is `dueAt <= now`? If not, skip.

**c. Check delivered:** does the delivered set contain a subject matching `"delivered: <this label>"`? If yes, skip.

**d. Post to Discord** via `message` tool:
```
⏰ Reminder: <reminderText from metadata>
```
To get the channel: call `user_profile_get` (no parameters) → parse the returned JSON → read `integrations.discordGeneralChannelId`. If that field is absent or empty, send the message as a DM to the owner user ID `490874026902683648` (nighthawk) using the Discord DM channel.

**e. Mark delivered** — call `memory_write`:
```
type: event
content: "Reminder delivered: reminder: <label>"
metadata:
  subject: "delivered: <label derived from original subject>"
  scope: personal
  topic: reminder
  tags: ["reminder-delivered"]
  importance: 0.5
  source: claude-code
  created_from: observation
  status: active
```

The content field should read: "Reminder delivered: reminder: <label>" (i.e., prepend "Reminder delivered: " to the original subject string).

**f. Error handling:**
- If `message` fails: do NOT write the delivered entry. The reminder will re-fire next cycle.
- If `memory_write` (marking delivered) fails: log it but do not re-post. Acceptable — reminder was already delivered.

### 5. If no reminders are due

Exit silently. Do not post anything to Discord.
