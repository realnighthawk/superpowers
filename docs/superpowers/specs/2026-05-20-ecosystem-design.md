# Nighthawk Superpowers — Ecosystem Design
_Status: COMPLETE — awaiting user review before implementation planning_

---

## Decisions Made

| # | Decision |
|---|----------|
| 1 | 7 agent domains: Fitness, Productivity, Finance, Creative, Learning, SysAdmin, Social + Home (placeholder) |
| 2 | Personalization: single `user-profile.json` owned by Zuzu + `memory-core` for episodic memory |
| 3 | Interaction surface: Discord as the hub (all inbound + outbound) |
| 4 | Proactive vs reactive: combination — each agent decides what makes sense for its domain |
| 5 | Architecture: hub-and-spoke, Zuzu as sole coordinator + Discord face |
| 6 | All specialist agents route results through Zuzu — exception: sysadmin proactive alerts post directly to `#sysadmin` |
| 7 | Token optimization: light context heartbeats, on-demand skill loading, flash models for simple agents |

---

## Architecture

```
Discord
   ↓
 Zuzu  ←── user-profile.json (single source of truth)
   ↓         ↓ (reads at spawn, passes in task)
 spawns specialists as needed
   ├── fitness-coach
   ├── productivity-agent
   ├── finance-agent
   ├── creative-agent
   ├── learning-agent
   ├── sysadmin-agent
   ├── social-agent
   └── home-agent (placeholder, disabled)
```

**Rules:**
- Zuzu is the **only** Discord-facing agent and the **only** profile owner
- Specialists receive profile data via spawn task — never call `user_profile_get` themselves
- All agents return results to Zuzu — Zuzu formats and posts to Discord
- Proactive agents hand off to Zuzu for all Discord output
- **Exception — sysadmin proactive alerts:** post directly to `#sysadmin` channel (time-sensitive, no round-trip). Reactive sysadmin queries (Zuzu-spawned) still return through Zuzu.

---

## Skill Layers

### Common skills (all agents)
- `memory-search` — semantic memory retrieval
- `web-search` — Exa-powered research
- `summarize` — condense content, transcripts, documents

### Zuzu-only skills
- `zuzu-personal` — profile tools, spawn coordination
- `discord-post` — channel posting, formatting rules
- `calendar-block` — Google Calendar via gog
- `gmail-action` — Gmail read/compose via gog

### Domain skills (per specialist)
| Agent | Skills |
|-------|--------|
| fitness-coach | `fitness-trainer`, `fitness-workout`, `fitness-diet`, `fitness-chart` |
| productivity-agent | `task-plan`, `email-triage`, `calendar-review` |
| finance-agent | `expense-log`, `budget-review`, `finance-alert` |
| creative-agent | `image-generate`, `journal-write`, `writing-assist` |
| learning-agent | `study-plan`, `content-summarize`, `reading-list` |
| sysadmin-agent | `k8s-debug`, `server-health`, `ssh-exec` |
| social-agent | `daily-briefing`, `discord-summary` |
| home-agent | placeholder |

---

## Agent Definitions

### Zuzu
- Role: Personal coordinator, Discord face, profile owner
- Personality: warm, direct, concise
- Tools: `message`, `exec` (gog), `user_profile_get/update`, `image_generate`, `sessions_spawn`
- Proactive: morning briefing at 7am (aggregates from social/productivity agents)
- Spawns: all specialists

### fitness-coach
- Role: Generic workout + nutrition planner
- Personality: structured, encouraging, evidence-aware
- Tools: `memory_search/get`, `sessions_spawn` (→ Zuzu only)
- Profile: received via spawn task (no direct profile access)
- Proactive: daily heartbeat — if no plan today, build + hand to Zuzu to post

### productivity-agent
- Role: Calendar, email, task planning
- Personality: sharp, efficient, zero fluff
- Tools: `memory_search/get`, `sessions_spawn` (→ Zuzu only)
- Profile: received via spawn task
- Proactive: morning digest (calendar + tasks), handed to Zuzu

### finance-agent
- Role: Expense tracking, budget, alerts
- Personality: precise, neutral, matter-of-fact
- Tools: `memory_search/get`, `read/write` (local expense log), `sessions_spawn` (→ Zuzu)
- Profile: received via spawn task
- Proactive: weekly summary every Monday 9am

### creative-agent
- Role: Journaling, writing, image generation
- Personality: expressive, open-ended, collaborative
- Tools: `image_generate`, `read/write` (journal/drafts), `memory_search/get`
- Profile: received via spawn task
- Proactive: none (fully reactive)

