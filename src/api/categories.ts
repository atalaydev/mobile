import { Options, Response } from "@/api/types";
import { axios } from "@/lib/axios";
import { Category } from "@/types/category";

export const getCategories = async (options?: Options): Promise<Response<Category>> => {
  const { data } = await axios.get<Response<Category>>("/1/categories/", {
    params: {
      ...options?.filters,
      page: options?.page ?? 1,
      limit: options?.limit ?? 10,
      sort: options?.sort ?? "-created_at",
    },
  });

  return data;
};
