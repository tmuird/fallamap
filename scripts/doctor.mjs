#!/usr/bin/env node
/**
 * npm run doctor — check a deployment before shipping it.
 *
 * Reads the local configuration and data files, then probes the backend host, so an
 * event deployment (a new city, a company venue) fails loudly here instead of
 * silently in the browser. Exits non-zero when anything is a hard failure.
 *
 *   node scripts/doctor.mjs            # report only
 *   node scripts/doctor.mjs --no-net   # skip the DNS/HTTP probe (offline use)
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const skipNetwork = process.argv.includes("--no-net");

const GREEN = "\u001b[32m";
const RED = "\u001b[31m";
const YELLOW = "\u001b[33m";
const DIM = "\u001b[2m";
const RESET = "\u001b[0m";

async function loadConfigHealth() {
  const source = await readFile(join(ROOT, "src/lib/configHealth.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

/** Minimal .env reader — no dotenv dependency, no value ever printed. */
function readEnvFile(contents) {
  const env = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function readJson(relativePath) {
  const contents = await readFile(join(ROOT, relativePath), "utf8");
  return JSON.parse(contents);
}

/** Ask a public resolver — local caches lag behind a fresh/deleted project. */
async function resolveHost(hostname) {
  const response = await fetch(`https://1.1.1.1/dns-query?name=${hostname}&type=A`, {
    headers: { accept: "application/dns-json" },
    signal: AbortSignal.timeout(8000),
  });
  const body = await response.json();
  const answers = (body.Answer ?? []).map((answer) => answer.data).filter(Boolean);
  return { status: body.Status, answers };
}

async function main() {
  const { inspectConfig } = await loadConfigHealth();

  const report = [];
  const envPath = join(ROOT, ".env");
  let env = {};
  if (existsSync(envPath)) {
    env = readEnvFile(await readFile(envPath, "utf8"));
    report.push({ level: "pass", code: "env.file", message: ".env found" });
  } else {
    report.push({
      level: "fail",
      code: "env.noFile",
      message: "No .env — copy .env.example to .env and fill it in (see README).",
    });
  }

  const fallas = await readJson("src/components/fallas.json");
  const eventData = await readJson("src/components/official_events.json");
  const programmeEvents = (eventData.schedule ?? []).flatMap((day) => day.events ?? []);
  report.push(...inspectConfig(env, {
    monuments: fallas,
    hubs: eventData.hubs,
    events: programmeEvents,
  }));
  report.push({
    level: "pass",
    code: "data.loaded",
    message: `Data files parse: ${fallas.length} monuments, ${eventData.hubs.length} hubs, ${programmeEvents.length} programme events across ${(eventData.schedule ?? []).length} days.`,
  });

  // --- backend reachability
  const supabaseUrl = (env.VITE_SUPABASE_URL ?? "").trim();
  if (supabaseUrl && /^https:\/\//.test(supabaseUrl)) {
    const hostname = new URL(supabaseUrl).hostname;
    if (skipNetwork) {
      report.push({ level: "warn", code: "net.skipped", message: `Skipped the probe for ${hostname} (--no-net).` });
    } else {
      try {
        const { status, answers } = await resolveHost(hostname);
        if (status === 3 || answers.length === 0) {
          report.push({
            level: "fail",
            code: "net.supabaseDns",
            message: `${hostname} does not resolve (NXDOMAIN) — that Supabase project no longer exists. Community features (comments, photos, likes, moderation) stay offline until VITE_SUPABASE_URL points at a live project.`,
          });
        } else {
          try {
            const rest = await fetch(`${supabaseUrl}/rest/v1/`, {
              headers: { apikey: env.VITE_SUPABASE_ANON_KEY ?? "" },
              signal: AbortSignal.timeout(10000),
            });
            report.push({
              level: rest.status < 500 ? "pass" : "warn",
              code: "net.supabaseHttp",
              message: `${hostname} responds (HTTP ${rest.status}) — the REST API is reachable.`,
            });
          } catch (error) {
            report.push({
              level: "warn",
              code: "net.supabaseHttp",
              message: `${hostname} resolves but did not answer over HTTPS (${error.message}).`,
            });
          }
        }
      } catch (error) {
        report.push({
          level: "warn",
          code: "net.probeFailed",
          message: `Could not probe ${hostname}: ${error.message}`,
        });
      }
    }
  }

  const order = { fail: 0, warn: 1, pass: 2 };
  report.sort((a, b) => order[a.level] - order[b.level]);

  const icon = { fail: `${RED}✖${RESET}`, warn: `${YELLOW}!${RESET}`, pass: `${GREEN}✔${RESET}` };
  console.log(`\nFallamap configuration check ${DIM}(${ROOT})${RESET}\n`);
  for (const finding of report) {
    console.log(` ${icon[finding.level]} ${finding.message}`);
    console.log(`   ${DIM}${finding.code}${RESET}`);
  }

  const failures = report.filter((finding) => finding.level === "fail").length;
  const warnings = report.filter((finding) => finding.level === "warn").length;
  console.log(
    `\n${failures === 0 ? GREEN + "Ready." : RED + "Not ready."}${RESET} ${failures} failure(s), ${warnings} warning(s).\n`
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(`doctor crashed: ${error.stack ?? error.message}`);
  process.exit(2);
});
