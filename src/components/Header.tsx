import { useHeader } from "@/contexts/HeaderContext";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, AppState, Linking, Pressable, StyleSheet, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

const VARIANTS = {
  primary: { bg: "#336B57", shadow: false },
  light: { bg: "#F1F4EC", shadow: true },
};

export function Header() {
  const { variant } = useHeader();
  const router = useRouter();
  const { t } = useTranslation();
  const v = VARIANTS[variant];
  const [notifGranted, setNotifGranted] = useState(true);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(variant === "primary" ? 0 : 1, { duration: 200 });
  }, [variant]);

  const wasGranted = useRef(notifGranted);

  useEffect(() => {
    const check = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      const granted = status === "granted";
      
      setNotifGranted(granted);

      if (granted && !wasGranted.current) {
        try {
          const token = await Notifications.getExpoPushTokenAsync();

          await supabase.auth.updateUser({ data: { nid: token.data } });
        } catch (e) {
          console.warn("couldn't handle push token:", e);
        }
      }

      wasGranted.current = granted;
    };

    check();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });

    return () => sub.remove();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [VARIANTS.primary.bg, VARIANTS.light.bg]
    ),
  }));

  return (
    <AnimatedSafeAreaView edges={["top"]} style={[styles.container, animatedStyle, v.shadow && styles.shadow, v.shadow && styles.border]}>
      <View style={styles.row}>
        <Image
          source={require("@/assets/images/logo-icon.svg")}
          style={styles.logo}
          contentFit="contain"
        />
        <Pressable
          style={styles.notificationButton}
          onPress={() => {
            if (!notifGranted) {
              Alert.alert(
                t("notifications.disabledTitle"),
                t("notifications.disabledMessage"),
                [
                  { text: t("notifications.cancel"), style: "cancel" },
                  { text: t("notifications.settings"), onPress: () => Linking.openSettings() },
                ],
              );
              return;
            }
            router.push("/notifications");
          }}
        >
          <SymbolView name="bell" size={20} tintColor="#336B57" />
          {!notifGranted && <View style={styles.notifDot} />}
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E4D9",
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
  notifDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E53935",
  },
});
