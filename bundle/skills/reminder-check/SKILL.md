---
name: reminder-check
description: Poll memory-core daily notes for due reminders and post them to Discord. Used by the reminder-poll cron job only — not for conversation use.
---

# Reminder check

Called by the `reminder-poll` cron job every 15 minutes. Uses **memory-core** (`memory_search`, `memory_get`, `write`). There is no `memory_write` tool or CLI — never call it via `exec`.

Conversation-time reminder **creation** is handled by `assistant-personal`.

## Steps

### 1. Get current time

```bash
date -u +"%Y-%m-%dT%H:%M:%SZ"
```

Note the result — this is `now` (UTC).

### 2. Find pending reminders

Call `memory_search` with query: `openclaw-reminder pending` (limit 30).

For each hit, `memory_get` the snippet/file and parse blocks like:

```markdown
<!-- openclaw-reminder:pending id=rem-abc123 -->
- due: 2026-05-30T15:00:00-07:00
  text: call dentist
  status: pending
  channel: discord
```

Extract `id`, `due`, `text`. Skip if `status` is not `pending` or `due` is missing/unparseable (ISO-8601 with offset).

### 3. Skip already delivered

Call `memory_search` with query: `openclaw-reminder:delivered` (limit 100).

Build a set of delivered ids from `<!-- openclaw-reminder:delivered id=<uuid>` markers. Skip any pending id in that set.

### 4. For each due pending reminder

**a. Check due:** convert `due` and `now` to comparable timestamps. If `due > now`, skip.

**b. Post to Discord** via `message`:

```
⏰ Reminder: <text>
```

Channel: `user_profile_get` → `integrations.discordGeneralChannelId`. If absent, DM owner `490874026902683648` (nighthawk).

**c. Mark delivered** — append to the same `memory/YYYY-MM-DD.md` (or today's file) with the **`write`** tool:

```markdown
<!-- openclaw-reminder:delivered id=<same-id> at=2026-05-30T15:00:05-07:00 -->
- text: <same text>
```

Use ISO-8601 with offset for `at`.

**d. Error handling**

- If `message` fails: do **not** write delivered marker (re-fire next cycle).
- If `write` fails after a successful post: log only; do not re-post.

### 5. If nothing is due

Exit silently. Do not post to Discord.
