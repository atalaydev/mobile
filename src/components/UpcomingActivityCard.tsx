import { Text } from "@/components/Text";
import { colors } from "@/constants/colors";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export type Activity = {
  title: string;
  imageUrl: string;
  locationType: string;
  location: string;
  startDate: Date;
  startTime: string;
  endTime: string;
  host: { name: string; avatarUrl: string };
};

function useCountdown(targetDate: Date) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = targetDate.getTime() - now;
  if (remaining <= 0) return null;

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}sa ${minutes}dk`;
  }
  return `${minutes}dk ${seconds}sn`;
}

type UpcomingActivityCardProps = {
  activity: Activity;
  onJoin?: () => void;
};

export function UpcomingActivityCard({ activity, onJoin }: UpcomingActivityCardProps) {
  const countdown = useCountdown(activity.startDate);

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: activity.imageUrl }} style={styles.image} contentFit="cover" />
        {countdown && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{countdown}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{activity.title}</Text>

        <View style={styles.infoRow}>
          <SymbolView name="mappin.and.ellipse" size={16} tintColor={colors.textSecondary} />
          <Text style={styles.infoText}>
            {activity.locationType} | {activity.location}
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
            <Text style={styles.hostLabel}>Eğitmen</Text>
            <Text style={styles.hostName}>{activity.host.name}</Text>
          </View>
        </View>

        <Pressable style={styles.button} onPress={onJoin}>
          <Text style={styles.buttonText}>Etkinliğe Katıl</Text>
        </Pressable>
      </View>
    </View>
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
    left: 12,
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
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#fff",
  },
});
