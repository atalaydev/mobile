import { getEvents } from "@/api/events";
import { Prefetcher } from "@/api/prefetch";
import { Options, Response } from "@/api/types";
import { axios } from "@/lib/axios";
import { EventParticipation } from "@/types/eventParticipation";

const eventParticipationPrefetcher = Prefetcher<EventParticipation>({
  event: {
    extractor: (object) => object.event_id,
    resolver: async (ids) => {
      const { results } = await getEvents({ filters: { id__in: ids.join(",") }, limit: ids.length, prefetch: { expert: true } });

      return Object.fromEntries(results.map((e) => [e.id, e]));
    },
    target: "event",
  },
});

export const getEventParticipations = async (options?: Options): Promise<Response<EventParticipation>> => {
  const { data } = await axios.get<Response<EventParticipation>>("/1/event-participations/", {
    params: {
      ...options?.filters,
      page: options?.page ?? 1,
      limit: options?.limit ?? 10,
      sort: options?.sort ?? "-created_at",
    },
  });

  data.results = await eventParticipationPrefetcher(data.results, options?.prefetch);

  return data;
};
