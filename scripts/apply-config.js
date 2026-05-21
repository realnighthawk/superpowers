#!/usr/bin/env node
// Nighthawk Superpowers v2 — openclaw.json agent patcher
// Removes v1 agents, upserts v2 agents, preserves all other config.

import { readFileSync, writeFileSync, copyFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const STATE_DIR = process.env.OPENCLAW_STATE_DIR ?? join(homedir(), ".openclaw");
const CONFIG_PATH = join(STATE_DIR, "openclaw.json");

if (!existsSync(CONFIG_PATH)) {
  console.error(`openclaw.json not found at ${CONFIG_PATH}`);
  console.error("Set OPENCLAW_STATE_DIR if your state dir is non-default.");
  process.exit(1);
}

// Backup
const backup = `${CONFIG_PATH}.bak`;
copyFileSync(CONFIG_PATH, backup);
console.log(`Backed up to ${backup}`);

const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));

// Agents to remove (v1)
const REMOVE = new Set(["sre", "coder", "illustrator"]);

// V2 agent definitions — workspace paths use the state dir
const w = (id) => join(STATE_DIR, "agents", id, "workspace");
const a = (id) => join(STATE_DIR, "agents", id, "agent");

const V2_AGENTS = [
  {
    id: "zuzu",
    default: true,
    name: "Zuzu",
    workspace: w("zuzu"),
    agentDir: a("zuzu"),
    model: "google/gemini-3-flash-preview",
    skills: ["gog", "zuzu-personal", "discord", "discord-post", "calendar-block", "gmail-action", "memory-search", "web-search", "summarize"],
    tools: {
      profile: "minimal",
      alsoAllow: ["memory_search", "memory_get", "sessions_spawn", "sessions_list", "agents_list", "session_status", "user_profile_get", "user_profile_update", "message", "exec", "process", "image_generate", "image"],
      deny: ["write", "edit", "apply_patch", "browser"],
      exec: { security: "allowlist", ask: "on-miss" },
    },
    subagents: {
      allowAgents: ["zuzu", "fitness-coach", "productivity-agent", "finance-agent", "creative-agent", "learning-agent", "sysadmin-agent", "social-agent"],
      delegationMode: "prefer",
    },
    identity: { name: "Zuzu", emoji: "🦉", theme: "Personal coordinator and Discord steward" },
  },
  {
    id: "fitness-coach",
    name: "Fitness Coach",
    workspace: w("fitness-coach"),
    agentDir: a("fitness-coach"),
    model: "google/gemini-3-flash-preview",
    skills: ["fitness-trainer", "fitness-workout", "fitness-diet", "fitness-chart", "memory-search", "summarize"],
    tools: {
      profile: "minimal",
      alsoAllow: ["memory_search", "memory_get", "sessions_spawn", "sessions_list", "session_status"],
      deny: ["browser", "write", "edit", "apply_patch", "exec", "user_profile_get", "user_profile_update", "message"],
    },
    subagents: { allowAgents: ["zuzu"], delegationMode: "prefer" },
    heartbeat: { every: "8h", lightContext: true },
    identity: { name: "Fitness Coach", emoji: "💪", theme: "Workout and nutrition coaching" },
  },
  {
    id: "productivity-agent",
    name: "Compass",
    workspace: w("productivity-agent"),
    agentDir: a("productivity-agent"),
    model: "google/gemini-3-flash-preview",
    skills: ["task-plan", "email-triage", "calendar-review", "memory-search", "summarize"],
    tools: {
      profile: "minimal",
      alsoAllow: ["memory_search", "memory_get", "sessions_spawn", "sessions_list", "session_status"],
      deny: ["browser", "write", "edit", "apply_patch", "exec", "user_profile_get", "user_profile_update", "message"],
    },
    subagents: { allowAgents: ["zuzu"], delegationMode: "prefer" },
    identity: { name: "Compass", emoji: "🧭", theme: "Calendar, email, and task planning" },
  },
  {
    id: "finance-agent",
    name: "Ledger",
    workspace: w("finance-agent"),
    agentDir: a("finance-agent"),
    model: "google/gemini-3-flash-preview",
    skills: ["expense-log", "budget-review", "finance-alert", "memory-search"],
    tools: {
      profile: "minimal",
      alsoAllow: ["memory_search", "memory_get", "read", "write", "sessions_spawn", "sessions_list", "session_status"],
      deny: ["browser", "edit", "apply_patch", "exec", "user_profile_get", "user_profile_update", "message"],
    },
    subagents: { allowAgents: ["zuzu"], delegationMode: "prefer" },
    identity: { name: "Ledger", emoji: "📊", theme: "Expense tracking and budget management" },
  },
  {
    id: "creative-agent",
    name: "Canvas",
    workspace: w("creative-agent"),
    agentDir: a("creative-agent"),
    model: "google/gemini-3.1-pro-preview",
    skills: ["image-generate", "journal-write", "writing-assist", "memory-search"],
    tools: {
      profile: "minimal",
      alsoAllow: ["memory_search", "memory_get", "image_generate", "image", "read", "write", "sessions_spawn", "session_status"],
      deny: ["browser", "exec", "user_profile_get", "user_profile_update", "message"],
    },
    subagents: { allowAgents: ["zuzu"] },
    identity: { name: "Canvas", emoji: "🎨", theme: "Image generation, journaling, and writing" },
  },
  {
    id: "learning-agent",
    name: "Sage",
    workspace: w("learning-agent"),
    agentDir: a("learning-agent"),
    model: "google/gemini-3.1-pro-preview",
    skills: ["study-plan", "content-summarize", "reading-list", "memory-search", "web-search", "summarize"],
    tools: {
      profile: "minimal",
      alsoAllow: ["memory_search", "memory_get", "read", "write", "exec", "sessions_spawn", "session_status"],
      deny: ["browser", "edit", "apply_patch", "user_profile_get", "user_profile_update", "message"],
      exec: { security: "allowlist", ask: "on-miss" },
    },
    subagents: { allowAgents: ["zuzu", "learning-agent"], delegationMode: "prefer" },
    identity: { name: "Sage", emoji: "📚", theme: "Study plans, content summarization, reading lists" },
  },
  {
    id: "sysadmin-agent",
    name: "Ops",
    workspace: w("sysadmin-agent"),
    agentDir: a("sysadmin-agent"),
    model: "google/gemini-3.1-pro-preview",
    skills: ["k8s-debug", "server-health", "ssh-exec", "memory-search"],
    tools: {
      profile: "coding",
      alsoAllow: ["memory_search", "memory_get", "exec", "process", "sessions_spawn", "sessions_list", "session_status", "message"],
      deny: ["browser", "user_profile_get", "user_profile_update"],
      exec: { security: "allowlist", ask: "always" },
    },
    subagents: { allowAgents: ["zuzu"], delegationMode: "prefer" },
    heartbeat: { every: "6h", lightContext: true },
    identity: { name: "Ops", emoji: "⚙️", theme: "k8s, server monitoring, SSH administration" },
  },
  {
    id: "social-agent",
    name: "Pulse",
    workspace: w("social-agent"),
    agentDir: a("social-agent"),
    model: "google/gemini-3-flash-preview",
    skills: ["daily-briefing", "discord-summary", "memory-search", "summarize"],
    tools: {
      profile: "minimal",
      alsoAllow: ["memory_search", "memory_get", "read"],
      deny: ["browser", "write", "edit", "apply_patch", "exec", "user_profile_get", "user_profile_update", "message", "sessions_spawn"],
    },
    subagents: { allowAgents: [] },
    identity: { name: "Pulse", emoji: "📡", theme: "Daily briefings and Discord digests" },
  },
  {
    id: "home-agent",
    name: "Home",
    enabled: false,
    workspace: w("home-agent"),
    agentDir: a("home-agent"),
    model: "google/gemini-3-flash-preview",
    skills: ["home-placeholder"],
    tools: { profile: "minimal" },
    identity: { name: "Home", emoji: "🏠", theme: "Home automation (placeholder, disabled)" },
  },
];

