import A from "axios";
import { supabase } from "./supabase";

export const axios = A.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

axios.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});