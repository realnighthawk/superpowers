import fs from "node:fs";
import path from "node:path";
const DEFAULT_CONFIG = {
    name: null,
    personality: null,
};
export function resolveAgentConfigPath(stateDir, agentId) {
    return path.join(stateDir, "agents", agentId, "workspace", "agent-config.json");
}
export function loadAgentConfig(stateDir, agentId) {
    const filePath = resolveAgentConfigPath(stateDir, agentId);
    if (!fs.existsSync(filePath)) {
        return { ...DEFAULT_CONFIG };
    }
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return { ...DEFAULT_CONFIG, ...raw };
}
export function saveAgentConfig(stateDir, agentId, config) {
    const filePath = resolveAgentConfigPath(stateDir, agentId);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
    return filePath;
}
export function updateAgentConfig(stateDir, agentId, patch) {
    const current = loadAgentConfig(stateDir, agentId);
    const updated = { ...current, ...patch };
    saveAgentConfig(stateDir, agentId, updated);
    return updated;
}
