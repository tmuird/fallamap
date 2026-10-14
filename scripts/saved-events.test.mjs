import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/savedEvents.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { readSavedEventIds, toggleSavedEventId, getSavedEventStorageKey, getSavedEventItemStorageKey, buildSavedEventGroups, readSavedEventIdsFromStorage, toggleSavedEventInStorage } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

const validIds = ["opening", "mascleta", "crema"];

test("loads only known unique event IDs and safely handles corrupt storage", () => {
  assert.deepEqual(
    readSavedEventIds('["mascleta","unknown","mascleta","crema"]', validIds),
    ["mascleta", "crema"]
  );
  assert.deepEqual(readSavedEventIds("not-json", validIds), []);
  assert.deepEqual(readSavedEventIds(null, validIds), []);
});

test("toggle adds and removes one event without mutating previous state", () => {
  const original = ["opening"];
  const added = toggleSavedEventId(original, "mascleta");
  assert.deepEqual(added, ["opening", "mascleta"]);
  assert.deepEqual(original, ["opening"]);
  assert.deepEqual(toggleSavedEventId(added, "mascleta"), ["opening"]);
  assert.deepEqual(toggleSavedEventId(added, "opening"), ["mascleta"]);
});

test("groups saved events across days in their original itinerary order", () => {
  const days = [
    { id: "day-1", subtitle: "Opening", events: [{ id: "opening" }, { id: "mascleta" }] },
    { id: "day-2", subtitle: "Night", events: [{ id: "crema" }] },
  ];
  assert.deepEqual(buildSavedEventGroups(days, ["crema", "opening"]), [
    { id: "day-1", subtitle: "Opening", events: [{ id: "opening" }] },
    { id: "day-2", subtitle: "Night", events: [{ id: "crema" }] },
  ]);
});

test("separate tab updates keep different event saves instead of replacing the whole plan", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };

  const firstTab = toggleSavedEventInStorage(storage, "fallas-2026", validIds, "opening");
  const secondTab = toggleSavedEventInStorage(storage, "fallas-2026", validIds, "crema");

  assert.deepEqual(firstTab.savedIds, ["opening"]);
  assert.deepEqual(secondTab.savedIds, ["opening", "crema"]);
  assert.deepEqual(readSavedEventIdsFromStorage(storage, "fallas-2026", validIds), ["opening", "crema"]);
  assert.equal(getSavedEventItemStorageKey("fallas-2026", "opening"), "eventsocial:fallas-2026:saved-event-ids:item:opening");

  const removeFromFirstTab = toggleSavedEventInStorage(storage, "fallas-2026", validIds, "opening");
  assert.deepEqual(removeFromFirstTab.savedIds, ["crema"]);
});

test("ignores an event ID that is not in the current programme", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const result = toggleSavedEventInStorage(storage, "fallas-2026", validIds, "unknown");
  assert.deepEqual(result, { saved: false, savedIds: [] });
  assert.equal(values.size, 0);
});

test("scopes saved plans to the configured event slug", () => {
  assert.equal(getSavedEventStorageKey("fallas-2026"), "eventsocial:fallas-2026:saved-event-ids");
});