### learning-agent
- Role: Study plans, reading lists, summarization
- Personality: curious, structured, Socratic
- Tools: `memory_search/get`, exec (Exa), YouTube transcripts plugin, `read/write`
- Profile: received via spawn task
- Proactive: weekly reading recommendation Sunday evening

### sysadmin-agent
- Role: k8s, servers, infra monitoring
- Personality: terse, diagnostic, safety-first
- Tools: `exec` (kubectl, SSH), `memory_search/get`, `process`, `sessions_spawn` (→ Zuzu), `message` (alerts only)
- Profile: received via spawn task
- Proactive: daily health check — posts alerts **directly** to `#sysadmin` channel (no Zuzu round-trip)
- Reactive: returns results to Zuzu when Zuzu-spawned

### social-agent
- Role: Discord digests, daily summaries
- Personality: conversational, tone-aware
- Tools: `memory_search/get`, `read` (memory files for recent activity)
- Profile: received via spawn task
- Proactive: none — spawned by Zuzu, returns digest content, Zuzu posts

### home-agent
- Role: Home automation (future)
- Status: disabled placeholder

---

## Token Optimization Strategy

### Model Tiering
| Agent | Model | Reason |
|-------|-------|--------|
| Zuzu | gemini-3-flash | Routing, formatting, Discord — speed matters |
| fitness-coach | gemini-3-flash | Structured templates, predictable outputs |
| productivity-agent | gemini-3-flash | Calendar/task parsing, low complexity |
| finance-agent | gemini-3-flash | Rule-based, log parsing |
| social-agent | gemini-3-flash | Digest generation, templated |
| creative-agent | gemini-3.1-pro | Open-ended writing, needs reasoning |
| learning-agent | gemini-3.1-pro | Summarization, study plan depth |
| sysadmin-agent | gemini-3.1-pro | Diagnostic reasoning, k8s triage |

### Strategies
- **Light context heartbeats** — all proactive runs set `lightContext: true`. Agents get only AGENTS.md + HEARTBEAT.md + task message.
- **Skill files ≤ 300 words** — short, dense, no narrative.
- **Workspace file caps** — AGENTS.md ≤ 400w, SOUL.md ≤ 80w, TOOLS.md ≤ 150w, HEARTBEAT.md ≤ 100w, USER.md ≤ 80w.
- **Slim spawn task templates** — Zuzu passes only the relevant profile slice, not the full profile.
- **Tool library + memory reuse** — agents write shell/Python scripts to `workspace/tools/`, store a memory entry (`artifact` type) with the path and purpose. On future similar tasks, `memory_search` for existing tool first — if found, just execute. Shared generic scripts live in Zuzu's `workspace/tools/shared/`.
- **Memory before re-asking** — agents always `memory_search` before asking the user for preferences already stated.

### Memory + Context Stack
| Layer | Tool | Scope |
|-------|------|-------|
| Durable facts | `user-profile.json` | Cross-session, always in spawn task |
| Episodic memory | `memory-core` | Cross-session, retrieved on demand |
| Tool library | `workspace/tools/` + memory entries | Cross-session, reused via exec |
| In-session compression | `lossless-claw` | Current session, automatic |

### Token Savings Estimate
| Strategy | Impact |
|----------|--------|
| Model tiering | 40–60% cost on simple agents |
| Light context heartbeats | ~70% tokens on proactive runs |
| Short workspace files | Consistent baseline reduction |
| Slim spawn templates | No redundant context in spawns |
| Tool library reuse | Near-zero tokens on repeat tasks |
| Memory retrieval | Eliminates clarification round-trips |
| lossless-claw compression | Keeps long reactive sessions lean |

---

## Integration Stack

| Domain | Integrations |
|--------|-------------|
| All agents | Discord (in/out), memory-core, user-profile |
| Fitness | `image_generate` (charts), Google Calendar (`gog`) |
| Productivity | Google Calendar + Gmail (`gog`) |
| Finance | Manual logging (no bank API) |
| Creative | `image_generate`, file writes |
| Learning | Exa (web search), YouTube transcripts plugin |
| SysAdmin | `exec` → kubectl + SSH |
| Social | Discord only |
| Home | Placeholder |

---

## Proactive Behaviors

