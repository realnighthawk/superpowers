# nighthawk-superpowers

Portable OpenClaw plugin that bundles the **Nighthawk multi-agent team**: skills, workspace templates, auth profile templates, profile tools, and an apply CLI.

Based on the [agent-memory](https://github.com/) / OpenClaw plugin scaffold (`definePluginEntry`, `openclaw.plugin.json`, TypeScript build).

## What is included

| Bundle path | Contents |
|-------------|----------|
| `bundle/skills/` | `zuzu-personal`, `fitness-*`, `calendar-fitness-block`, `illustrator-generate`, … |
| `bundle/agents/*/workspace/` | `AGENTS.md`, `SOUL.md`, `TOOLS.md`, … per agent |
| `bundle/agents/zuzu/workspace/user-profile.example.json` | Profile seed (no secrets) |
| `bundle/auth/auth-profiles.template.json` | `google:free` → `GEMINI_API_KEY`, `google:paid` → `GEMINI_API_KEY_PAID`, LiteLLM for `openai` |
| `bundle/cron/jobs.template.json` | Fitness daily check-in (edit Discord channel id) |
| `bundle/config/openclaw.fragment.json` | Merge into `openclaw.json` (agents, auth order, bindings, plugins) |
| `bundle/config/env.example` | Environment variable checklist |

Runtime (plugin code):

- **`user_profile_get` / `user_profile_update`** — Zuzu workspace profile (replaces standalone `nighthawk-profile` plugin)
- **`openclaw nighthawk-superpowers apply`** — copies workspaces + seeds auth/cron/profile

## Requirements

- OpenClaw **2026.5.12+**
- Companion plugins (enable in fragment or your config): `discord`, `google`, `openai`, `memory-core`, `lossless-claw`
- Bundled skills: `gog`, `discord`, `k8s-debug`, `taskflow` come from OpenClaw / your install (not in this repo)

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
   - Replace `REPLACE_DISCORD_USER_ID` and cron channel `REPLACE_DISCORD_FITNESS_CHANNEL_ID`.
   - Merge the JSON into `~/.openclaw/openclaw.json` (jq/manual; `_comment` key can be removed).

4. **Environment** — copy `bundle/config/env.example` → `~/.openclaw/.env` and set keys.

5. **Edit profile** — `~/.openclaw/agents/zuzu/workspace/user-profile.json` (created from example if missing).

6. **LiteLLM / private network** — if using LAN LiteLLM for `openai/stable-diffusion`, keep `browser.ssrfPolicy.dangerouslyAllowPrivateNetwork` from the fragment and configure `models.providers.openai` in your main config.

7. **Restart gateway** and test Discord → Zuzu.

## CLI

```bash
openclaw nighthawk-superpowers apply [--state-dir PATH] [--force] [--skip-cron] [--skip-auth]
openclaw nighthawk-superpowers paths
```

## Agents

| ID | Role |
|----|------|
| `zuzu` | Default Discord steward, profile tools, spawns specialists |
| `sre` | K8s / infra (`k8s-debug`, `taskflow`) |
| `coder` | Coding (`taskflow`) |
| `fitness-coach` | Workout/diet; spawns Zuzu for Discord/calendar |
| `illustrator` | `image_generate` sketches; Zuzu delivers to Discord |

## Development

```bash
npm run typecheck
npm run build
npm run plugin:inspect
```

## License

MIT
