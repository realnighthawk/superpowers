import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const pluginRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export function resolvePluginRoot() {
    return pluginRoot;
}
export function resolveStateDir(override) {
    const fromArg = override?.trim();
    if (fromArg)
        return fromArg;
    return process.env.OPENCLAW_STATE_DIR?.trim() || path.join(process.env.HOME ?? "", ".openclaw");
}
export function resolveBundleDir() {
    return path.join(pluginRoot, "bundle");
}
export function bundlePath(...parts) {
    return path.join(resolveBundleDir(), ...parts);
}
export function readBundleJson(relativePath) {
    const filePath = bundlePath(relativePath);
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
