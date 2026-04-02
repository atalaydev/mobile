export interface SessionOption {
  id: string;
  slug: string;
  title: string;
  banner: string;
  duration: number;
  location: number;
  country: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
}
