import { useHeader } from "@/contexts/HeaderContext";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolateColor } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

export function Header() {
  const { backgroundColor } = useHeader();
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(backgroundColor != null ? 1 : 0, { duration: 150 });
  }, [backgroundColor]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["transparent", "#336B57"]
    ),
  }));

  return (
    <AnimatedSafeAreaView edges={["top"]} style={[styles.container, animatedStyle]}>
      <View style={styles.row}>
        <Image
          source={require("@/assets/images/logo-icon.svg")}
          style={styles.logo}
          contentFit="contain"
        />
        <Pressable style={styles.notificationButton}>
          <SymbolView name="bell" size={20} tintColor="#336B57" />
        </Pressable>
      </View>
    </AnimatedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
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
