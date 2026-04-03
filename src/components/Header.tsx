import { useHeader } from "@/contexts/HeaderContext";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolateColor } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

const VARIANTS = {
  primary: { bg: "#336B57", shadow: false },
  light: { bg: "#F1F4EC", shadow: true },
};

export function Header() {
  const { variant } = useHeader();
  const router = useRouter();
  const v = VARIANTS[variant];

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(variant === "primary" ? 0 : 1, { duration: 200 });
  }, [variant]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [VARIANTS.primary.bg, VARIANTS.light.bg]
    ),
  }));

  return (
    <AnimatedSafeAreaView edges={["top"]} style={[styles.container, animatedStyle, v.shadow && styles.shadow]}>
      <View style={styles.row}>
        <Image
          source={require("@/assets/images/logo-icon.svg")}
          style={styles.logo}
          contentFit="contain"
        />
        <Pressable style={styles.notificationButton} onPress={() => router.push("/notifications")}>
          <SymbolView name="bell" size={20} tintColor="#336B57" />
        </Pressable>
      </View>
    </AnimatedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 10,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  logo: {
    width: 64,
    height: 64,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FCFCFC",
    alignItems: "center",
    justifyContent: "center",
  },
});
