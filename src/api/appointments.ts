import { getExperts } from "@/api/experts";
import { getSessionOptions } from "@/api/session-options";
import { Prefetcher } from "@/api/prefetch";
import { Options, Response } from "@/api/types";
import { axios } from "@/lib/axios";
import { ZoomCredentials } from "@/types/zoom";
import { Appointment } from "@/types/appointment";

const appointmentPrefetcher = Prefetcher<Appointment>({
  expert: {
    extractor: (object) => object.expert_id,
    resolver: async (ids) => {
      const { results } = await getExperts({ filters: { slug__in: ids.join(",") }, limit: ids.length });

      return Object.fromEntries(results.map((e) => [e.slug, e]));
    },
    target: "expert",
  },
  session_option: {
    extractor: (object) => object.session_option_id,
    resolver: async (ids) => {
      const { results } = await getSessionOptions({ filters: { id__in: ids.join(",") }, limit: ids.length });

      return Object.fromEntries(results.map((s) => [s.id, s]));
    },
    target: "session_option",
  },
});

export const getAppointments = async (options?: Options): Promise<Response<Appointment>> => {
  const { data } = await axios.get<Response<Appointment>>("/1/appointments/", {
    params: {
      ...options?.filters,
      page: options?.page ?? 1,
      limit: options?.limit ?? 10,
      sort: options?.sort ?? "-created_at",
    },
  });

  data.results = await appointmentPrefetcher(data.results, options?.prefetch);

  return data;
};

export const joinAppointment = async (id: string): Promise<ZoomCredentials> => {
  const { data } = await axios.get<ZoomCredentials>(`/1/appointments/${id}/join/`);
  return data;
};
