import { Options, Response } from "@/api/types";
import { axios } from "@/lib/axios";
import { Expert } from "@/types/expert";

export const getExperts = async (options?: Options): Promise<Response<Expert>> => {
  const { data } = await axios.get<Response<Expert>>("/1/experts/", {
    params: {
      ...options?.filters,
      page: options?.page ?? 1,
      limit: options?.limit ?? 10,
      sort: options?.sort ?? "-created_at",
    },
  });

  return data;
};
