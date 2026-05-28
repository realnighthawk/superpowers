# Smart Reminders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add proactive and on-demand reminder capability to the personal assistant — reminders are stored in memory and delivered to Discord by a 15-minute cron poller.

**Architecture:** Three changes: (1) new `reminder-check` skill used by the poller cron job, (2) a `## Reminder detection` section added to `assistant-personal` teaching the assistant to write reminders to memory, (3) the `reminder-poll` cron job entry added to both the bundle template and the live superclaw config. The assistant also needs `memory_write` added to its allowed tools.

**Tech Stack:** OpenClaw skills (Markdown), JSON config files, memory-core plugin (`memory_write`, `memory_search`), Discord `message` tool.

---

## File Map

| File | Repo | Action |
|------|------|--------|
| `bundle/skills/reminder-check/SKILL.md` | superpowers | Create |
| `bundle/skills/assistant-personal/SKILL.md` | superpowers | Modify — add reminder detection section |
| `bundle/config/openclaw.fragment.json` | superpowers | Modify — add `reminder-check` to assistant skills, add `memory_write` to alsoAllow |
| `bundle/cron/jobs.template.json` | superpowers | Modify — add `reminder-poll` job |
| `agents/assistant/workspace/AGENTS.md` | superclaw | Modify — add reminder to personal ops section |
| `openclaw.json` | superclaw | Modify — add `reminder-check` to skills, add `memory_write` to alsoAllow |
| `cron/jobs.json` | superclaw | Modify — add `reminder-poll` job |

---

## Task 1: Create reminder-check skill

**Files:**
- Create: `bundle/skills/reminder-check/SKILL.md`

- [ ] **Step 1: Verify the skills directory exists**

```bash
ls /Users/abishekkumar/Documents/superpowers/bundle/skills/
```

Expected: directory listing including `assistant-personal`, `discord-post`, etc.

- [ ] **Step 2: Create the skill file**

Write `bundle/skills/reminder-check/SKILL.md` with this exact content:

```markdown
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

**c. Check delivered:** does the delivered set contain `"reminder: <this label>"`? If yes, skip.

**d. Post to Discord** via `message` tool:
```
⏰ Reminder: <reminderText from metadata>
```
Use channel from `integrations.discordGeneralChannelId` in the user profile (via `user_profile_get`), or fall back to posting to the default Discord channel.

**e. Mark delivered** — call `memory_write`:
```
type: event
content: "Reminder delivered: <same subject as original entry>"
metadata:
  subject: "delivered: <same short label>"
  scope: project
  project: /home/abishek/.openclaw/agents/assistant
  topic: reminder
  tags: ["reminder-delivered"]
  importance: 0.5
  source: claude-code
  created_from: observation
  status: active
```

**f. Error handling:**
- If `message` fails: do NOT write the delivered entry. The reminder will re-fire next cycle.
- If `memory_write` (marking delivered) fails: log it but do not re-post. Acceptable data loss — reminder was already delivered.

### 5. If no reminders are due

Exit silently. Do not post anything to Discord.
```

- [ ] **Step 3: Verify the file was created**

```bash
ls bundle/skills/reminder-check/SKILL.md
head -5 bundle/skills/reminder-check/SKILL.md
```

Expected:
```
bundle/skills/reminder-check/SKILL.md
---
name: reminder-check
description: Poll memory for due reminders and post them to Discord. Used by the reminder-poll cron job only — not for conversation use.
---
```

- [ ] **Step 4: Commit**

```bash
git add bundle/skills/reminder-check/SKILL.md
git commit -m "feat: add reminder-check skill for cron poller"
```

---

## Task 2: Add reminder detection to assistant-personal

**Files:**
- Modify: `bundle/skills/assistant-personal/SKILL.md`

- [ ] **Step 1: Verify current end of file**

```bash
tail -10 bundle/skills/assistant-personal/SKILL.md
```

Expected last lines:
```
## Tool library

Before multi-step tasks: `memory_search "tool <keyword>"`. If artifact found: execute.
After building a script: write memory `type artifact, "tool <name>: <purpose>, path: ..."`
```

- [ ] **Step 2: Append the reminder detection section**

Open `bundle/skills/assistant-personal/SKILL.md` and append the following at the end of the file (after the last line):

