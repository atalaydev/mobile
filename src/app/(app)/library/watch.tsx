import { axios } from "@/lib/axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

export default function WatchScreen() {
  const { participationId, recordingId } = useLocalSearchParams<{ participationId: string; recordingId: string }>();
  const router = useRouter();
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<{ url: string }>(`/1/event-participations/${participationId}/watch/${recordingId}/`, { params: { hls: true } })
      .then((res) => setUri(res.data.url))
      .catch((err) => console.error("[Watch] error:", err));
  }, [participationId, recordingId]);

  const player = useVideoPlayer(uri, (p) => {
    p.play();
  });

  return (
    <View style={styles.container}>
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <SymbolView name="xmark" size={16} tintColor="#fff" />
      </Pressable>
      {!uri ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
});
