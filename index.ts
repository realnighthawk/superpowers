import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";
import { applyKit, formatApplyReport } from "./src/apply.js";
import { loadProfile, updateProfile } from "./src/profile.js";
import { loadAgentConfig, updateAgentConfig, type AgentConfig } from "./src/agent-config.js";
import { bundlePath, resolveStateDir } from "./src/paths.js";

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  details: Record<string, unknown>;
};

function textResult(text: string, details: Record<string, unknown> = {}): ToolResult {
  return { content: [{ type: "text", text }], details };
}

export default definePluginEntry({
  id: "nighthawk-superpowers",
  name: "Nighthawk Superpowers",
  description:
    "Portable multi-agent OpenClaw setup: bundled skills, workspace templates, profile tools, and apply CLI.",
  register(api) {
    const optional = { optional: true } as const;

    api.registerTool(
      {
        name: "user_profile_get",
        label: "user_profile_get",
        description:
          "Read the steward user profile from Zuzu workspace (user-profile.json). Zuzu-only; other agents do not use this.",
        parameters: Type.Object({}),
        async execute() {
          const profile = loadProfile(resolveStateDir());
          return textResult(JSON.stringify(profile, null, 2), { profile });
        },
      },
      optional,
    );

    api.registerTool(
      {
        name: "user_profile_update",
        label: "user_profile_update",
        description:
          "Merge fields into user-profile.json in Zuzu workspace. Nested objects are deep-merged.",
        parameters: Type.Object({
          patch: Type.Record(Type.String(), Type.Unknown(), {
            description:
              'Partial profile update, e.g. { "metrics": { "weightKg": 75 }, "coaching": { "lastDailyPlanDate": "2026-05-20" } }',
          }),
        }),
        async execute(_id, params: { patch: Record<string, unknown> }) {
          const profile = updateProfile(resolveStateDir(), params.patch);
          return textResult(JSON.stringify({ ok: true, profile }, null, 2), { ok: true, profile });
        },
      },
      optional,
    );

    api.registerTool(
      {
        name: "agent_config_get",
        label: "agent_config_get",
        description:
          "Read the agent config (name, personality) for a given agent. Used by agents to load their user-defined identity on startup.",
        parameters: Type.Object({
          agentId: Type.String({ description: "Agent ID, e.g. zuzu" }),
        }),
        async execute(_id, params: { agentId: string }) {
          const config = loadAgentConfig(resolveStateDir(), params.agentId);
          return textResult(JSON.stringify(config, null, 2), { config });
        },
      },
      optional,
    );

    api.registerTool(
      {
        name: "agent_config_set",
        label: "agent_config_set",
        description:
          "Update the agent config (name, personality) for a given agent. Used during first-run bootstrap to store user-defined identity.",
        parameters: Type.Object({
          agentId: Type.String({ description: "Agent ID, e.g. zuzu" }),
          patch: Type.Object(
            {
              name: Type.Optional(Type.Union([Type.String(), Type.Null()])),
              personality: Type.Optional(Type.Union([Type.String(), Type.Null()])),
            },
            { description: "Fields to update" },
          ),
        }),
        async execute(_id, params: { agentId: string; patch: Partial<AgentConfig> }) {
          const config = updateAgentConfig(resolveStateDir(), params.agentId, params.patch);
          return textResult(JSON.stringify({ ok: true, config }, null, 2), { ok: true, config });
        },
      },
      optional,
    );

    api.registerCli(
      (ctx) => {
        const superpowers = ctx.program
          .command("nighthawk-superpowers")
          .description("Nighthawk Superpowers bundle installer");

        superpowers
          .command("apply")
          .description("Copy agent workspaces, auth templates, cron jobs, and profile seed into ~/.openclaw")
          .option("--state-dir <path>", "OpenClaw state directory (default: OPENCLAW_STATE_DIR or ~/.openclaw)")
          .option("--force", "Overwrite existing workspace files and replace cron jobs with the same id")
          .option("--skip-cron", "Do not merge cron/jobs.json templates")
          .option("--skip-auth", "Do not copy auth-profiles.template.json into agent dirs")
          .action((opts: { stateDir?: string; force?: boolean; skipCron?: boolean; skipAuth?: boolean }) => {
            const result = applyKit({
              stateDir: opts.stateDir,
              force: Boolean(opts.force),
              skipCron: Boolean(opts.skipCron),
              skipAuth: Boolean(opts.skipAuth),
            });
            ctx.logger.info(formatApplyReport(result));
          });

        superpowers
          .command("paths")
          .description("Print bundle paths for manual inspection")
          .action(() => {
            const stateDir = resolveStateDir();
            ctx.logger.info(
              [
                `stateDir: ${stateDir}`,
                `fragment: ${bundlePath("config", "openclaw.fragment.json")}`,
                `skills: ${bundlePath("skills")}`,
                "skills load automatically when the plugin is enabled",
              ].join("\n"),
            );
          });
      },
      { commands: ["nighthawk-superpowers"] },
    );
  },
});
