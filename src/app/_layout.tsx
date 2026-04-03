import { SplashOverlay } from "@/components/SplashOverlay";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import "@/i18n";
import { client } from "@/lib/client";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { isLoggedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [appReady, setAppReady] = useState(false);
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
    if (!isLoggedIn) return;
    Notifications.requestPermissionsAsync().then(async ({ status }) => {
      if (status !== "granted") return;
      try {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log("expo push token:", token.data);
      } catch (e) {
        console.warn("push token alınamadı:", e);
      }
    });
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoading || !fontsLoaded) return;
    const currentSegments = segments;
    const inApp = currentSegments[0] === "(app)";

    if (!isLoggedIn && inApp) {
      router.replace("/login");
    } else if (isLoggedIn && !inApp) {
      router.replace("/");
    }

    if (!appReady) {
      setTimeout(() => setAppReady(true), 500);
    }
  }, [isLoggedIn, isLoading, fontsLoaded]);

  return (
    <>
      <View style={styles.root}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(app)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="support" />
          <Stack.Screen name="notifications" options={{ presentation: "formSheet", headerShown: true, headerTitle: "Bildirimler" }} />
          <Stack.Screen name="zoom" options={{ presentation: "fullScreenModal", headerShown: false }} />
        </Stack>
      </View>
      {!appReady && <SplashOverlay />}
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