| Agent | Trigger | Schedule | Action | Channel |
|-------|---------|----------|--------|---------|
| Zuzu | cron | 7:00am daily (LA) | Morning briefing — calls social-agent for digest, posts | `#general` |
| fitness-coach | heartbeat | every 8h | If no plan today → build workout+diet, hand to Zuzu | `#fitness` |
| productivity-agent | cron | 8:30am Mon–Fri (LA) | Calendar + task digest, hand to Zuzu | `#productivity` |
| finance-agent | cron | 9:00am Monday (LA) | Weekly expense summary, hand to Zuzu | `#finance` |
| learning-agent | cron | 6:00pm Sunday (LA) | Weekly reading recommendation, hand to Zuzu | `#learning` |
| sysadmin-agent | heartbeat | every 6h | Health check — silent if OK, posts alert **directly** if anomaly | `#sysadmin` |
| social-agent | reactive only | on demand | Called by Zuzu for digest generation | — |
| creative-agent | reactive only | on demand | No proactive behavior | — |
| home-agent | disabled | — | Placeholder | — |

All proactive runs: `lightContext: true`, `sessionTarget: isolated`.

## Zuzu Vetting Gate

Before posting any specialist result to Discord, Zuzu runs a vetting check:

**Checks against:**
- Profile constraints (injuries, diet restrictions, budget, work hours)
- Memory (past user corrections and preferences)
- Coaching history (duplicate detection)
- Tone and format (matches user personality/voice)

**Flow:**
```
Specialist → Zuzu → vetting
                      ├── passes → format + post
                      └── fails → send back with specific correction notes (one revision max)
                                    → specialist revises → Zuzu posts (no second loop)
```

**Send-back template:**
```
Revision needed — do not replan from scratch. Fix only:
- [specific issue 1]
- [specific issue 2]
Return corrected version only.
```

Sysadmin proactive alerts are **exempt** — factual, time-sensitive, post directly.

## File & Folder Structure

### bundle/agents/ — changes per agent

| Agent | Status | Notes |
|-------|--------|-------|
| `zuzu/` | REWRITE | Fill IDENTITY, expand SOUL, add vetting gate + tool library to AGENTS, fix HEARTBEAT code block |
| `fitness-coach/` | REFINE | Keep + tighten to word caps |
| `productivity-agent/` | NEW | Full workspace |
| `finance-agent/` | NEW | Full workspace |
| `creative-agent/` | NEW | Absorbs illustrator |
| `learning-agent/` | NEW | Full workspace |
| `sysadmin-agent/` | REWRITE | Rename from sre/, delete BOOTSTRAP.md, fill all files |
| `social-agent/` | NEW | Full workspace |
| `home-agent/` | NEW | Disabled placeholder only |
| `coder/` | DELETE | Coding tasks via Zuzu → sysadmin or direct |
| `sre/` | DELETE | Replaced by sysadmin-agent/ |
| `illustrator/` | DELETE | Absorbed into creative-agent |

All agents: `workspace/tools/` directory for built scripts. Zuzu has `workspace/tools/shared/` for cross-agent scripts.

### bundle/skills/ — changes

**Common (all agents):** `memory-search`, `web-search`, `summarize` — NEW

**Zuzu-only:** `zuzu-personal` (REWRITE), `discord-post` (NEW), `calendar-block` (RENAME+generalize from calendar-fitness-block), `gmail-action` (NEW)

**Fitness:** `fitness-trainer` (keep), `fitness-workout` (keep), `fitness-diet` (FIX: "Discord" not "Notion"), `fitness-chart` (RENAME+fix from fitness-discord-post-chart)

**Productivity:** `task-plan`, `email-triage`, `calendar-review` — NEW

**Finance:** `expense-log`, `budget-review`, `finance-alert` — NEW

**Creative:** `image-generate` (RENAME from illustrator-generate), `journal-write`, `writing-assist` — NEW

**Learning:** `study-plan`, `content-summarize`, `reading-list` — NEW

**Sysadmin:** `k8s-debug` (keep, from OpenClaw install), `server-health`, `ssh-exec` — NEW

**Social:** `daily-briefing`, `discord-summary` — NEW

**Home:** `home-placeholder` — NEW stub

### bundle/config/
- `openclaw.fragment.json` — REWRITE: 8 agents, fix auth schema, document diagnostics-otel
- `env.example` — update with new integration vars

### bundle/cron/jobs.template.json
REWRITE: fitness daily, productivity weekday digest, finance weekly, learning weekly, Zuzu morning briefing

### Deleted
- `bundle/agents/coder/`
- `bundle/agents/sre/`
- `bundle/agents/illustrator/`
- `bundle/agents/sre/workspace/BOOTSTRAP.md`
