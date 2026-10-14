import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/navbarScroll.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { createNavbarScrollState, advanceNavbarScrollState } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("ignores small scroll-direction jitter until a deliberate threshold is crossed", () => {
  let state = createNavbarScrollState(120);
  state = advanceNavbarScrollState(state, 123);
  state = advanceNavbarScrollState(state, 126);
  state = advanceNavbarScrollState(state, 124);
  state = advanceNavbarScrollState(state, 130);
  assert.equal(state.visible, true);
  state = advanceNavbarScrollState(state, 134);
  assert.equal(state.visible, false);
});

test("reveals after deliberate upward scrolling and remains hidden through small jitter", () => {
  let state = { lastY: 140, pendingDelta: 0, visible: false };
  state = advanceNavbarScrollState(state, 137);
  state = advanceNavbarScrollState(state, 134);
  assert.equal(state.visible, false);
  state = advanceNavbarScrollState(state, 131);
  state = advanceNavbarScrollState(state, 128);
  assert.equal(state.visible, true);
});

test("restores the navbar at the top and keeps it visible while the menu is open", () => {
  let state = { lastY: 140, pendingDelta: 7, visible: false };
  state = advanceNavbarScrollState(state, 5);
  assert.deepEqual(state, { lastY: 5, pendingDelta: 0, visible: true });
  state = advanceNavbarScrollState({ lastY: 120, pendingDelta: 0, visible: false }, 145, true);
  assert.deepEqual(state, { lastY: 145, pendingDelta: 0, visible: true });
});
