import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";

export function SplashOverlay() {
  return (
    <Animated.View style={styles.root} exiting={FadeOut.duration(400)}>
      <Image
        source={require("@/assets/images/splash.png")}
        style={styles.image}
        contentFit="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  image: {
    flex: 1,
  },
});
