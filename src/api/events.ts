import { Options, Response } from "@/api/types";
import { axios } from "@/lib/axios";
import { Event } from "@/types/event";

export const getEvents = async (options?: Options): Promise<Response<Event>> => {
    const { data } = await axios.get("/1/events/", {
        params: {
            ...options?.filters,
            page: options?.page ?? 1,
            limit: options?.limit ?? 10,
            sort: options?.sort ?? "-created_at",
        },
    });

    return data;
};