```markdown

## Reminder detection

During every conversation turn, scan for reminder-worthy signals before responding.

### Signals to watch for

| Signal type | Example |
|-------------|---------|
| Explicit request | "remind me to…", "don't let me forget…", "set a reminder for…" |
| Time-bound commitment | "I'll send that email later", "need to check on this by Friday" |
| Future reference with action | "before the meeting tomorrow", "once X is done I need to Y" |
| Implicit loose end | Something discussed with no resolution and a stated/implied future action |

### Detection rules

| Signal type | Action |
|-------------|--------|
| Explicit with clear time | Write reminder silently. Confirm: "Noted — I'll remind you at [time]." |
| Explicit without time | Ask once: "When should I remind you?" — then write after response. |
| Proactive with clear time | Write silently, no interruption. |
| Proactive without clear time | Optionally surface: "Want me to set a reminder for X?" — only if genuinely useful, not for passing mentions. |

### How to write a reminder

Call `memory_write` directly:

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
  confidence: 1.0
  dueAt: "<ISO-8601 with timezone offset, e.g. 2026-05-28T15:00:00-07:00>"
  reminderText: "<full reminder text>"
  status: active
  source: claude-code
  created_from: conversation
```

**Timezone:** always use America/Los_Angeles offset (-07:00 PDT / -08:00 PST). If the user says "3pm" without a date, assume today; if today's time has passed, assume tomorrow.

**Confirmation:** after writing, always confirm to the user: "Got it — I'll remind you at [human-readable time]: [reminderText]."

**Never:** post a reminder proactively to Discord mid-conversation. Only the cron poller delivers reminders. In-conversation the assistant only confirms the reminder was stored.
```

- [ ] **Step 3: Verify the section was added**

```bash
grep -n "Reminder detection" bundle/skills/assistant-personal/SKILL.md
```

Expected: one line showing the section heading with a line number.

- [ ] **Step 4: Commit**

```bash
git add bundle/skills/assistant-personal/SKILL.md
git commit -m "feat: add reminder detection to assistant-personal skill"
```

---

## Task 3: Wire reminder-check into openclaw.fragment.json

**Files:**
- Modify: `bundle/config/openclaw.fragment.json`

Two changes: add `"reminder-check"` to the assistant's `skills` array, and add `"memory_write"` to `alsoAllow`.

- [ ] **Step 1: Verify current assistant skills list**

```bash
python3 -c "
import json
with open('bundle/config/openclaw.fragment.json') as f:
    d = json.load(f)
a = next(x for x in d['agents']['list'] if x['id'] == 'assistant')
print(json.dumps(a['skills'], indent=2))
print('alsoAllow:', json.dumps(a['tools']['alsoAllow'], indent=2))
"
```

Expected skills list ends with `"summarize"`. Expected `alsoAllow` does **not** contain `"memory_write"`.

- [ ] **Step 2: Add reminder-check to skills and memory_write to alsoAllow**

```bash
python3 - <<'EOF'
import json

with open('bundle/config/openclaw.fragment.json') as f:
    d = json.load(f)

assistant = next(x for x in d['agents']['list'] if x['id'] == 'assistant')

# Add reminder-check to skills if not already present
if 'reminder-check' not in assistant['skills']:
    assistant['skills'].append('reminder-check')

# Add memory_write to alsoAllow if not already present
if 'memory_write' not in assistant['tools']['alsoAllow']:
    assistant['tools']['alsoAllow'].append('memory_write')

with open('bundle/config/openclaw.fragment.json', 'w') as f:
    json.dump(d, f, indent=2)
    f.write('\n')

print('Done')
EOF
```

Expected output: `Done`

- [ ] **Step 3: Verify both changes are present**

```bash
python3 -c "
import json
with open('bundle/config/openclaw.fragment.json') as f:
    d = json.load(f)
a = next(x for x in d['agents']['list'] if x['id'] == 'assistant')
print('reminder-check in skills:', 'reminder-check' in a['skills'])
print('memory_write in alsoAllow:', 'memory_write' in a['tools']['alsoAllow'])
"
```

Expected:
```
reminder-check in skills: True
memory_write in alsoAllow: True
```

- [ ] **Step 4: Validate JSON is still valid**

```bash
python3 -m json.tool bundle/config/openclaw.fragment.json > /dev/null && echo "Valid JSON"
```

Expected: `Valid JSON`

- [ ] **Step 5: Commit**

```bash
git add bundle/config/openclaw.fragment.json
git commit -m "feat: add reminder-check skill and memory_write tool to assistant config"
```

---

## Task 4: Add reminder-poll cron to jobs.template.json

**Files:**
- Modify: `bundle/cron/jobs.template.json`

- [ ] **Step 1: Verify current template structure**

```bash
python3 -c "
import json
with open('bundle/cron/jobs.template.json') as f:
    d = json.load(f)
