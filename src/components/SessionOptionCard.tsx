import { Pill } from "@/components/Pill";
import { Text } from "@/components/Text";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { ColorMatrix, saturate } from "react-native-color-matrix-image-filters";
import { Pressable, StyleSheet, View } from "react-native";

type SessionOptionCardProps = {
  title: string;
  imageUrl: string;
  locationType: string;
  sessionCount?: number;
  duration?: number;
  date: string;
  expert: {
    name: string;
    subtitle: string;
    avatarUrl: string;
  };
  currentSession?: number;
  unplannedCount?: number;
  hasUnplanned?: boolean;
  isPast?: boolean;
  onDetails?: () => void;
};

export function SessionOptionCard({ title, imageUrl, locationType, sessionCount, duration, currentSession, unplannedCount, hasUnplanned, date, expert, isPast, onDetails }: SessionOptionCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
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
              <Text style={styles.sessionBadgeText}>{t("session.current", { current: currentSession })}</Text>
            </View>
          )}
        </View>

        <View style={styles.chipRow}>
          <Pill label={locationType} />
          {duration != null && (
            <Pill label={t("session.duration", { count: duration })} />
          )}
          {sessionCount != null && (
            <Pill label={t("session.count", { count: sessionCount })} />
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
          {hasUnplanned ? (
            <>
              <SymbolView name="calendar.badge.exclamationmark" size={18} tintColor="#183228" style={{ marginTop: 1 }} />
              <Text style={[styles.dateText, { marginLeft: 6 }]}>{t("session.unplannedBadge", { count: unplannedCount })}</Text>
            </>
          ) : (
            <Text style={styles.dateText}>{date}</Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.joinButton} onPress={onDetails}>
          <Text style={styles.joinButtonText}>{t("library.viewDetails")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F1F4EC",
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
  unplannedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#EBF1EF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unplannedBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#336B57",
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
    borderColor: "#7AA394",
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
    backgroundColor: "#1B4332",
    padding: 12,
    gap: 10,
  },
  dateRow: {
    backgroundColor: "#7AA394",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    color: "#1B4332",
  },
});
