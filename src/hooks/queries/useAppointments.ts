import { getAppointments } from "@/api/appointments";
import { keys } from "@/api/keys";
import { Options } from "@/api/types";
import { Appointment } from "@/types/appointment";
import { useQuery } from "@tanstack/react-query";

interface useAppointmentsOptions {
  query?: Options;
  enabled?: boolean;
}

export function useAppointments(options?: useAppointmentsOptions) {
  return useQuery<Appointment[]>({
    queryKey: keys.appointments.list(options?.query),
    queryFn: async () => {
      const response = await getAppointments(options?.query);

      return response.results;
    },
    retry: false,
    enabled: options?.enabled ?? true,
  });
}
