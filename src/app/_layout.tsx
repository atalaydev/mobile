import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Slot, useRouter, useSegments, type Href } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { isLoggedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const redirectTo = useRef<Href | null>(null);
  const [ready, setReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (isLoading || !fontsLoaded) return;
    const inApp = segments[0] === "(app)";

    if (!isLoggedIn && inApp) {
      redirectTo.current = ("/" + segments.join("/")) as Href;
      router.replace("/login");
    } else if (isLoggedIn && !inApp) {
      const target: Href = redirectTo.current ?? "/";
      redirectTo.current = null;
      router.replace(target);
    }

    if (!ready) setReady(true);
  }, [isLoggedIn, isLoading, fontsLoaded, segments]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <Animated.View
      key={isLoggedIn ? "app" : "auth"}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.root}
    >
      <Slot />
    </Animated.View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
