import { keys } from "@/api/keys";
import { getPayment } from "@/api/payments";
import { useQuery } from "@tanstack/react-query";

export function usePayment(id: string) {
  return useQuery({
    queryKey: keys.payment.detail(id),
    queryFn: () => getPayment(id),
    enabled: !!id,
  });
}
