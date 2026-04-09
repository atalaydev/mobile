import { getCategories } from "@/api/categories";
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
  categories: {
    extractor: (object) => object.categories as string[],
    resolver: async (ids) => {
      const { results } = await getCategories({ filters: { id__in: ids.join(",") }, limit: ids.length });

      return Object.fromEntries(results.map((c) => [c.id, c]));
    },
    target: "categories",
    many: true,
  },
});

export const getEvent = async (id: string): Promise<Event> => {
  const { data } = await axios.get<Event>(`/1/events/${id}/`);
  return data;
};

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
