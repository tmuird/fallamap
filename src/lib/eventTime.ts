/**
 * Timezone-correct wall-clock helpers for the daily event countdown (T2.9).
 *
 * The counted-down daily time is defined in a specific IANA zone
 * (`SITE.countdown.timeZone`, e.g. "Europe/Madrid") and must NOT drift with
 * the visitor's browser timezone. Pure Date/Intl only — no timezone library
 * (dependency policy: no new packages).
 */

export interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** Wall-clock parts of `date` as seen in `timeZone`. */
export function wallClock(date: Date, timeZone: string): WallClock {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** Pseudo-epoch minutes of a wall clock — calendar arithmetic without DST. */
function wallMinutes(w: WallClock): number {
  return Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second) / 60000;
}

/**
 * True while the wall clock in `timeZone` is inside the daily live window
 * starting at `hour:minute` and lasting `windowMinutes`.
 */
export function isLiveWindow(
  now: Date,
  timeZone: string,
  hour: number,
  minute: number,
  windowMinutes: number
): boolean {
  const w = wallClock(now, timeZone);
  const start = hour * 60 + minute;
  const current = w.hour * 60 + w.minute;
  return current >= start && current < start + windowMinutes;
}

/**
 * Next instant at which the wall clock in `timeZone` reads `hour:minute`
 * (today if still ahead — the live window included — otherwise tomorrow).
 *
 * The result is found by fixed-point iteration on the UTC instant against the
 * zone's wall clock, so CET/CEST (or any DST shift) is handled without a tz
 * library. The iteration assumes the target wall time exists on the target
 * day (it is not inside a spring-forward gap, e.g. never 02:xx Europe/Madrid).
 */
export function nextEventStart(
  now: Date,
  timeZone: string,
  hour: number,
  minute: number
): Date {
  const w = wallClock(now, timeZone);
  const nowMin = wallMinutes(w);
  const wantMin = Date.UTC(w.year, w.month - 1, w.day, hour, minute) / 60000;
  // Wall-clock minutes until the target (roll to tomorrow when already past).
  const diffMin = wantMin > nowMin ? wantMin - nowMin : wantMin + 24 * 60 - nowMin;

  // First estimate assumes the wall diff equals the real diff, then correct:
  // shift the instant by the residual between its wall time and the target.
  const wantAbsMin = nowMin + diffMin;
  let guess = now.getTime() + diffMin * 60000;
  for (let i = 0; i < 3; i++) {
    const residual = wantAbsMin - wallMinutes(wallClock(new Date(guess), timeZone));
    if (residual === 0) break;
    guess += residual * 60000;
  }
  return new Date(guess);
}
