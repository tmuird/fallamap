// Single event dataset (T1.5). official_events.json is the source of truth for
// both the map hubs and the schedule page. Schedule events reference their venue
// hub via `hubId` (assigned only when the event's `location` names that hub's
// venue); hub → event lists are derived here. The old static `events` arrays on
// the hub entries matched no schedule id and were never read by any code.
import officialEvents from "@/components/official_events.json";

export interface EventHub {
  id: string;
  name: string;
  description: string;
  type: string;
  coordinates: {
    lng: number;
    lat: number;
  };
}

export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
  type: string;
  /** Key into the SchedulePage icon map — icons stay components, not data. */
  icon: string;
  color: string;
  isLive?: boolean;
  hubId?: string;
}

export interface ScheduleDay {
  id: string;
  day: string;
  subtitle: string;
  date: string;
  events: ScheduleEvent[];
}

export interface HubScheduleEvent {
  day: ScheduleDay;
  event: ScheduleEvent;
}

export const hubs: EventHub[] = officialEvents.hubs;
export const schedule: ScheduleDay[] = officialEvents.schedule;

/** All schedule events that take place at a hub, in programme order. */
export function eventsForHub(hubId: string): HubScheduleEvent[] {
  return schedule.flatMap((day) =>
    day.events
      .filter((event) => event.hubId === hubId)
      .map((event) => ({ day, event }))
  );
}
