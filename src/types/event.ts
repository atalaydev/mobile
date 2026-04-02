import type { Expert } from "./expert";

export interface Event {
  id: string;
  title: string;
  banner: string;
  type: string;
  location?: string;
  expert: string | Expert;
}