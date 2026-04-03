import { Text } from "@/components/Text";
import { useZoom, ZoomSDKProvider } from "@zoom/meetingsdk-react-native";
import { useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ZoomState = "permissions" | "initializing" | "joining" | "error";

function ZoomMeeting() {
  const { id, password, userName } = useLocalSearchParams<{ id: string; password: string; userName: string }>();
  const zoom = useZoom();
  const router = useRouter();
  const [, requestCamera] = useCameraPermissions();
  const [, requestMic] = useMicrophonePermissions();
  const [state, setState] = useState<ZoomState>("permissions");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const start = async () => {
      // 1. Permissions
      setState("permissions");
      const cam = await requestCamera();
      const mic = await requestMic();

      if (!cam?.granted || !mic?.granted) {
        setError("Kamera ve mikrofon izni gereklidir.");
        setState("error");
        return;
      }

      // 2. Wait for SDK init
      setState("initializing");
      for (let i = 0; i < 20; i++) {
        const ready = await zoom.isInitialized();
        if (ready) break;
        await new Promise((r) => setTimeout(r, 500));
      }

      // 3. Join
      setState("joining");
      try {
        await zoom.joinMeeting({
          meetingNumber: String(id),
          password: String(password),
          userName: userName
        });
      } catch (e: any) {
        setError(e?.message ?? "Toplantıya katılınamadı.");
        setState("error");
        return;
      }

      router.back();
    };

    start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <SymbolView name="xmark" size={16} tintColor="#fff" />
      </Pressable>

      <View style={styles.center}>
        {state === "error" ? (
          <>
            <SymbolView name="exclamationmark.triangle" size={40} tintColor="#DC3545" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => router.back()}>
              <Text style={styles.retryText}>Geri Dön</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color="#D3E194" />
            <Text style={styles.statusText}>
              {state === "permissions" && "İzinler kontrol ediliyor..."}
              {state === "initializing" && "Hazırlanıyor..."}
              {state === "joining" && "Bağlanılıyor..."}
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function ZoomScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();

  return (
    <ZoomSDKProvider
      config={{
        jwtToken: token,
        domain: "zoom.us",
        enableLog: false,
      }}
    >
      <ZoomMeeting />
    </ZoomSDKProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#183228",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 40,
  },
  statusText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#D3E194",
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#DC3545",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  retryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#fff",
  },
});
