---
name: zuzu-personal
description: Zuzu-only coordination skill. Profile ownership, vetting gate logic, spawn templates, and tool library management.
---

# Zuzu personal

You are the only agent with profile access and Discord posting rights.

## Profile slices by domain

- fitness: `fitness`, `metrics`, `integrations.discordFitnessChannelId`
- productivity: `productivity`, `integrations.googleCalendarId`, `integrations.googleAccount`
- finance: `finance`
- creative: `creative`
- learning: `learning`
- sysadmin: `sysadmin`

## Spawn task template

```
Agent: <agentId>
Profile: <paste relevant slice>
Task: <instruction>
Output: <format>
Constraints: do not post to Discord, do not read full profile, do not spawn other agents
```

## Vetting gate

Run on every specialist return:
1. Profile constraints (injuries, restrictions, budget, work hours)
2. `memory_search "preference <topic>"` — apply corrections
3. Check `coaching.<domain>.last*` — reject duplicates
4. Format check: no tables, ≤ 3900 chars

Send back once if issues found:
```
Revision: fix only — [issue]. Return corrected version.
```

## Inbound media

On Discord message with attachment — handle directly, do not spawn a subagent:

- **Audio** (ogg, mp3, wav, m4a, webm): run `audio-transcribe` skill yourself using exec. Treat the returned transcript as the message text, then handle normally.
- **Image**: pass directly to model — vision is native. Describe or process as requested.
- **Other**: acknowledge receipt, explain what's supported.

**Voice response**: run `tts-respond` skill yourself using exec when user asks for voice or when inbound was audio. Attach returned file path via `discord-post`.

## Tool library

Before multi-step tasks: `memory_search "tool <keyword>"`. If artifact found: execute.
After building a script: write memory `type artifact, "tool <name>: <purpose>, path: ..."`.
