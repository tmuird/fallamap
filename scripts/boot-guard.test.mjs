import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/bootGuard.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const {
  BOOT_SLOW_MS,
  RECOVERY_KEY,
  bootStatusCopy,
  describeBootFailure,
  isChunkLoadError,
  markRecoveryAttempt,
  shouldAttemptRecovery,
} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const fakeStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    dump: () => Object.fromEntries(map),
  };
};

// A real failed dynamic import, as Chrome/Safari/Firefox word it.
const chunkErrors = [
  new TypeError("Failed to fetch dynamically imported module: https://x/assets/SignInPage-a1b2.js"),
  new Error("error loading dynamically imported module"),
  new Error("Importing a module script failed."),
  Object.assign(new Error("Loading chunk 12 failed."), { name: "ChunkLoadError" }),
];

test("a failed dynamic import is recognised, so the app can self-heal instead of showing an error", () => {
  for (const error of chunkErrors) {
    assert.equal(isChunkLoadError(error), true, `${error.message} was not detected`);
  }
});

test("ordinary errors are not mistaken for chunk failures", () => {
  assert.equal(isChunkLoadError(new Error("Cannot read properties of undefined")), false);
  assert.equal(isChunkLoadError(new Error("Network request failed")), false);
  assert.equal(isChunkLoadError(null), false);
  assert.equal(isChunkLoadError(undefined), false);
  assert.equal(isChunkLoadError("Failed to fetch dynamically imported module"), false, "only Error objects");
});

test("recovery happens once per route per session — never a reload loop", () => {
  const storage = fakeStorage();
  assert.equal(shouldAttemptRecovery("SignInPage", storage), true, "first failure earns a reload");
  markRecoveryAttempt("SignInPage", storage);
  assert.equal(shouldAttemptRecovery("SignInPage", storage), false, "second failure must not reload again");
  assert.equal(shouldAttemptRecovery("MapPage", storage), true, "a different route gets its own chance");
});

test("recovery keys are namespaced and versioned so a stale flag cannot disable healing forever", () => {
  const storage = fakeStorage();
  markRecoveryAttempt("SignInPage", storage);
  const [key] = Object.keys(storage.dump());
  assert.ok(key.startsWith(RECOVERY_KEY), `unexpected key ${key}`);
  assert.match(key, /SignInPage/);
});

test("a storage that throws (private mode) still allows recovery rather than blanking the app", () => {
  const hostile = {
    getItem: () => { throw new Error("SecurityError"); },
    setItem: () => { throw new Error("SecurityError"); },
  };
  assert.equal(shouldAttemptRecovery("SignInPage", hostile), true);
  assert.doesNotThrow(() => markRecoveryAttempt("SignInPage", hostile));
});

test("a chunk failure is explained as a stale build the user can clear, not as bad credentials", () => {
  const copy = describeBootFailure(chunkErrors[0]);
  assert.equal(copy.isChunk, true);
  assert.equal(copy.canRetry, true);
  assert.match(copy.body, /reload|refresh|update/i);
  assert.equal(/form|password|credential|clerk/i.test(copy.body), false, "must not blame the user's input");
});

test("a non-chunk boot failure still offers a way out", () => {
  const copy = describeBootFailure(new Error("boom"));
  assert.equal(copy.isChunk, false);
  assert.equal(copy.canRetry, true);
  assert.ok(copy.title.length > 3 && copy.body.length > 20);
});

test("the boot screen stays calm at first and only offers a retry once it is clearly stuck", () => {
  const early = bootStatusCopy(250);
  assert.equal(early.showRetry, false, "a fast boot must not flash a retry button");
  assert.match(early.body, /\S/);

  const late = bootStatusCopy(BOOT_SLOW_MS + 1);
  assert.equal(late.showRetry, true, "past the threshold the user needs a way out");
  assert.match(late.body, /sign-in|sign in|account|slow|taking/i);

  const boundary = bootStatusCopy(BOOT_SLOW_MS);
  assert.equal(boundary.showRetry, true, "the threshold itself counts as stuck");
});

test("an unknown/negative elapsed time does not throw", () => {
  assert.doesNotThrow(() => bootStatusCopy(-5));
  assert.equal(bootStatusCopy(-5).showRetry, false);
  assert.equal(bootStatusCopy(Number.NaN).showRetry, false);
});
