export interface Options {
  filters?: Record<string, string | number | boolean>;
  page?: number;
  limit?: number;
  sort?: string | null;
  prefetch?: {
    [key: string]: boolean;
  };
}

export interface Response<T> {
  count: number;
  next: boolean;
  results: T[];
}