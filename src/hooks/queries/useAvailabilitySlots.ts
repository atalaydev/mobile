import { getAvailabilitySlots } from "@/api/session-options";
import { keys } from "@/api/keys";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useAvailabilitySlots(sessionOptionId: string, year: number, month: number) {
  const query = useQuery({
    queryKey: keys.sessionOption.availabilitySlots(sessionOptionId, year, month),
    queryFn: () => getAvailabilitySlots(sessionOptionId, year, month),
    enabled: !!sessionOptionId,
  });

  // Group UTC ISO strings into local date → local time strings
  // e.g. "2026-04-14T09:00:00Z" → { "2026-04-14": ["12:00", ...] }
  const availableDates = useMemo<Record<string, string[]>>(() => {
    if (!query.data) return {};
    const map: Record<string, string[]> = {};
    for (const iso of query.data) {
      const d = new Date(iso);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(timeStr);
    }
    return map;
  }, [query.data]);

  return { ...query, availableDates };
}
