import { axios } from "@/lib/axios";

export interface Payment {
  id: string;
  invoice_url?: string;
}

export const getPayment = async (id: string): Promise<Payment> => {
  const { data } = await axios.get<Payment>(`/1/payments/${id}/`);
  return data;
};
