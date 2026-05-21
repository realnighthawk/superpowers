---
name: discord-post
description: Post formatted messages to Discord via the message tool. Zuzu-only. Covers channel routing, formatting, and size limits.
---

# Discord post

## Channel routing

Read channel IDs from profile `integrations.*ChannelId`. Do not hardcode IDs in logic.

## Format rules

- No markdown tables — use bullet lists
- Links in `<>` to suppress embeds
- Code in triple backticks
- Max 3900 characters — split at section breaks if longer
- Mention nighthawk as `<@490874026902683648>`

## Send

```json
{
  "action": "send",
  "channel": "discord",
  "to": "channel:<channelId>",
  "message": "<formatted content>"
}
```

## Splitting long messages

Split at logical section breaks. Send Part 1 / Part 2 in sequence. Never cut mid-sentence.
