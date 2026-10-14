import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/configHealth.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { inspectConfig, REQUIRED_ENV_KEYS } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

const goodEnv = {
  VITE_SUPABASE_URL: "https://abcdefghijklmnop.supabase.co",
  VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature",
  VITE_CLERK_PUBLISHABLE_KEY: "pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk",
  VITE_MAPBOX_ACCESS_TOKEN: "pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjazAifQ.signature",
};

const goodData = {
  monuments: [{ number: "1", name: "Falla 1" }, { number: "2", name: "Falla 2" }],
  hubs: [{ id: "hub-a", name: "Hub A" }],
  events: [
    { id: "e1", hubId: "hub-a" },
    { id: "e2" },
  ],
};

const codes = (env, data) => inspectConfig(env, data).map((f) => f.code);
const finding = (env, data, code) => inspectConfig(env, data).find((f) => f.code === code);

test("a complete, consistent configuration reports no failures", () => {
  const findings = inspectConfig(goodEnv, goodData);
  assert.deepEqual(findings.filter((f) => f.level === "fail"), []);
});

test("missing environment variables are failures naming the key", () => {
  const findings = inspectConfig({}, goodData);
  const fails = findings.filter((f) => f.level === "fail");
  assert.equal(fails.length, REQUIRED_ENV_KEYS.length);
  for (const key of REQUIRED_ENV_KEYS) {
    assert.ok(fails.some((f) => f.message.includes(key)), `${key} not reported`);
  }
  assert.equal(codes({}, goodData).includes("env.placeholder"), false);
});

test("placeholder values are flagged separately from missing ones", () => {
  const env = { ...goodEnv, VITE_MAPBOX_ACCESS_TOKEN: "your-mapbox-token-here" };
  assert.equal(finding(env, goodData, "env.placeholder")?.key, "VITE_MAPBOX_ACCESS_TOKEN");
  // A key the codebase can never use is at least as bad as an absent one.
  assert.ok(finding(env, goodData, "env.placeholder").level === "fail");
});

test("a non-public Mapbox token is flagged (it would ship to the browser)", () => {
  const env = { ...goodEnv, VITE_MAPBOX_ACCESS_TOKEN: "sk.eyJ1IjoiZXhhbXBsZSJ9.signature" };
  assert.ok(finding(env, goodData, "env.mapboxPublishable"));
  assert.equal(inspectConfig(env, goodData).filter((f) => f.level === "fail").length, 1);
});

test("a malformed Supabase URL is a failure, a well-formed one is not", () => {
  assert.ok(finding({ ...goodEnv, VITE_SUPABASE_URL: "not-a-url" }, goodData, "env.supabaseUrl"));
  assert.ok(
    finding({ ...goodEnv, VITE_SUPABASE_URL: "https://example.com" }, goodData, "env.supabaseUrl")
  );
});

test("data problems are reported: empty data, duplicate ids, dangling hub links", () => {
  assert.ok(codes(goodEnv, { ...goodData, monuments: [] }).includes("data.noMonuments"));
  assert.ok(codes(goodEnv, { ...goodData, events: [] }).includes("data.noSchedule"));
  assert.ok(
    codes(goodEnv, { ...goodData, events: [{ id: "e1" }, { id: "e1" }] }).includes("data.duplicateEventIds")
  );
  const dangling = { ...goodData, events: [{ id: "e1", hubId: "hub-missing" }] };
  assert.ok(codes(goodEnv, dangling).includes("data.danglingHubId"));
});

test("every finding carries a level, a code and an actionable message", () => {
  for (const finding of inspectConfig({}, {})) {
    assert.ok(["fail", "warn", "pass"].includes(finding.level));
    assert.match(finding.code, /^[a-z]+\.[a-zA-Z]+$/);
    assert.ok(finding.message.length > 10);
  }
});