print('current job ids:', [j['id'] for j in d['jobs']])
"
```

Expected: a list of existing job IDs (e.g. `fitness-daily-checkin`, morning briefing, etc.).

- [ ] **Step 2: Add reminder-poll job**

```bash
python3 - <<'EOF'
import json

with open('bundle/cron/jobs.template.json') as f:
    d = json.load(f)

reminder_job = {
    "id": "reminder-poll",
    "name": "Reminder poller",
    "description": "Check memory for due reminders every 15 minutes and post to Discord.",
    "enabled": True,
    "agentId": "assistant",
    "createdAtMs": 1748390400000,
    "schedule": {
        "kind": "cron",
        "expr": "*/15 * * * *",
        "tz": "America/Los_Angeles"
    },
    "sessionTarget": "isolated",
    "wakeMode": "now",
    "payload": {
        "kind": "agentTurn",
        "message": "Run the reminder-check skill: search memory for pending reminders, post any that are due now to Discord, mark them delivered.",
        "lightContext": True
    },
    "delivery": {
        "mode": "none"
    },
    "state": {}
}

# Only add if not already present
if not any(j['id'] == 'reminder-poll' for j in d['jobs']):
    d['jobs'].append(reminder_job)

with open('bundle/cron/jobs.template.json', 'w') as f:
    json.dump(d, f, indent=2)
    f.write('\n')

print('Done')
EOF
```

Expected: `Done`

- [ ] **Step 3: Verify the job was added**

```bash
python3 -c "
import json
with open('bundle/cron/jobs.template.json') as f:
    d = json.load(f)
job = next((j for j in d['jobs'] if j['id'] == 'reminder-poll'), None)
print('found:', job is not None)
print('schedule:', job['schedule']['expr'] if job else 'N/A')
print('agentId:', job['agentId'] if job else 'N/A')
"
```

Expected:
```
found: True
schedule: */15 * * * *
agentId: assistant
```

- [ ] **Step 4: Validate JSON**

```bash
python3 -m json.tool bundle/cron/jobs.template.json > /dev/null && echo "Valid JSON"
```

Expected: `Valid JSON`

- [ ] **Step 5: Commit and push superpowers**

```bash
git add bundle/cron/jobs.template.json
git commit -m "feat: add reminder-poll cron job to jobs template"
git push origin main
```

Expected: push succeeds, shows `main -> main`.

---

## Task 5: Mirror changes to live superclaw

**Files:**
- Modify: `openclaw.json` (in `/Users/abishekkumar/Documents/superclaw/`)
- Modify: `cron/jobs.json` (in `/Users/abishekkumar/Documents/superclaw/`)
- Modify: `agents/assistant/workspace/AGENTS.md` (in `/Users/abishekkumar/Documents/superclaw/`)

All commands run from `/Users/abishekkumar/Documents/superclaw/`.

- [ ] **Step 1: Add reminder-check and memory_write to live openclaw.json**

```bash
cd /Users/abishekkumar/Documents/superclaw && python3 - <<'EOF'
import json

with open('openclaw.json') as f:
    d = json.load(f)

assistant = next(x for x in d['agents']['list'] if x['id'] == 'assistant')

if 'reminder-check' not in assistant['skills']:
    assistant['skills'].append('reminder-check')

if 'memory_write' not in assistant['tools']['alsoAllow']:
    assistant['tools']['alsoAllow'].append('memory_write')

with open('openclaw.json', 'w') as f:
    json.dump(d, f, indent=2)
    f.write('\n')

print('Done')
EOF
```

Expected: `Done`

- [ ] **Step 2: Verify live openclaw.json changes**

```bash
python3 -c "
import json
with open('/Users/abishekkumar/Documents/superclaw/openclaw.json') as f:
    d = json.load(f)
a = next(x for x in d['agents']['list'] if x['id'] == 'assistant')
print('reminder-check in skills:', 'reminder-check' in a['skills'])
print('memory_write in alsoAllow:', 'memory_write' in a['tools']['alsoAllow'])
"
```

Expected:
```
reminder-check in skills: True
memory_write in alsoAllow: True
```

- [ ] **Step 3: Validate JSON**

```bash
python3 -m json.tool /Users/abishekkumar/Documents/superclaw/openclaw.json > /dev/null && echo "Valid JSON"
```

Expected: `Valid JSON`

- [ ] **Step 4: Add reminder-poll to live cron/jobs.json**

```bash
cd /Users/abishekkumar/Documents/superclaw && python3 - <<'EOF'
import json

