import { Text } from "@/components/Text";
import { Calendar } from "@/components/Calendar";
import { useAuth } from "@/contexts/AuthContext";
import { useHeader } from "@/contexts/HeaderContext";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export default function AgendaScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { setBackgroundColor } = useHeader();
  const name = session?.user?.user_metadata?.full_name as string | undefined;
  const [selectedDate, setSelectedDate] = useState(() => new Date());
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
          <Text style={name ? styles.greetingText : styles.nameText}>{t("agenda.greeting")}</Text>
          {name && <Text style={styles.nameText} numberOfLines={1} adjustsFontSizeToFit>{t("agenda.name", { name })}</Text>}
        </View>
        <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
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
