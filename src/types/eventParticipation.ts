import type { Event } from "./event";

export interface Document {
  name: string;
  key: string;
  type: "document" | "video";
}

export interface EventParticipation {
  id: string;
  event_id: string;
  start_date: string;
  end_date: string;
  state: string;
  recording_available_until?: string;
  recordings_watchable?: boolean;
  recordings_access_duration?: number;
  location_type?: string;
  recordings?: string[];
  event_session_title?: string;
  docs?: Document[];
  session_docs?: Document[];

  /** Populated via prefetch using event_id. Only available when prefetch.event is enabled. */
  event?: Event;
}
