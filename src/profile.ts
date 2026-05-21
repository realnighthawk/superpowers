import fs from "node:fs";
import path from "node:path";

export type UserProfile = {
  version: 1;
  userId: string;
  displayName?: string;
  discordUserId?: string;
  timezone?: string;
  goals?: string[];
  injuries?: string[];
  equipment?: string[];
  diet?: {
    restrictions?: string[];
    calorieTarget?: number | null;
    proteinTargetG?: number | null;
    notes?: string;
  };
  fitness?: {
    experience?: string;
    daysPerWeek?: number;
    preferredSplit?: string;
    sessionMinutes?: number;
    notes?: string;
  };
  metrics?: {
    weightKg?: number | null;
    heightCm?: number | null;
    age?: number | null;
  };
  integrations?: {
    discordFitnessChannelId?: string | null;
    googleCalendarId?: string | null;
    googleAccount?: string | null;
  };
  coaching?: {
    lastDailyPlanDate?: string | null;
    lastDiscordMessageId?: string | null;
    checkInHourLocal?: number;
  };
};

export const DEFAULT_PROFILE: UserProfile = {
  version: 1,
  userId: "nighthawk",
  displayName: "nighthawk",
  discordUserId: undefined,
  timezone: "America/Los_Angeles",
  goals: ["general fitness"],
  injuries: [],
  equipment: ["bodyweight"],
  diet: { restrictions: [], calorieTarget: null, proteinTargetG: null },
  fitness: {
    experience: "beginner",
    daysPerWeek: 3,
    preferredSplit: "full_body",
    sessionMinutes: 45,
  },
  metrics: { weightKg: null, heightCm: null, age: null },
  integrations: {
    discordFitnessChannelId: null,
    googleCalendarId: null,
    googleAccount: null,
  },
  coaching: { lastDailyPlanDate: null, lastDiscordMessageId: null, checkInHourLocal: 7 },
};

export function resolveProfilePath(stateDir: string): string {
  return path.join(stateDir, "agents", "zuzu", "workspace", "user-profile.json");
}

function deepMerge(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof base[key] === "object" &&
      base[key] !== null &&
      !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(base[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function loadProfile(stateDir: string): UserProfile {
  const filePath = resolveProfilePath(stateDir);
  if (!fs.existsSync(filePath)) {
    return { ...DEFAULT_PROFILE };
  }
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as UserProfile;
  return { ...DEFAULT_PROFILE, ...raw };
}

export function saveProfile(stateDir: string, profile: UserProfile): string {
  const filePath = resolveProfilePath(stateDir);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
  return filePath;
}

export function updateProfile(stateDir: string, patch: Record<string, unknown>): UserProfile {
  const current = loadProfile(stateDir) as unknown as Record<string, unknown>;
  const merged = deepMerge(current, patch) as unknown as UserProfile;
  merged.version = 1;
  saveProfile(stateDir, merged);
  return merged;
}
