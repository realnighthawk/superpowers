import fs from "node:fs";
import path from "node:path";

export type AgentConfig = {
  name: string | null;
  personality: string | null;
};

const DEFAULT_CONFIG: AgentConfig = {
  name: null,
  personality: null,
};

export function resolveAgentConfigPath(stateDir: string, agentId: string): string {
  return path.join(stateDir, "agents", agentId, "workspace", "agent-config.json");
}

export function loadAgentConfig(stateDir: string, agentId: string): AgentConfig {
  const filePath = resolveAgentConfigPath(stateDir, agentId);
  if (!fs.existsSync(filePath)) {
    return { ...DEFAULT_CONFIG };
  }
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as Partial<AgentConfig>;
  return { ...DEFAULT_CONFIG, ...raw };
}

export function saveAgentConfig(stateDir: string, agentId: string, config: AgentConfig): string {
  const filePath = resolveAgentConfigPath(stateDir, agentId);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return filePath;
}

export function updateAgentConfig(
  stateDir: string,
  agentId: string,
  patch: Partial<AgentConfig>,
): AgentConfig {
  const current = loadAgentConfig(stateDir, agentId);
  const updated = { ...current, ...patch };
  saveAgentConfig(stateDir, agentId, updated);
  return updated;
}
