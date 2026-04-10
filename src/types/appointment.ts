import type { Expert } from "./expert";
import type { SessionOption } from "./sessionOption";
import type { Document } from "./eventParticipation";

export interface Appointment {
  id: string;
  expert_id: string;
  session_option_id: string;
  start_date: string | null;
  end_date: string | null;
  state: string;
  status: number;
  payment_id?: string;
  docs?: Document[];
  is_reviewed?: boolean;

  /** Populated via prefetch using expert_id. */
  expert?: string | Expert;

  /** Populated via prefetch using session_option_id. */
  session_option?: string | SessionOption;
}
