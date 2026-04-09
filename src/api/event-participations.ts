import { getEvents } from "@/api/events";
import { Prefetcher } from "@/api/prefetch";
import { Options, Response } from "@/api/types";
import { axios } from "@/lib/axios";
import { EventParticipation } from "@/types/eventParticipation";
import { ZoomCredentials } from "@/types/zoom";

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

export const joinEventParticipation = async (id: string): Promise<ZoomCredentials> => {
  const { data } = await axios.get<ZoomCredentials>(`/1/event-participations/${id}/join/`);
  return data;
};

export const getDocumentUrl = async (participationId: string, key: string, hls?: boolean): Promise<string> => {
  const { data } = await axios.get<{ url: string }>(`/1/event-participations/${participationId}/document/${key}/`, { params: hls ? { hls: true } : undefined });
  return data.url;
};

export const getRecordingUrl = async (participationId: string, recordingId: string): Promise<string> => {
  const { data } = await axios.get<{ url: string }>(`/1/event-participations/${participationId}/watch/${recordingId}/`, { params: { hls: true } });
  return data.url;
};
