import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AuthContextType = {
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  sendOtp: (phone: string, options?: { shouldCreateUser?: boolean }) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const userLang = session?.user?.user_metadata?.language;
      if (userLang) {
        const lang = userLang.startsWith("tr") ? "tr" : "en";
        if (i18n.language !== lang) i18n.changeLanguage(lang);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const sendOtp = async (phone: string, options?: { shouldCreateUser?: boolean }) => {
    const shouldCreate = options?.shouldCreateUser ?? false;
    const langCode = getLocales()[0]?.languageCode ?? "tr";
    const language = langCode === "tr" ? "tr-TR" : "en-US";
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: shouldCreate,
        ...(shouldCreate && { data: { language } }),
      },
    });
    if (error) throw error;
  };

  const verifyOtp = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoggedIn: session != null,
        isLoading,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
