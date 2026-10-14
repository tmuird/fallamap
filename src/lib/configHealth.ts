/**
 * Configuration health checks.
 *
 * `npm run doctor` pairs these with real I/O (reading .env, the data files, DNS and
 * an HTTP probe) so a new deployment - a company event, a new city - can be checked
 * before it ships instead of failing silently in the browser.
 *
 * Kept pure so the rules are unit tested: pass in env + data, get findings back.
 */

export interface ConfigFinding {
  level: "fail" | "warn" | "pass";
  code: string;
  key?: string;
  message: string;
}

export interface ConfigEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_CLERK_PUBLISHABLE_KEY?: string;
  VITE_MAPBOX_ACCESS_TOKEN?: string;
  [key: string]: string | undefined;
}

export interface ConfigData {
  monuments?: Array<{ number?: string }>;
  hubs?: Array<{ id?: string }>;
  /** Flattened programme events (each day's `events`, not the days themselves). */
  events?: Array<{ id?: string; hubId?: string }>;
}

export const REQUIRED_ENV_KEYS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_CLERK_PUBLISHABLE_KEY",
  "VITE_MAPBOX_ACCESS_TOKEN",
] as const;

/** Values people leave behind from .env.example; they look present but never work. */
const PLACEHOLDER_PATTERN =
  /^(your[-_ ]|xxx|changeme|replace[-_ ]|todo|placeholder|<.*>|\.\.\.)/i;

function checkEnv(env: ConfigEnv): ConfigFinding[] {
  const findings: ConfigFinding[] = [];

  for (const key of REQUIRED_ENV_KEYS) {
    const value = (env[key] ?? "").trim();
    if (!value) {
      findings.push({
        level: "fail",
        code: "env.missing",
        key,
        message: `${key} is not set — copy .env.example to .env and fill it in (see README).`,
      });
      continue;
    }
    if (PLACEHOLDER_PATTERN.test(value)) {
      findings.push({
        level: "fail",
        code: "env.placeholder",
        key,
        message: `${key} still holds the placeholder from .env.example — replace it with the real value.`,
      });
    }
  }

  const supabaseUrl = (env.VITE_SUPABASE_URL ?? "").trim();
  if (supabaseUrl && !PLACEHOLDER_PATTERN.test(supabaseUrl)) {
    const isSupabaseHost = /^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(supabaseUrl);
    if (!isSupabaseHost) {
      findings.push({
        level: "fail",
        code: "env.supabaseUrl",
        key: "VITE_SUPABASE_URL",
        message:
          "VITE_SUPABASE_URL must look like https://<project-ref>.supabase.co — comments, photos and likes cannot reach the backend otherwise.",
      });
    }
  }

  const mapbox = (env.VITE_MAPBOX_ACCESS_TOKEN ?? "").trim();
  if (mapbox && !PLACEHOLDER_PATTERN.test(mapbox) && !mapbox.startsWith("pk.")) {
    findings.push({
      level: "fail",
      code: "env.mapboxPublishable",
      key: "VITE_MAPBOX_ACCESS_TOKEN",
      message:
        "VITE_MAPBOX_ACCESS_TOKEN must be the PUBLIC token (pk.…) — a secret token here is compiled into the bundle and served to every visitor.",
    });
  }

  return findings;
}

function checkData(data: ConfigData): ConfigFinding[] {
  const findings: ConfigFinding[] = [];
  const monuments = data.monuments ?? [];
  const hubs = data.hubs ?? [];
  const events = data.events ?? [];

  if (monuments.length === 0) {
    findings.push({
      level: "fail",
      code: "data.noMonuments",
      message: "fallas.json lists no monuments — the map would render without markers.",
    });
  }
  if (events.length === 0) {
    findings.push({
      level: "fail",
      code: "data.noSchedule",
      message: "official_events.json lists no programme events — the programme page would be empty.",
    });
  }
  if (events.length > 0 && hubs.length === 0) {
    findings.push({
      level: "warn",
      code: "data.noHubs",
      message: "official_events.json defines no hubs — events cannot link to a venue on the map.",
    });
  }

  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const event of events) {
    const id = event.id ?? "";
    if (!id) {
      findings.push({
        level: "fail",
        code: "data.eventWithoutId",
        message: "A programme event has no id — it cannot be deep-linked or saved to a plan.",
      });
      continue;
    }
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  if (duplicates.size > 0) {
    findings.push({
      level: "fail",
      code: "data.duplicateEventIds",
      message: `Duplicate programme event ids: ${[...duplicates].join(", ")} — saving one would toggle both.`,
    });
  }

  const hubIds = new Set(hubs.map((hub) => hub.id));
  const dangling = [
    ...new Set(
      events
        .map((event) => event.hubId)
        .filter((hubId): hubId is string => Boolean(hubId) && !hubIds.has(hubId))
    ),
  ];
  if (dangling.length > 0) {
    findings.push({
      level: "fail",
      code: "data.danglingHubId",
      message: `Programme events reference unknown hubs: ${dangling.join(", ")} — their venue link would dead-end.`,
    });
  }

  return findings;
}

/** Run every rule. Findings are ordered: failures first, then warnings. */
export function inspectConfig(env: ConfigEnv, data: ConfigData): ConfigFinding[] {
  const findings = [...checkEnv(env), ...checkData(data)];
  const rank = { fail: 0, warn: 1, pass: 2 } as const;
  return findings.sort((a, b) => rank[a.level] - rank[b.level]);
}
