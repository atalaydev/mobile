import { getEventParticipations } from "@/api/event-participations";
import { keys } from "@/api/keys";
import { Options } from "@/api/types";
import { EventParticipation } from "@/types/eventParticipation";
import { useQuery } from "@tanstack/react-query";

interface useEventParticipationsOptions {
  query?: Options;
  enabled?: boolean;
}

export function useEventParticipations(options?: useEventParticipationsOptions) {
  return useQuery<EventParticipation[]>({
    queryKey: keys.eventParticipations.list(options?.query),
    queryFn: async () => {
      const response = await getEventParticipations(options?.query);

      return response.results;
    },
    retry: false,
    enabled: options?.enabled ?? true,
  });
}

