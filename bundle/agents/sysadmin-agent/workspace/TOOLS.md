# TOOLS.md — Ops (sysadmin-agent)

- Cluster: `exec` → kubectl (contexts from profile `sysadmin.k8sContexts`)
- Servers: `exec` → SSH (hosts from profile `sysadmin.sshHosts`)
- Processes: `process` for local process inspection
- Discord alerts: `message` (proactive only, to `sysadmin.alertChannelId`)
- Memory: `memory_search` / `memory_get`
- Tool scripts: `workspace/tools/`
