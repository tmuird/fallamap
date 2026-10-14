import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/authStep.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { isAuthSubroute, shouldOfferAuthStepRecovery, CLERK_STEP_SELECTOR } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("treats only nested Clerk steps as subroutes", () => {
  assert.equal(isAuthSubroute("/sign-in"), false);
  assert.equal(isAuthSubroute("/sign-in/"), false);
  assert.equal(isAuthSubroute("/sign-up"), false);
  assert.equal(isAuthSubroute("/sign-in/reset-password"), true);
  assert.equal(isAuthSubroute("/sign-up/verify-email-address"), true);
  assert.equal(isAuthSubroute("/map"), false);
  assert.equal(isAuthSubroute("/profile/sign-in"), false);
});

test("offers recovery only for a subroute where Clerk rendered no step", () => {
  // This is the blank page users hit: a bare deep link with no attempt in progress.
  assert.equal(shouldOfferAuthStepRecovery(true, false), true);
  // A real in-progress step must never be replaced by the recovery panel.
  assert.equal(shouldOfferAuthStepRecovery(true, true), false);
  // The first step of the flow renders normally, so nothing to recover.
  assert.equal(shouldOfferAuthStepRecovery(false, false), false);
  assert.equal(shouldOfferAuthStepRecovery(false, true), false);
});

test("step detection covers the containers Clerk actually renders", () => {
  for (const selector of [".cl-card", ".cl-form", "form"]) {
    assert.ok(CLERK_STEP_SELECTOR.includes(selector), `${selector} missing from ${CLERK_STEP_SELECTOR}`);
  }
});
