import { Text } from "@/components/Text";
import { colors } from "@/constants/colors";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export type Activity = {
  title: string;
  imageUrl: string;
  locationType: string;
  location: string;
  startDate: Date;
  startTime: string;
  endTime: string;
  host: { name: string; subtitle: string | null; avatarUrl: string };
};

function useCountdown(targetDate: Date) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = targetDate.getTime() - now;
  if (!Number.isFinite(remaining) || remaining <= 0) return { label: null, long: null, remainingMs: remaining };

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  if (days > 0) {
    const long = `${days} gün${hours > 0 ? ` ${hours} saat` : ""}`;
    return { label: `${days}g ${hours}sa`, long, remainingMs: remaining };
  }
  if (hours > 0) {
    const long = `${hours} saat${minutes > 0 ? ` ${minutes} dakika` : ""}`;
    return { label: `${hours}sa ${minutes}dk`, long, remainingMs: remaining };
  }
  const long = `${minutes} dakika ${seconds} saniye`;
  return { label: `${minutes}dk ${seconds}sn`, long, remainingMs: remaining };
}

type UpcomingActivityCardProps = {
  activity: Activity;
  variant: "event" | "appointment";
  onJoin?: () => void;
};

export function UpcomingActivityCard({ activity, variant, onJoin }: UpcomingActivityCardProps) {
  const { t } = useTranslation();
  const { label: countdown, long: countdownLong, remainingMs } = useCountdown(activity.startDate);
  const isNear = remainingMs <= 10 * 60 * 1000;

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: activity.imageUrl }} style={styles.image} contentFit="cover" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{variant === "event" ? "Etkinlik" : "Seans"}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{activity.title}</Text>

        <View style={styles.infoRow}>
          <SymbolView name="mappin.and.ellipse" size={16} tintColor={colors.textSecondary} />
          <Text style={styles.infoText}>
            {activity.locationType}{activity.location ? ` | ${activity.location}` : ""}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <SymbolView name="calendar" size={16} tintColor={colors.textSecondary} />
          <Text style={styles.infoText}>
            {activity.startTime} - {activity.endTime}
          </Text>
        </View>

        <View style={styles.hostRow}>
          <Image
            source={{ uri: activity.host.avatarUrl }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.hostLabel}>{activity.host.subtitle ?? t("agenda.expert")}</Text>
            <Text style={styles.hostName}>{activity.host.name}</Text>
          </View>
        </View>

        <Pressable style={[styles.button, !isNear && styles.buttonDisabled]} onPress={onJoin} disabled={!isNear}>
          <Text style={styles.buttonText}>
            {isNear ? "Katıl" : `${countdownLong} sonra başlıyor..`}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F1F4EC",
    borderRadius: 20,
    overflow: "hidden",
  },
  imageContainer: {
    height: 180,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#F5A623",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#fff",
  },
  body: {
    padding: 16,
    gap: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#1832281A",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#212529",
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.textSecondary,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  hostLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textSecondary,
  },
  hostName: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#183228",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#D3E194",
  },
  button: {
    backgroundColor: "#336B57",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: "#336B57",
    opacity: 0.4,
  },
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#fff",
  },
  buttonTextDisabled: {
    color: "#fff",
  },
});
