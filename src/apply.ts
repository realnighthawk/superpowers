import fs from "node:fs";
import path from "node:path";
import { bundlePath, readBundleJson, resolvePluginRoot, resolveStateDir } from "./paths.js";

export type ApplyOptions = {
  stateDir?: string;
  force?: boolean;
  skipCron?: boolean;
  skipAuth?: boolean;
};

export type ApplyResult = {
  stateDir: string;
  created: string[];
  skipped: string[];
  notes: string[];
};

type AgentsManifest = {
  version: number;
  agents: string[];
};

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFileIfMissing(src: string, dest: string, force: boolean, log: ApplyResult): void {
  if (fs.existsSync(dest) && !force) {
    log.skipped.push(dest);
    return;
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  log.created.push(dest);
}

function copyTreeIfMissing(srcDir: string, destDir: string, force: boolean, log: ApplyResult): void {
  if (!fs.existsSync(srcDir)) return;
  ensureDir(destDir);
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyTreeIfMissing(src, dest, force, log);
    } else if (entry.isFile()) {
      copyFileIfMissing(src, dest, force, log);
    }
  }
}

function mergeCronJobs(stateDir: string, force: boolean, log: ApplyResult): void {
  const templatePath = bundlePath("cron", "jobs.template.json");
  if (!fs.existsSync(templatePath)) return;

  const template = JSON.parse(fs.readFileSync(templatePath, "utf8")) as {
    version: number;
    jobs: Array<{ id: string }>;
  };
  const cronDir = path.join(stateDir, "cron");
  const jobsPath = path.join(cronDir, "jobs.json");
  ensureDir(cronDir);

  let existing: { version: number; jobs: unknown[] } = { version: 1, jobs: [] };
  if (fs.existsSync(jobsPath)) {
    existing = JSON.parse(fs.readFileSync(jobsPath, "utf8")) as typeof existing;
  }

  const existingIds = new Set(
    existing.jobs
      .filter((j): j is { id: string } => typeof j === "object" && j !== null && "id" in j)
      .map((j) => (j as { id: string }).id),
  );

  let added = 0;
  for (const job of template.jobs) {
    if (existingIds.has(job.id) && !force) {
      log.skipped.push(`${jobsPath}#${job.id}`);
      continue;
    }
    if (existingIds.has(job.id) && force) {
      existing.jobs = existing.jobs.filter(
        (j) => typeof j !== "object" || j === null || (j as { id?: string }).id !== job.id,
      );
    }
    existing.jobs.push(job);
    existingIds.add(job.id);
    added++;
  }

  if (added > 0 || force) {
    fs.writeFileSync(jobsPath, `${JSON.stringify(existing, null, 2)}\n`, "utf8");
    log.created.push(jobsPath);
  }
}

function seedAuthProfiles(stateDir: string, agentIds: string[], force: boolean, log: ApplyResult): void {
  const templatePath = bundlePath("auth", "auth-profiles.template.json");
  if (!fs.existsSync(templatePath)) return;

  for (const agentId of agentIds) {
    const dest = path.join(stateDir, "agents", agentId, "agent", "auth-profiles.json");
    copyFileIfMissing(templatePath, dest, force, log);
  }
}

function seedUserProfile(stateDir: string, force: boolean, log: ApplyResult): void {
  const example = bundlePath("agents", "assistant", "workspace", "user-profile.example.json");
  const dest = path.join(stateDir, "agents", "assistant", "workspace", "user-profile.json");
  if (!fs.existsSync(example)) {
    log.notes.push("No user-profile.example.json in bundle; skip profile seed.");
    return;
  }
  copyFileIfMissing(example, dest, force, log);
}

export function applyKit(opts: ApplyOptions = {}): ApplyResult {
  const stateDir = resolveStateDir(opts.stateDir);
  const force = opts.force === true;
  const log: ApplyResult = { stateDir, created: [], skipped: [], notes: [] };

  const manifest = readBundleJson<AgentsManifest>("agents/manifest.json");

  for (const agentId of manifest.agents) {
    const srcWorkspace = bundlePath("agents", agentId, "workspace");
    const destWorkspace = path.join(stateDir, "agents", agentId, "workspace");
    copyTreeIfMissing(srcWorkspace, destWorkspace, force, log);
    ensureDir(path.join(stateDir, "agents", agentId, "agent"));
  }

  if (!opts.skipAuth) {
    seedAuthProfiles(stateDir, manifest.agents, force, log);
  }

  seedUserProfile(stateDir, force, log);

  if (!opts.skipCron) {
    mergeCronJobs(stateDir, force, log);
  }

  const fragment = bundlePath("config", "openclaw.fragment.json");
  log.notes.push(
    `Merge ${fragment} into ${path.join(stateDir, "openclaw.json")} (agents, auth, bindings, plugins.entries.nighthawk-superpowers).`,
  );
  log.notes.push(
    `Enable plugin: openclaw plugins install ${resolvePluginRoot()} && openclaw plugins enable nighthawk-superpowers`,
  );
  log.notes.push(
    "Bundled skills load from the plugin manifest; also enable memory-core, lossless-claw, discord, google per fragment.",
  );

  return log;
}

export function formatApplyReport(result: ApplyResult): string {
  const lines = [
    `State dir: ${result.stateDir}`,
    "",
    `Created (${result.created.length}):`,
    ...(result.created.length ? result.created.map((p) => `  + ${p}`) : ["  (none)"]),
    "",
    `Skipped (${result.skipped.length}, already present):`,
    ...(result.skipped.length ? result.skipped.slice(0, 20).map((p) => `  - ${p}`) : ["  (none)"]),
    ...(result.skipped.length > 20 ? [`  ... and ${result.skipped.length - 20} more`] : []),
    "",
    "Next steps:",
    ...result.notes.map((n) => `  - ${n}`),
  ];
  return lines.join("\n");
}
