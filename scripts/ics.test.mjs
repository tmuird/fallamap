import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/ics.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { escapeIcsText, buildIcsCalendar, parseIcsPlanIds, buildIcsPlanQuery } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

const CAL = { prodId: "-//Test//EN", timeZone: "Europe/Madrid", calendarName: "Test 2026", slug: "Fallas2026" };

const mascleta = {
  id: "mascleta-final",
  title: "Grand Mascletà",
  location: "Plaça de l'Ajuntament",
  description: "Falles, llum i soroll",
  time: "14:00",
  date: "2026-03-19",
};

test("escapes the RFC 5545 TEXT characters", () => {
  assert.equal(escapeIcsText("a, b; c\\d\ne"), "a\\, b\\; c\\\\d\\ne");
  // A comma in the title must not split the SUMMARY value.
  assert.equal(escapeIcsText("Falles, llum"), "Falles\\, llum");
});

test("wraps events in one calendar with CRLF separators", () => {
  const ics = buildIcsCalendar([mascleta], CAL);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"), "missing header");
  assert.ok(ics.endsWith("END:VCALENDAR"), "missing footer");
  assert.ok(ics.includes(`PRODID:${CAL.prodId}`));
  assert.ok(ics.includes(`X-WR-CALNAME:${CAL.calendarName}`));
  assert.equal(ics.split("BEGIN:VEVENT").length - 1, 1);
  assert.equal(ics.split("END:VEVENT").length - 1, 1);
  assert.ok(ics.includes("SUMMARY:Grand Mascletà – "), `summary missing: ${ics}`);
  assert.ok(ics.includes("DTSTART;TZID=Europe/Madrid:20260319T140000"));
  assert.ok(ics.includes("DTEND;TZID=Europe/Madrid:20260319T150000"));
  assert.ok(ics.includes("DESCRIPTION:Falles\\, llum i soroll"));
  assert.ok(!ics.includes("\n\n"), "should not contain blank lines");
});

test("rolls DTEND into the next day for late events", () => {
  const late = { ...mascleta, id: "pyro", time: "23:59" };
  const ics = buildIcsCalendar([late], CAL);
  assert.ok(ics.includes("DTSTART;TZID=Europe/Madrid:20260319T235900"), ics);
  assert.ok(ics.includes("DTEND;TZID=Europe/Madrid:20260320T005900"), "DTEND must follow DTSTART across midnight");
});

test("keeps one UID per event+start so re-imports update in place", () => {
  const first = buildIcsCalendar([mascleta], CAL);
  const second = buildIcsCalendar([mascleta], CAL);
  const uid = (ics) => ics.split("\r\n").find((line) => line.startsWith("UID:"));
  assert.equal(uid(first), "UID:mascleta-final-20260319T140000@Fallas2026");
  assert.equal(uid(first), uid(second));
  const moved = buildIcsCalendar([{ ...mascleta, time: "19:00" }], CAL);
  assert.notEqual(uid(moved), uid(first), "a different start time is a different occurrence");
});

test("emits an empty calendar for an empty plan", () => {
  const ics = buildIcsCalendar([], CAL);
  assert.ok(ics.includes("BEGIN:VCALENDAR"));
  assert.ok(ics.includes("END:VCALENDAR"));
  assert.equal(ics.includes("BEGIN:VEVENT"), false);
});

test("orders events chronologically across days", () => {
  const later = { ...mascleta, id: "crema", time: "22:00", date: "2026-03-20" };
  const earlier = { ...mascleta, id: "cavalcada", time: "19:00", date: "2026-03-19" };
  const ics = buildIcsCalendar([later, earlier, mascleta], CAL);
  const order = [...ics.matchAll(/UID:([a-z-]+)-/g)].map((m) => m[1]);
  assert.deepEqual(order, ["mascleta-final", "cavalcada", "crema"]);
});

test("round-trips a shareable plan link", () => {
  const query = buildIcsPlanQuery(["crema", "mascleta-final"]);
  assert.equal(query, "crema,mascleta-final");
  // The sharer's order is preserved (it is their itinerary); the plan view re-groups by
  // day when it renders. Unknown ids are dropped so a stale link cannot inject anything.
  assert.deepEqual(parseIcsPlanIds("?plan=crema,mascleta-final", ["mascleta-final", "crema", "other"]), [
    "crema",
    "mascleta-final",
  ]);
  // Unknown ids are dropped, duplicates collapse, junk degrades to an empty plan.
  assert.deepEqual(parseIcsPlanIds("?plan=crema,crema,nope", ["crema"]), ["crema"]);
  assert.deepEqual(parseIcsPlanIds("?plan=", ["crema"]), []);
  assert.deepEqual(parseIcsPlanIds("", ["crema"]), []);
  assert.deepEqual(parseIcsPlanIds("?plan=%20", ["crema"]), []);
});
