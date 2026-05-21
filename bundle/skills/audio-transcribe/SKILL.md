---
name: audio-transcribe
description: Transcribe audio files (Discord voice messages, recordings) to text using Whisper via LiteLLM proxy.
---

# Audio transcribe

Convert an audio file to text using Whisper.

## Input

- `file_path` — absolute path to the audio file (Discord voice messages arrive as `.ogg`)

## Workflow

1. Transcribe via Whisper:
```bash
curl -s "$LITELLM_BASE_URL/v1/audio/transcriptions" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -F "model=whisper-large-v3" \
  -F "file=@<file_path>"
```
2. Parse response field `text`.
3. Return transcript. On failure: report error and stop.

## Rules

- Supported formats: ogg, mp3, mp4, wav, webm, m4a
- Return exact transcript — do not paraphrase or summarize
- `LITELLM_BASE_URL` defaults to `http://10.103.125.88:4000/v1` if not set
