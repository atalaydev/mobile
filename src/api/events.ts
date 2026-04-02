import { getExperts } from "@/api/experts";
import { Prefetcher } from "@/api/prefetch";
import { Options, Response } from "@/api/types";
import { axios } from "@/lib/axios";
import { Event } from "@/types/event";

const eventPrefetcher = Prefetcher<Event>({
  expert: {
    extractor: (object) => object.expert,
    resolver: async (slugs) => {
      const { results } = await getExperts({ filters: { slug__in: slugs.join(",") }, limit: slugs.length });

      return Object.fromEntries(results.map((e) => [e.slug, e]));
    },
    target: "expert",
  },
});

export const getEvents = async (options?: Options): Promise<Response<Event>> => {
  const { data } = await axios.get<Response<Event>>("/1/events/", {
    params: {
      ...options?.filters,
      page: options?.page ?? 1,
      limit: options?.limit ?? 10,
      sort: options?.sort ?? "-created_at",
    },
  });

  data.results = await eventPrefetcher(data.results, options?.prefetch);

  return data;
};
