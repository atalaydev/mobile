import type { Event } from "./event";
import type { SessionOption } from "./sessionOption";

export interface LibraryItem {
  id: string;
  object_type: "EVENT_PARTICIPATION" | "SESSION_APPOINTMENT";
  object_id: string;
  expert_id: string;
  title: string;
  first_session_date: string;
  last_session_date: string;
  next_session_date: string | null;
  planned_session_count: number;
  completed_session_count: number;
  upcoming_session_count: number;
  unplanned_session_count: number;
  event?: Event;
  session_option?: SessionOption;
}
