import { Text } from "@/components/Text";
import { colors } from "@/constants/colors";
import { useCountdown } from "@/hooks/useCountdown";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
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

type UpcomingActivityCardProps = {
  activity: Activity;
  variant: "event" | "appointment";
  onJoin?: () => void;
  onDetails?: () => void;
  loading?: boolean;
};

export function UpcomingActivityCard({ activity, variant, onJoin, onDetails, loading }: UpcomingActivityCardProps) {
  const { t } = useTranslation();
  const { label: countdown, long: countdownLong, remainingMs } = useCountdown(activity.startDate, t);
  const isNear = remainingMs <= 10 * 60 * 1000;

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.card}>
      <Pressable style={styles.imageContainer} onPress={onDetails}>
        <Image source={{ uri: activity.imageUrl }} style={styles.image} contentFit="cover" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{variant === "event" ? t("agenda.event") : t("agenda.appointment")}</Text>
        </View>
      </Pressable>

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

        {onJoin !== undefined && (
          <Pressable style={[styles.button, !isNear && styles.buttonDisabled]} onPress={onJoin} disabled={!isNear || loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isNear ? t("agenda.join") : t("agenda.startsIn", { time: countdownLong })}
              </Text>
            )}
          </Pressable>
        )}
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
    backgroundColor: "#F78F08",
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
    height: 48,
    alignItems: "center",
    justifyContent: "center",
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
