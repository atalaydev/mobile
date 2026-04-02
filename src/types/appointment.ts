import type { Expert } from "./expert";
import type { SessionOption } from "./sessionOption";

export interface Appointment {
  id: string;
  expert_id: string;
  session_option_id: string;
  start_date: string | null;
  end_date: string | null;

  /** Populated via prefetch using expert_id. */
  expert?: string | Expert;

  /** Populated via prefetch using session_option_id. */
  session_option?: SessionOption;
}
