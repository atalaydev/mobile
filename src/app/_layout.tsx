import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Slot, useRouter, useSegments, type Href } from "expo-router";
import { useEffect, useRef } from "react";

function AuthGate() {
  const { isLoggedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const redirectTo = useRef<Href | null>(null);

  useEffect(() => {
    const inAuthenticated = segments[0] === "(app)";

    if (!isLoggedIn && inAuthenticated) {
      redirectTo.current = ("/" + segments.join("/")) as Href;
      router.replace("/login");
    } else if (isLoggedIn && !inAuthenticated) {
      const target: Href = redirectTo.current ?? "/";
      redirectTo.current = null;
      router.replace(target);
    }
  }, [isLoggedIn, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
