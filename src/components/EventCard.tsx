import { Pill } from "@/components/Pill";
import { Text } from "@/components/Text";
import { Image } from "expo-image";
import { ColorMatrix, saturate } from "react-native-color-matrix-image-filters";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";

type EventCardProps = {
  title: string;
  imageUrl: string;
  locationType: string;
  sessionCount?: number;
  date: string;
  expert: {
    name: string;
    subtitle: string;
    avatarUrl: string;
  };
  currentSession?: number;
  isPast?: boolean;
  onDetails?: () => void;
};

export function EventCard({ title, imageUrl, locationType, sessionCount, currentSession, date, expert, isPast, onDetails }: EventCardProps) {
  const { t } = useTranslation();

  return (
    <Pressable style={styles.card} onPress={onDetails}>
      <View style={styles.body}>
        <View>
          <ColorMatrix matrix={saturate(isPast ? 0 : 1)}>
            <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
          </ColorMatrix>
          {isPast && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>{t("library.completed")}</Text>
            </View>
          )}
          {!isPast && currentSession != null && (
            <View style={styles.sessionBadge}>
              <Text style={styles.sessionBadgeText}>{t("event.currentSession", { current: currentSession })}</Text>
            </View>
          )}
        </View>

        <View style={styles.chipRow}>
          <Pill label={locationType} />
          {sessionCount != null && (
            <Pill label={t("event.sessionCount", { count: sessionCount })} />
          )}
        </View>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.expertRow}>
          <Image source={{ uri: expert.avatarUrl }} style={styles.avatar} />
          <View>
            <Text style={styles.expertSubtitle}>{expert.subtitle}</Text>
            <Text style={styles.expertName}>{expert.name}</Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{date}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.joinButton}>
          <Text style={styles.joinButtonText}>{t("library.viewDetails")}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FBFCF4",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8EBEA",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 14,
  },
  completedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#EBF1EF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  completedBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#336B57",
  },
  sessionBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#F78F08",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sessionBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#fff",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#183228",
    lineHeight: 24,
  },
  expertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#D3E194",
  },
  expertSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#5E5F5E",
  },
  expertName: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#183228",
  },
  body: {
    padding: 16,
    paddingBottom: 0,
    gap: 12,
  },
  footer: {
    backgroundColor: "#336B57",
    padding: 12,
    gap: 10,
  },
  dateRow: {
    backgroundColor: "#D3E194",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 10,
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
  },
  dateText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#183228",
  },
  joinButton: {
    backgroundColor: "#F1F6DE",
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: "center",
  },
  joinButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#336B57",
  },
});
