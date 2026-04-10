import type { Expert } from "./expert";

export interface SessionOption {
  id: string;
  expert_id: string;
  slug: string;
  title: string;
  banner: string;
  description?: string;
  duration: number;
  location: number;
  country: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  expert?: Expert;
}
