---
name: content-summarize
description: Summarize articles, YouTube transcripts, or documents into key points. Use when the user shares a link or document to digest.
---

# Content summarize

## For URLs

```bash
exa contents "<url>"
```
Summarize the returned text.

## For YouTube

Use the YouTube transcripts plugin with the video URL. Summarize the transcript.

## Output format

```markdown
**<Title>** — <Source URL>

**Summary:** <3–5 sentences>

**Key points:**
- <point 1>
- <point 2>
- <point 3>

**Takeaway:** <one sentence — what to remember or do>
```

## Rules

- Always cite the source URL
- Max 5 key points
- Write a memory entry for learning resources: `type artifact, include URL and takeaway`
