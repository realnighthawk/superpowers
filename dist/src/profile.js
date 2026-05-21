import fs from "node:fs";
import path from "node:path";
export const DEFAULT_PROFILE = {
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
export function resolveProfilePath(stateDir) {
    return path.join(stateDir, "agents", "zuzu", "workspace", "user-profile.json");
}
function deepMerge(base, patch) {
    const out = { ...base };
    for (const [key, value] of Object.entries(patch)) {
        if (value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            typeof base[key] === "object" &&
            base[key] !== null &&
            !Array.isArray(base[key])) {
            out[key] = deepMerge(base[key], value);
        }
        else {
            out[key] = value;
        }
    }
    return out;
}
export function loadProfile(stateDir) {
    const filePath = resolveProfilePath(stateDir);
    if (!fs.existsSync(filePath)) {
        return { ...DEFAULT_PROFILE };
    }
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return { ...DEFAULT_PROFILE, ...raw };
}
export function saveProfile(stateDir, profile) {
    const filePath = resolveProfilePath(stateDir);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
    return filePath;
}
export function updateProfile(stateDir, patch) {
    const current = loadProfile(stateDir);
    const merged = deepMerge(current, patch);
    merged.version = 1;
    saveProfile(stateDir, merged);
    return merged;
}
