---
name: ssh-exec
description: Execute commands on remote servers via SSH safely. Read-only by default; confirm writes with the assistant first.
---

# SSH exec

## Safety

- Read-only commands (logs, status) run without confirmation
- Write operations (restart, stop, delete) require the assistant confirmation before running
- Never store credentials in commands or memory

## Read-only examples

```bash
ssh <host> "journalctl -u <service> --since '1 hour ago' --no-pager"
ssh <host> "systemctl status <service>"
ssh <host> "tail -n 50 /var/log/<logfile>"
ssh <host> "df -h && free -h && uptime"
```

## Write operations (confirm first)

```bash
ssh <host> "systemctl restart <service>"
ssh <host> "docker restart <container>"
```

## Return format

Raw output trimmed. Summarize if > 20 lines. Flag any lines containing "error", "failed", or "critical" at the top.