with open('cron/jobs.json') as f:
    d = json.load(f)

reminder_job = {
    "id": "reminder-poll",
    "name": "Reminder poller",
    "description": "Check memory for due reminders every 15 minutes and post to Discord.",
    "enabled": True,
    "agentId": "assistant",
    "createdAtMs": 1748390400000,
    "schedule": {
        "kind": "cron",
        "expr": "*/15 * * * *",
        "tz": "America/Los_Angeles"
    },
    "sessionTarget": "isolated",
    "wakeMode": "now",
    "payload": {
        "kind": "agentTurn",
        "message": "Run the reminder-check skill: search memory for pending reminders, post any that are due now to Discord, mark them delivered.",
        "lightContext": True
    },
    "delivery": {
        "mode": "none"
    },
    "state": {}
}

if not any(j['id'] == 'reminder-poll' for j in d['jobs']):
    d['jobs'].append(reminder_job)

with open('cron/jobs.json', 'w') as f:
    json.dump(d, f, indent=2)
    f.write('\n')

print('Done')
EOF
```

Expected: `Done`

- [ ] **Step 5: Validate cron/jobs.json**

```bash
python3 -m json.tool /Users/abishekkumar/Documents/superclaw/cron/jobs.json > /dev/null && echo "Valid JSON"
python3 -c "
import json
with open('/Users/abishekkumar/Documents/superclaw/cron/jobs.json') as f:
    d = json.load(f)
job = next((j for j in d['jobs'] if j['id'] == 'reminder-poll'), None)
print('reminder-poll present:', job is not None)
"
```

Expected:
```
Valid JSON
reminder-poll present: True
```

- [ ] **Step 6: Update AGENTS.md personal ops section**

Open `/Users/abishekkumar/Documents/superclaw/agents/assistant/workspace/AGENTS.md`.

Find the `## Personal ops (never delegate)` section, which currently reads:

```markdown
## Personal ops (never delegate)

- `user_profile_get` / `user_profile_update`
- `gog` (calendar, Gmail) via `exec`
- `message` (Discord posting)
- `image_generate`
```

Replace it with:

```markdown
## Personal ops (never delegate)

- `user_profile_get` / `user_profile_update`
- `gog` (calendar, Gmail) via `exec`
- `message` (Discord posting)
- `image_generate`
- **Reminders:** write via `memory_write` (see `reminder-check` skill for detection rules). The cron poller delivers — never post a reminder to Discord mid-conversation.
```

- [ ] **Step 7: Verify AGENTS.md change**

```bash
grep -A 2 "Reminders:" /Users/abishekkumar/Documents/superclaw/agents/assistant/workspace/AGENTS.md
```

Expected:
```
- **Reminders:** write via `memory_write` (see `reminder-check` skill for detection rules). The cron poller delivers — never post a reminder to Discord mid-conversation.
```

- [ ] **Step 8: Commit and push superclaw**

```bash
cd /Users/abishekkumar/Documents/superclaw
git add openclaw.json cron/jobs.json agents/assistant/workspace/AGENTS.md
git commit -m "feat: add smart reminders — reminder-check skill, reminder-poll cron, memory_write permission"
git push origin main
```

Expected: push succeeds.

---

## Verification Checklist

After both repos are pushed, verify the full feature is wired correctly:

```bash
# superpowers: all new/modified files present
ls /Users/abishekkumar/Documents/superpowers/bundle/skills/reminder-check/SKILL.md
grep "Reminder detection" /Users/abishekkumar/Documents/superpowers/bundle/skills/assistant-personal/SKILL.md

# superclaw: assistant has both new items
python3 -c "
import json
with open('/Users/abishekkumar/Documents/superclaw/openclaw.json') as f:
    d = json.load(f)
a = next(x for x in d['agents']['list'] if x['id'] == 'assistant')
checks = {
    'reminder-check skill': 'reminder-check' in a['skills'],
    'memory_write tool': 'memory_write' in a['tools']['alsoAllow'],
}
for k, v in checks.items():
    print(f'{k}: {v}')
"

# cron job present
python3 -c "
import json
with open('/Users/abishekkumar/Documents/superclaw/cron/jobs.json') as f:
    d = json.load(f)
print('reminder-poll present:', any(j['id'] == 'reminder-poll' for j in d['jobs']))
"
```

Expected output:
```
reminder-check skill: True
memory_write tool: True
reminder-poll present: True
```
