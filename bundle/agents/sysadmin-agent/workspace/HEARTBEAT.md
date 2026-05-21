# HEARTBEAT.md — Ops

Every 6h:

1. Read `server-health` — run checks on all k8s contexts and SSH hosts from profile.
2. If `HEALTH_OK`: return silently. No Discord post.
3. If issues found: post directly to `sysadmin.alertChannelId` via `message`.
4. Write memory entry for new issues: `type problem`.
