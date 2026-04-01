type Options = Record<string, boolean>;

type Prefetch<T> = {
  [K in keyof T]: {
    extractor: (item: T) => string | string[];
    resolver: (ids: string[]) => Promise<Record<string, NonNullable<T[K]>>>;
    target: K;
    many?: boolean;
  };
}[keyof T];

type Config<T> = {
  [name: string]: Prefetch<T>;
};

export const Prefetcher = <T>(config: Config<T>) => {
  return async (items: T[], options?: Options): Promise<T[]> => {
    if (items.length === 0 || !options) return items;

    const active = Object.entries(config).filter(([key]) => options[key]);

    if (active.length === 0) return items;

    const maps = await Promise.all(
      active.map(async ([, config]) => {
        const ids = [
          ...new Set(
            items.flatMap((item) => {
              const value = config.extractor(item);
              return Array.isArray(value) ? value : [value];
            }).filter((id): id is string => typeof id === "string" && id.length > 0)
          ),
        ];

        if (ids.length === 0) return {};

        return config.resolver(ids);
      })
    );

    return items.map((item) => {
      const prefetched: Record<string, any> = {};

      active.forEach(([, config], i) => {
        const map = maps[i];
        const ids = config.extractor(item);

        if (config.many && Array.isArray(ids)) {
          prefetched[config.target as string] = ids.map((id) => map[id]).filter(Boolean);
        } else {
          const id = Array.isArray(ids) ? ids[0] : ids;
          prefetched[config.target as string] = map[id] ?? null;
        }
      });

      return { ...item, ...prefetched };
    });
  };
};
