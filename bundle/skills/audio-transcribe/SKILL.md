---
name: audio-transcribe
description: Transcribe audio files (Discord voice messages, recordings) to text using Whisper via LiteLLM proxy.
---

# Audio transcribe

Convert an audio file to text using the LiteLLM proxy (Whisper).

**Never install whisper, ffmpeg, or any local packages. Always use the HTTP API below.**

## Input

- `file_path` — absolute path to the audio file (Discord voice messages arrive as `.ogg`)

## Workflow

1. Transcribe via the LiteLLM proxy HTTP API:
```bash
curl -s "http://10.103.125.88:4000/v1/audio/transcriptions" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -F "model=whisper-large-v3" \
  -F "file=@<file_path>"
```
2. Parse response field `text`.
3. Return transcript. On failure: report the HTTP error and stop.

## Rules

- Supported formats: ogg, mp3, mp4, wav, webm, m4a
- Return exact transcript — do not paraphrase or summarize
- Do NOT attempt local installation of any tools
