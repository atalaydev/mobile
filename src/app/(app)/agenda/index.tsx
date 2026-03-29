import { useHeader } from "@/contexts/HeaderContext";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

export default function AgendaScreen() {
  const { setBackgroundColor } = useHeader();
  const heightPercent = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      setBackgroundColor("#336B57");
      heightPercent.value = withTiming(60, { duration: 300 });
      return () => {
        setBackgroundColor(undefined);
        heightPercent.value = withTiming(0, { duration: 200 });
      };
    }, [setBackgroundColor])
  );

  const greenStyle = useAnimatedStyle(() => ({
    height: `${heightPercent.value}%`,
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.greenBackground, greenStyle]}>
        <Image
          source={require("@/assets/images/clover.svg")}
          style={styles.clover}
          contentFit="contain"
        />
      </Animated.View>
      <View style={styles.content}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Merhaba</Text>
          <Text style={styles.nameText} numberOfLines={1} adjustsFontSizeToFit>Ömer Atalay</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  greenBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 0,
    backgroundColor: "#336B57",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  clover: {
    position: "absolute",
    right: -20,
    width: 200,
    height: 200,
    opacity: 0.15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  greeting: {
    marginTop: 8,
  },
  greetingText: {
    fontSize: 18,
    color: "#EBF1EF",
  },
  nameText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
});
