import { getEvents } from "@/api/events";
import { getSessionOptions } from "@/api/session-options";
import { Prefetcher } from "@/api/prefetch";
import { Options, Response } from "@/api/types";
import { axios } from "@/lib/axios";
import { LibraryItem } from "@/types/library";

const libraryPrefetcher = Prefetcher<LibraryItem>({
  event: {
    extractor: (object) => object.object_type === "EVENT_PARTICIPATION" ? object.object_id : "",
    resolver: async (ids) => {
      const { results } = await getEvents({ filters: { id__in: ids.join(",") }, limit: ids.length, prefetch: { expert: true } });
      return Object.fromEntries(results.map((e) => [e.id, e]));
    },
    target: "event",
  },
  session_option: {
    extractor: (object) => object.object_type === "SESSION_APPOINTMENT" ? object.object_id : "",
    resolver: async (ids) => {
      const { results } = await getSessionOptions({ filters: { id__in: ids.join(",") }, limit: ids.length, prefetch: { expert: true } });
      return Object.fromEntries(results.map((s) => [s.id, s]));
    },
    target: "session_option",
  },
});

export const getLibrary = async (options?: Options): Promise<Response<LibraryItem>> => {
  const { data } = await axios.get<Response<LibraryItem>>("/1/library/", {
    params: {
      ...options?.filters,
      page: options?.page ?? 1,
      limit: options?.limit ?? 10,
      sort: options?.sort ?? "next_session",
    },
  });

  data.results = await libraryPrefetcher(data.results, options?.prefetch);

  return data;
};
