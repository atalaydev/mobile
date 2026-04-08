import type { Expert } from "./expert";

export interface Event {
  id: string;
  title: string;
  banner: string;
  description?: string;
  summary?: string;
  type: string;
  location?: string;
  next_session_date?: string;
  expert: string | Expert;
}