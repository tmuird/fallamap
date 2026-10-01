import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/searchHighlight.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { getHighlightSegments } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("highlights every case-insensitive occurrence", () => {
  assert.deepEqual(getHighlightSegments("Plaza plaza", "PLAZA"), [
    { text: "Plaza", highlighted: true },
    { text: " ", highlighted: false },
    { text: "plaza", highlighted: true },
  ]);
});

test("treats regex metacharacters in the query literally", () => {
  assert.deepEqual(getHighlightSegments("A [site] and [hub]", "["), [
    { text: "A ", highlighted: false },
    { text: "[", highlighted: true },
    { text: "site] and ", highlighted: false },
    { text: "[", highlighted: true },
    { text: "hub]", highlighted: false },
  ]);
});

test("preserves the whole name without highlighting for an empty or absent query", () => {
  assert.deepEqual(getHighlightSegments("Plaza Mayor", ""), [
    { text: "Plaza Mayor", highlighted: false },
  ]);
  assert.deepEqual(getHighlightSegments("Plaza Mayor", "xyz"), [
    { text: "Plaza Mayor", highlighted: false },
  ]);
});
