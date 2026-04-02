import type { Event } from "./event";

export interface EventParticipation {
  id: string;
  event_id: string;
  start_date: string;
  end_date: string;

  /** Populated via prefetch using event_id. Only available when prefetch.event is enabled. */
  event?: Event;
}
