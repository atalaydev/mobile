import { Text } from "@/components/Text";
import { colors } from "@/constants/colors";
import { useEvent } from "@/hooks/queries/useEvent";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EventDetailScreen() {
  const { id, paymentId } = useLocalSearchParams<{ id: string; paymentId: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const { data: event, isLoading } = useEvent(id);

  const expert = event && typeof event.expert === "object" ? event.expert : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.handle}>
        <View style={styles.handleBar} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          {event?.banner && (
            <Image source={{ uri: event.banner }} style={styles.banner} contentFit="cover" />
          )}

          <View style={styles.topSection}>
            <Text style={styles.title}>{event?.title}</Text>

            {event?.summary && (
              <Pressable style={styles.detailsToggle} onPress={() => setDetailsExpanded((v) => !v)}>
                <Text style={styles.detailsToggleText}>{t("library.details")}</Text>
                <SymbolView name={detailsExpanded ? "chevron.up" : "chevron.down"} size={14} tintColor={colors.primary} />
              </Pressable>
            )}

            {detailsExpanded && (
              <View style={styles.accordionContent}>
                {event?.summary && (
                  <Text style={styles.description}>{event.summary}</Text>
                )}

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}><SymbolView name="square.grid.2x2" size={20} tintColor={colors.primary} /></View>
                  <View style={styles.chipList}>
                    <View style={styles.infoChip}>
                      <Text style={styles.infoChipText}>Yoga</Text>
                    </View>
                    <Text style={styles.infoDivider}>|</Text>
                    <Text style={styles.infoMuted}>Power Yoga</Text>
                    <Text style={styles.infoDivider}>|</Text>
                    <Text style={styles.infoMuted}>Başlangıç Seviyesi</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}><SymbolView name="mappin.circle" size={20} tintColor={colors.primary} /></View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>Fiziksel Etkinlik</Text>
                    <Text style={styles.infoValue}>Lorem Ipsum Sokak, Lorem Caddesi No:24 IST/Beykoz</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}><SymbolView name="person.2" size={20} tintColor={colors.primary} /></View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>Kontenjan</Text>
                    <Text style={styles.infoValue}>20</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}><SymbolView name="calendar" size={20} tintColor={colors.primary} /></View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>Etkinlik Tarihi</Text>
                    <Text style={styles.infoValue}>27 Kasım - 27 Aralık</Text>
                  </View>
                </View>
              </View>
            )}

            {expert && (
              <View style={styles.rateCard}>
                <View style={styles.expertRow}>
                  <View>
                    <Text style={styles.expertSubtitle}>{expert.subtitle || t("agenda.expert")}</Text>
                    <Text style={styles.expertName}>{expert.title}</Text>
                  </View>
                  <Image source={{ uri: expert.photo }} style={styles.expertAvatar} />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFCF4",
  },
  handle: {
    alignItems: "center",
    paddingVertical: 10,
  },
  handleBar: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#C4C4C4",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  banner: {
    height: 180,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  topSection: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  bottomSection: {
    backgroundColor: "#F1F4EC",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  bottomText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#5E5F5E",
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  chipList: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  infoChip: {
    backgroundColor: "#C1D5CE",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  infoChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#336B57",
  },
  infoDivider: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#999",
  },
  infoMuted: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#336B57",
  },
  infoTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#336B57",
  },
  infoValue: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#183228",
    lineHeight: 20,
    marginTop: 2,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#183228",
    lineHeight: 30,
  },
  detailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailsToggleText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: colors.primary,
  },
  accordionContent: {
    gap: 16,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#212529",
    lineHeight: 22,
    textAlign: "justify",
  },
  expertRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expertSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#5E5F5E",
  },
  expertName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: "#183228",
    marginTop: 2,
  },
  expertAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "#D3E194",
  },
  rateCard: {
    backgroundColor: "#F1F4EC",
    borderRadius: 20,
    padding: 20,
  },
});
