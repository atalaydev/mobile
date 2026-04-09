import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useVideoPlayer, VideoView } from "expo-video";
import { Pressable, StyleSheet, View } from "react-native";

export default function WatchScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const router = useRouter();

  const player = useVideoPlayer(uri, (p) => {
    p.play();
  });

  return (
    <View style={styles.container}>
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <SymbolView name="xmark" size={16} tintColor="#fff" />
      </Pressable>
      <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture />
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
