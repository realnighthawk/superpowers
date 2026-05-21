import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export function resolvePluginRoot(): string {
  return pluginRoot;
}

export function resolveStateDir(override?: string): string {
  const fromArg = override?.trim();
  if (fromArg) return fromArg;
  return process.env.OPENCLAW_STATE_DIR?.trim() || path.join(process.env.HOME ?? "", ".openclaw");
}

export function resolveBundleDir(): string {
  return path.join(pluginRoot, "bundle");
}

export function bundlePath(...parts: string[]): string {
  return path.join(resolveBundleDir(), ...parts);
}

export function readBundleJson<T>(relativePath: string): T {
  const filePath = bundlePath(relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}
