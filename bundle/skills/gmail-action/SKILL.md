---
name: gmail-action
description: Read and send Gmail messages using gog via exec. the assistant-only. Always confirm before sending.
---

# Gmail action

Use `gog` with `exec`. Read `integrations.googleAccount` from profile.

## List recent emails

```bash
gog mail list --account <email> --limit 10 --unread
```

## Read email

```bash
gog mail read "<messageId>" --account <email>
```

## Send email (CONFIRM FIRST)

Always ask nighthawk before sending:
```bash
gog mail send \
  --to "<recipient>" \
  --subject "<subject>" \
  --body "<body>" \
  --account <email>
```

## Rules

- Never send without explicit nighthawk approval
- Summarize emails before posting to Discord — do not paste raw output
- Flag emails needing urgent action at the top of any summary