// Patch agents list: remove v1, upsert v2
const v2ids = new Set(V2_AGENTS.map((a) => a.id));
const existing = (config.agents?.list ?? []).filter((a) => !REMOVE.has(a.id) && !v2ids.has(a.id));
config.agents = config.agents ?? {};
config.agents.list = [...V2_AGENTS, ...existing];

// Add youtube-transcripts plugin if missing
const allow = config.plugins?.allow ?? [];
if (!allow.includes("youtube-transcripts")) {
  config.plugins.allow = [...allow, "youtube-transcripts"];
}
const entries = config.plugins?.entries ?? {};
if (!entries["youtube-transcripts"]) {
  config.plugins.entries["youtube-transcripts"] = { enabled: true };
}

writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
console.log(`Updated ${CONFIG_PATH}`);
console.log("");
console.log("Changes applied:");
console.log("  - Removed: sre, coder, illustrator");
console.log("  - Updated: zuzu, fitness-coach");
console.log("  - Added: productivity-agent, finance-agent, creative-agent,");
console.log("           learning-agent, sysadmin-agent, social-agent, home-agent");
console.log("  - Added: youtube-transcripts plugin");
console.log("");
console.log("Restore backup: cp ~/.openclaw/openclaw.json.bak ~/.openclaw/openclaw.json");
