---
name: tts-respond
description: Convert text to speech using Kokoro via LiteLLM proxy. Returns audio file path for Discord attachment.
---

# TTS respond

Generate a spoken audio response using Kokoro.

## Input

- `text` — content to speak (keep under 500 words; summarize if longer)
- `voice` — optional, default `af_sky`

## Workflow

1. Generate audio:
```bash
OUT="/tmp/tts_$(date +%s).mp3"
curl -s "$LITELLM_BASE_URL/audio/speech" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"kokoro\",\"input\":\"<text>\",\"voice\":\"<voice>\"}" \
  --output "$OUT"
echo "$OUT"
```
2. Return the output file path. On failure: report error and stop.

## Rules

- Zuzu attaches the returned path via `discord-post` file attachment
- Do not TTS raw data, lists, or code — convert to natural spoken language first
- `LITELLM_BASE_URL` is set in the environment by OpenClaw's LiteLLM configuration
