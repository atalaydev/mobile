import { getEvent } from "@/api/events";
import { getExperts } from "@/api/experts";
import { Event } from "@/types/event";
import { useQuery } from "@tanstack/react-query";

export function useEvent(id: string) {
  return useQuery<Event>({
    queryKey: ["event", id],
    queryFn: async () => {
      const event = await getEvent(id);

      if (typeof event.expert === "string" && event.expert) {
        const { results } = await getExperts({ filters: { slug__in: event.expert }, limit: 1 });
        if (results.length > 0) {
          event.expert = results[0];
        }
      }

      return event;
    },
    retry: false,
    enabled: !!id,
  });
}
