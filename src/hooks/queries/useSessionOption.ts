import { getSessionOption } from "@/api/session-options";
import { keys } from "@/api/keys";
import { SessionOption } from "@/types/sessionOption";
import { useQuery } from "@tanstack/react-query";

export function useSessionOption(id: string) {
  return useQuery<SessionOption>({
    queryKey: keys.sessionOption.detail(id),
    queryFn: () => getSessionOption(id),
    retry: false,
    enabled: !!id,
  });
}
