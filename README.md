# nighthawk-superpowers

Portable OpenClaw plugin that bundles the **Nighthawk multi-agent team**: skills, workspace templates, auth profile templates, profile tools, and an apply CLI.

Based on the [agent-memory](https://github.com/) / OpenClaw plugin scaffold (`definePluginEntry`, `openclaw.plugin.json`, TypeScript build).

## What is included

| Bundle path | Contents |
|-------------|----------|
| `bundle/skills/` | `delegate-routing`, `assistant-personal`, `fitness-*`, `google-maps`, … |
| `bundle/agents/*/workspace/` | `AGENTS.md`, `SOUL.md`, `TOOLS.md`, … per agent |
| `bundle/agents/assistant/workspace/user-profile.example.json` | Profile seed (no secrets) |
| `bundle/auth/auth-profiles.template.json` | `google:free` → `GEMINI_API_KEY`, `google:paid` → `GEMINI_API_KEY_PAID`, LiteLLM for `openai` |
| `bundle/cron/jobs.template.json` | Scheduled cron jobs (edit Discord channel ids) |
| `bundle/config/openclaw.fragment.json` | Merge into `openclaw.json` (agents, auth order, bindings, plugins) |
| `bundle/config/env.example` | Environment variable checklist |

Runtime (plugin code):

- **`user_profile_get` / `user_profile_update`** — assistant workspace profile
- **`agent_config_get` / `agent_config_set`** — per-agent identity (name, personality) stored in `agent-config.json`
- **`openclaw nighthawk-superpowers apply`** — copies workspaces + seeds auth/cron/profile

## Requirements

- OpenClaw **2026.5.12+**
- Companion plugins (enable in fragment or your config): `discord`, `google`, `openai`, `memory-core`, `lossless-claw`
- Bundled skills: `gog`, `discord`, `k8s-debug` come from OpenClaw / your install (not in this repo)

## Install

```bash
cd /home/abishek/Documents/superpowers
npm install
npm run build

openclaw plugins install /home/abishek/Documents/superpowers
openclaw plugins enable nighthawk-superpowers
```

## Bring up a similar system on a new machine

1. **Install the plugin** (above).

2. **Apply file templates** into state dir:

```bash
openclaw nighthawk-superpowers apply
# or overwrite existing workspace files:
openclaw nighthawk-superpowers apply --force
```

3. **Merge config** — edit `bundle/config/openclaw.fragment.json`:

   - Replace every `REPLACE_STATE_DIR` with your state directory (e.g. `/home/you/.openclaw`).
   - Replace `REPLACE_DISCORD_USER_ID` and cron channel ids.
   - Merge the JSON into `~/.openclaw/openclaw.json` (jq/manual; `_comment` key can be removed).

4. **Environment** — copy `bundle/config/env.example` → `~/.openclaw/.env` and set keys.

5. **Edit profile** — `~/.openclaw/agents/assistant/workspace/user-profile.json` (created from example if missing).

6. **LiteLLM / private network** — if using LAN LiteLLM, keep `browser.ssrfPolicy.dangerouslyAllowPrivateNetwork` from the fragment and configure your `LITELLM_BASE_URL` / `LITELLM_API_KEY` env vars.

7. **Restart gateway** — on first Discord message the assistant will ask for its name and personality.

## CLI

```bash
openclaw nighthawk-superpowers apply [--state-dir PATH] [--force] [--skip-cron] [--skip-auth]
openclaw nighthawk-superpowers paths
```

## Agents

| ID | Role |
|----|------|
| `assistant` | Default Discord steward, profile tools, spawns specialists |
| `fitness-coach` | Workout/diet; spawns assistant for Discord/calendar |
| `productivity-agent` | Calendar, email, task planning |
| `finance-agent` | Expense tracking and budget management |
| `creative-agent` | Image generation, journaling, writing |
| `learning-agent` | Study plans, content summarization, reading lists |
| `sysadmin-agent` | k8s, server monitoring, SSH administration |
| `social-agent` | Daily briefings and Discord digests (local-llm) |
| `navigator-agent` | Directions, commute, places, trip planning (Google Maps MCP) |

MCP servers (merge from fragment into `openclaw.json`):

| Server | Package / URL | Env |
|--------|---------------|-----|
| `google-maps` | `@cablate/mcp-google-map --stdio` | `GOOGLE_PLACES_API_KEY` → `GOOGLE_MAPS_API_KEY` |
| `exa` | `https://mcp.exa.ai/mcp` | `EXA_API_KEY` |

## Development

```bash
npm run typecheck
npm run build
npm run plugin:inspect
```

## License

MIT
