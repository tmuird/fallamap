/**
 * iCalendar (RFC 5545) generation for the programme.
 *
 * Pure string building so the date maths and escaping can be unit tested without a
 * browser: the component only turns the result into a Blob and clicks a link.
 */

export interface IcsEvent {
  id: string;
  title: string;
  location: string;
  description: string;
  /** Wall-clock start, "HH:MM". */
  time: string;
  /** Calendar date of the event, "YYYY-MM-DD". */
  date: string;
}

export interface IcsCalendarOptions {
  /** e.g. "-//Fallamap//EN" */
  prodId: string;
  /** IANA zone the wall-clock times are in, e.g. "Europe/Madrid". */
  timeZone: string;
  calendarName: string;
  /** Slug appended to UIDs so two deployments never collide. */
  slug: string;
  /** Optional page URL recorded on each event. */
  url?: string;
}

/** Escape the characters RFC 5545 reserves inside a TEXT value. */
export function escapeIcsText(value: string): string {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function dateKey(event: IcsEvent): number {
  const [year, month, day] = event.date.split("-").map(Number);
  const [hour, minute] = event.time.split(":").map(Number);
  return Date.UTC(year, month - 1, day, hour, minute);
}

function utcStamp(now: Date): string {
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function formatIcsUtcDate(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function buildVevent(event: IcsEvent, options: IcsCalendarOptions, stamp: string): string[] {
  const [hour, minute] = event.time.split(":").map(Number);
  const [year, month, day] = event.date.split("-").map(Number);

  // One-hour event. DTEND rolls into the NEXT day for late events (23:00 → next day
  // 00:00, 23:59 → next day 00:59): a same-day `00:xx` end would precede DTSTART.
  // Date.UTC handles month/year overflow.
  const startDate = new Date(Date.UTC(year, month - 1, day));
  const endDate = new Date(Date.UTC(year, month - 1, day + (hour + 1 >= 24 ? 1 : 0)));
  const startDT = `${formatIcsUtcDate(startDate)}T${pad(hour)}${pad(minute)}00`;
  const endDT = `${formatIcsUtcDate(endDate)}T${pad((hour + 1) % 24)}${pad(minute)}00`;

  // Stable per event+start so re-importing updates in place instead of duplicating.
  const uid = `${event.id}-${startDT}@${options.slug}`;

  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `SUMMARY:${escapeIcsText(`${event.title} – ${options.calendarName}`)}`,
    `DTSTART;TZID=${options.timeZone}:${startDT}`,
    `DTEND;TZID=${options.timeZone}:${endDT}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
  ];
  if (options.url) lines.push(`URL:${options.url}`);
  lines.push("END:VEVENT");
  return lines;
}

/** Build a calendar containing every event, ordered chronologically. */
export function buildIcsCalendar(
  events: IcsEvent[],
  options: IcsCalendarOptions,
  now: Date = new Date()
): string {
  const stamp = utcStamp(now);
  const ordered = [...events].sort((a, b) => dateKey(a) - dateKey(b));

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${options.prodId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(options.calendarName)}`,
    `X-WR-TIMEZONE:${options.timeZone}`,
    ...ordered.flatMap((event) => buildVevent(event, options, stamp)),
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

/** Comma-joined ids for a shareable `?plan=` link, in the order given. */
export function buildIcsPlanQuery(ids: string[]): string {
  return ids.join(",");
}

/**
 * Read the ids out of a `?plan=` search string, keeping only ids that exist in
 * `validIds` (so a stale link cannot inject unknown events) and de-duplicating them.
 */
export function parseIcsPlanIds(search: string, validIds: string[]): string[] {
  const raw = new URLSearchParams(search).get("plan");
  if (!raw) return [];
  const valid = new Set(validIds);
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const part of raw.split(",")) {
    const id = decodeURIComponent(part).trim();
    if (!id || !valid.has(id) || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}
