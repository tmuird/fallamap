import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/authForm.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const {
  validateIdentifier,
  validatePassword,
  validateCode,
  describeClerkError,
  nextSignInStep,
  nextSignUpStep,
} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("identifier validation accepts real addresses and trims whitespace", () => {
  assert.equal(validateIdentifier("  tom@example.com  "), null);
  assert.equal(validateIdentifier("tom+fallas@example.co.uk"), null);
});

test("identifier validation rejects the mistakes people actually make", () => {
  assert.ok(validateIdentifier(""));
  assert.ok(validateIdentifier("   "));
  assert.ok(validateIdentifier("tom"), "no @ — must be rejected before a network round trip");
  assert.ok(validateIdentifier("tom@"));
  assert.ok(validateIdentifier("@example.com"));
  assert.ok(validateIdentifier("tom@example"), "no TLD");
  assert.ok(validateIdentifier("tom @example.com"), "space in the middle");
});

test("password validation enforces Clerk's minimum and nothing arbitrary", () => {
  assert.ok(validatePassword(""));
  assert.ok(validatePassword("short"));
  assert.equal(validatePassword("12345678"), null, "8 characters is Clerk's default minimum");
  assert.equal(validatePassword("a longer passphrase"), null);
  assert.ok(validatePassword("       "), "whitespace-only is not a password");
});

test("code validation expects a numeric code", () => {
  assert.ok(validateCode(""));
  assert.ok(validateCode("12"));
  assert.ok(validateCode("abcdef"));
  assert.equal(validateCode("123456"), null);
  assert.equal(validateCode(" 123456 "), null, "pasted codes often carry spaces");
});

test("known Clerk error codes map to human messages against the right field", () => {
  const cases = [
    ["form_identifier_not_found", "identifier"],
    ["form_password_incorrect", "password"],
    ["form_identifier_exists", "identifier"],
    ["form_code_incorrect", "code"],
    ["form_password_length_too_short", "password"],
    ["form_password_pwned", "password"],
  ];
  for (const [code, field] of cases) {
    const { message, field: mapped } = describeClerkError({ errors: [{ code, message: "raw clerk text" }] });
    assert.equal(mapped, field, `${code} → wrong field`);
    assert.ok(message.length > 12, `${code} produced no useful message`);
    assert.equal(/[_\s]form[_ ]/.test(message), false, `${code} leaked the raw code into the message`);
  }
});

test("a rate limit is explained rather than shown as a failure of the form", () => {
  const { message, field } = describeClerkError({ errors: [{ code: "too_many_requests", message: "x" }] });
  assert.equal(field, "form");
  assert.match(message, /too many/i);
});

test("an unknown code falls back to Clerk's own long message, then a generic one", () => {
  assert.equal(
    describeClerkError({ errors: [{ code: "made_up_code", longMessage: "Something specific happened." }] }).message,
    "Something specific happened."
  );
  assert.match(describeClerkError({ errors: [{ code: "made_up_code" }] }).message, /went wrong/i);
  assert.match(describeClerkError(new Error("network down")).message, /went wrong/i);
  assert.match(describeClerkError(null).message, /went wrong/i);
});

test("a network failure is described as connectivity, not as bad credentials", () => {
  const { message } = describeClerkError({ errors: [{ code: "network_error", message: "x" }] });
  assert.match(message, /connection/i);
});

test("sign-in step follows Clerk's status", () => {
  assert.equal(nextSignInStep("needs_identifier"), "identifier");
  assert.equal(nextSignInStep("needs_first_factor"), "password");
  assert.equal(nextSignInStep("needs_second_factor"), "code");
  assert.equal(nextSignInStep("needs_new_password"), "new-password");
  assert.equal(nextSignInStep("complete"), "done");
  assert.equal(nextSignInStep(undefined), "identifier", "unknown/absent status restarts at the beginning");
});

test("sign-up step follows Clerk's status", () => {
  assert.equal(nextSignUpStep("missing_requirements"), "identifier");
  assert.equal(nextSignUpStep("missing_requirements", true), "code", "awaiting the emailed code");
  assert.equal(nextSignUpStep("complete"), "done");
  assert.equal(nextSignUpStep(undefined), "identifier");
});
