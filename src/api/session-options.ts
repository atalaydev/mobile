import { Options, Response } from "@/api/types";
import { axios } from "@/lib/axios";
import { SessionOption } from "@/types/sessionOption";

export const getSessionOptions = async (options?: Options): Promise<Response<SessionOption>> => {
  const { data } = await axios.get<Response<SessionOption>>("/1/expert-session-options/", {
    params: {
      ...options?.filters,
      page: options?.page ?? 1,
      limit: options?.limit ?? 10,
      sort: options?.sort ?? "-created_at",
    },
  });

  return data;
};
