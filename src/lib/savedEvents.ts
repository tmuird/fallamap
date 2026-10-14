export function readSavedEventIds(
  serialized: string | null,
  validEventIds: readonly string[]
): string[] {
  if (!serialized) return [];

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];
    const allowed = new Set(validEventIds);
    return [...new Set(parsed.filter((value): value is string => typeof value === "string" && allowed.has(value)))];
  } catch {
    return [];
  }
}

export function toggleSavedEventId(savedIds: readonly string[], eventId: string): string[] {
  if (!eventId) return [...new Set(savedIds)];
  const uniqueIds = [...new Set(savedIds)];
  return uniqueIds.includes(eventId)
    ? uniqueIds.filter((savedId) => savedId !== eventId)
    : [...uniqueIds, eventId];
}

export function buildSavedEventGroups<
  TEvent extends { id: string },
  TDay extends { events: TEvent[] },
>(days: readonly TDay[], savedIds: readonly string[]): Array<Omit<TDay, "events"> & { events: TEvent[] }> {
  const saved = new Set(savedIds);
  return days
    .map((day) => ({ ...day, events: day.events.filter((event) => saved.has(event.id)) }))
    .filter((day) => day.events.length > 0);
}

export interface SavedEventStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function getSavedEventItemStorageKey(eventSlug: string, eventId: string): string {
  return `${getSavedEventStorageKey(eventSlug)}:item:${encodeURIComponent(eventId)}`;
}

export function readSavedEventIdsFromStorage(
  storage: Pick<SavedEventStorage, "getItem">,
  eventSlug: string,
  validEventIds: readonly string[]
): string[] {
  return validEventIds.filter((eventId) => storage.getItem(getSavedEventItemStorageKey(eventSlug, eventId)) === "1");
}

export function toggleSavedEventInStorage(
  storage: SavedEventStorage,
  eventSlug: string,
  validEventIds: readonly string[],
  eventId: string
): { saved: boolean; savedIds: string[] } {
  if (!validEventIds.includes(eventId)) {
    return { saved: false, savedIds: readSavedEventIdsFromStorage(storage, eventSlug, validEventIds) };
  }

  const key = getSavedEventItemStorageKey(eventSlug, eventId);
  const wasSaved = storage.getItem(key) === "1";
  if (wasSaved) storage.removeItem(key);
  else storage.setItem(key, "1");

  return {
    saved: !wasSaved,
    savedIds: readSavedEventIdsFromStorage(storage, eventSlug, validEventIds),
  };
}

export function getSavedEventStorageKey(eventSlug: string): string {
  return `eventsocial:${eventSlug}:saved-event-ids`;
}
