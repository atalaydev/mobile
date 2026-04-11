import { getExperts } from "@/api/experts";
import { Prefetcher } from "@/api/prefetch";
import { Options, Response } from "@/api/types";
import { axios } from "@/lib/axios";
import { SessionOption } from "@/types/sessionOption";

const sessionOptionPrefetcher = Prefetcher<SessionOption>({
  expert: {
    extractor: (object) => object.expert_id,
    resolver: async (slugs) => {
      const { results } = await getExperts({ filters: { slug__in: slugs.join(",") }, limit: slugs.length });
      return Object.fromEntries(results.map((e) => [e.slug, e]));
    },
    target: "expert",
  },
});

export const getSessionOption = async (id: string): Promise<SessionOption> => {
  const { data } = await axios.get<SessionOption>(`/1/expert-session-options/${id}/`);
  const expertSlug = typeof data.expert === "string" ? data.expert : data.expert_id;
  if (expertSlug) {
    const { results } = await getExperts({ filters: { slug__in: expertSlug }, limit: 1 });
    if (results.length > 0) data.expert = results[0];
  }
  return data;
};

export const getAvailabilitySlots = async (sessionOptionId: string, year: number, month: number): Promise<string[]> => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  const { data } = await axios.get<string[]>(`/1/expert-session-options/${sessionOptionId}/availability-slots/`, {
    params: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  });
  return data;
};

export const getSessionOptions = async (options?: Options): Promise<Response<SessionOption>> => {
  const { data } = await axios.get<Response<SessionOption>>("/1/expert-session-options/", {
    params: {
      ...options?.filters,
      page: options?.page ?? 1,
      limit: options?.limit ?? 10,
      sort: options?.sort ?? "-created_at",
    },
  });

  data.results = await sessionOptionPrefetcher(data.results, options?.prefetch);

  return data;
};
