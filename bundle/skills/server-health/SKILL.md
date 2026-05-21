---
name: server-health
description: Run health checks across k8s contexts and SSH hosts. Return HEALTH_OK if all clear, alert details if issues found.
---

# Server health

## Inputs

Profile: `sysadmin.k8sContexts`, `sshHosts`.

## k8s checks (per context)

```bash
kubectl --context <ctx> get nodes --no-headers | awk '{print $1, $2}'
kubectl --context <ctx> get pods -A --field-selector=status.phase!=Running --no-headers
```
Flag: node NotReady, pod CrashLoopBackOff or Error.

## SSH host checks (per host)

```bash
ssh <host> "uptime && df -h / | tail -1 && free -h | grep Mem"
```
Flag: load > 2×CPU count, disk > 85%, memory > 90%.

## Output

All clear:
```
HEALTH_OK
```

Issues:
```markdown
**Infra alert — HH:MM**
- k8s/<ctx>: <pod> CrashLoopBackOff
- <host>: disk 91%
```

## Rules

- Return `HEALTH_OK` if no flags — do not generate noise
- Build shell script in `workspace/tools/` after first run for reuse
