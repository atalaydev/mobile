import { getEventParticipations } from "@/api/event-participations";
import { Text } from "@/components/Text";
import { colors } from "@/constants/colors";
import { useEvent } from "@/hooks/queries/useEvent";
import { EventParticipation } from "@/types/eventParticipation";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import i18n from "i18next";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { useQuery } from "@tanstack/react-query";

export default function EventDetailScreen() {
  const { id, paymentId } = useLocalSearchParams<{ id: string; paymentId: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [sessionTab, setSessionTab] = useState<"planned" | "past">("planned");

  const { data: event, isLoading } = useEvent(id);
  const { data: participations } = useQuery<EventParticipation[]>({
    queryKey: ["event-participations", paymentId],
    queryFn: async () => {
      const res = await getEventParticipations({ filters: { payment: paymentId }, limit: 100, sort: "-start_date" });
      return res.results;
    },
    enabled: !!paymentId,
  });

  const expert = event && typeof event.expert === "object" ? event.expert : null;
  const locale = i18n.language === "tr" ? "tr-TR" : "en-US";

  const { next, past, planned, sessionNumbers } = useMemo(() => {
    if (!participations) return { next: null, past: [], planned: [] };
    const now = Date.now();
    const sorted = [...participations].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    let nextSession: EventParticipation | null = null;
    const pastSessions: EventParticipation[] = [];
    const plannedSessions: EventParticipation[] = [];

    for (const p of sorted) {
      const start = new Date(p.start_date).getTime();
      const end = new Date(p.end_date).getTime();
      if (end < now) {
        pastSessions.push(p);
      } else if (!nextSession) {
        nextSession = p;
      } else {
        plannedSessions.push(p);
      }
    }

    // Build session number map (chronological order)
    const sessionNumbers = new Map<string, number>();
    sorted.forEach((p, i) => sessionNumbers.set(p.id, i + 1));

    return { next: nextSession, past: pastSessions.reverse(), planned: plannedSessions, sessionNumbers };
  }, [participations]);

  const formatSessionDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={styles.container}>
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

          <View style={styles.bottomSection}>
            {next && (
              <View style={styles.sessionGroup}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionBar} />
                  <Text style={styles.sectionTitle}>{t("library.nextSession")}</Text>
                </View>
                <View style={styles.sessionCard}>
                  <View style={styles.sessionBadge}>
                    <Text style={styles.sessionBadgeText}>{t("library.currentSession", { current: sessionNumbers.get(next.id) })}</Text>
                  </View>
                  <Text style={styles.sessionDate}>{formatSessionDate(next.start_date)}</Text>
                  <Text style={styles.sessionTitle}>{event?.title}</Text>
                  <View style={styles.sessionLocationRow}>
                    <SymbolView name="mappin.circle" size={14} tintColor={colors.primary} />
                    <Text style={styles.sessionLocation}>{t("library.online")}</Text>
                  </View>
                  {next.recording_available_until && (
                    <View style={styles.recordingInfo}>
                      <SymbolView name="info.circle" size={14} tintColor={colors.primary} />
                      <Text style={styles.recordingText}>
                        {t("library.recordingAvailable", { date: formatSessionDate(next.recording_available_until) })}
                      </Text>
                    </View>
                  )}
                  <Pressable style={styles.sessionButton}>
                    <Text style={styles.sessionButtonText}>{t("library.joinLive")}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            <View style={styles.sessionTabs}>
              <Pressable
                style={[styles.sessionTabButton, sessionTab === "planned" && styles.sessionTabButtonActive]}
                onPress={() => setSessionTab("planned")}
              >
                <Text style={[styles.sessionTabText, sessionTab === "planned" && styles.sessionTabTextActive]}>
                  {t("library.plannedSessions")}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.sessionTabButton, sessionTab === "past" && styles.sessionTabButtonActive]}
                onPress={() => setSessionTab("past")}
              >
                <Text style={[styles.sessionTabText, sessionTab === "past" && styles.sessionTabTextActive]}>
                  {t("library.pastSessions")}
                </Text>
              </Pressable>
            </View>

            {sessionTab === "planned" && planned.map((p) => (
              <View key={p.id} style={styles.sessionCard}>
                <View style={styles.sessionBadge}>
                  <Text style={styles.sessionBadgeText}>{t("library.currentSession", { current: sessionNumbers.get(p.id) })}</Text>
                </View>
                <Text style={styles.sessionDate}>{formatSessionDate(p.start_date)}</Text>
                <Text style={styles.sessionTitle}>{event?.title}</Text>
                <View style={styles.sessionLocationRow}>
                  <SymbolView name="mappin.circle" size={14} tintColor={colors.primary} />
                  <Text style={styles.sessionLocation}>{t("library.online")}</Text>
                </View>
                {p.recording_available_until && (
                  <View style={styles.recordingInfo}>
                    <SymbolView name="info.circle" size={14} tintColor={colors.primary} />
                    <Text style={styles.recordingText}>
                      {t("library.recordingAvailable", { date: formatSessionDate(p.recording_available_until) })}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {sessionTab === "past" && past.map((p) => (
              <View key={p.id} style={styles.sessionCard}>
                <View style={styles.sessionBadge}>
                  <Text style={styles.sessionBadgeText}>{t("library.currentSession", { current: sessionNumbers.get(p.id) })}</Text>
                </View>
                <Text style={styles.sessionDate}>{formatSessionDate(p.start_date)}</Text>
                <Text style={styles.sessionTitle}>{event?.title}</Text>
                <View style={styles.sessionLocationRow}>
                  <SymbolView name="mappin.circle" size={14} tintColor={colors.primary} />
                  <Text style={styles.sessionLocation}>{t("library.online")}</Text>
                </View>
                {p.recording_available_until && (
                  <View style={styles.recordingInfo}>
                    <SymbolView name="info.circle" size={14} tintColor={colors.primary} />
                    <Text style={styles.recordingText}>
                      {t("library.recordingAvailable", { date: formatSessionDate(p.recording_available_until) })}
                    </Text>
                  </View>
                )}
                <Pressable style={styles.sessionButton}>
                  <Text style={styles.sessionButtonText}>{t("library.watchRecording")}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F4EC",
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
    backgroundColor: "#F1F4EC",
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  bottomSection: {
    backgroundColor: "#FBFCF4",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    gap: 16,
    flexGrow: 1,
  },
  sessionGroup: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#183228",
  },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8EBEA",
    padding: 16,
    gap: 8,
  },
  sessionBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#F78F08",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sessionBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#fff",
  },
  sessionDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#5E5F5E",
  },
  sessionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#183228",
  },
  sessionLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sessionLocation: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#5E5F5E",
  },
  recordingInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#F1F4EC",
    borderRadius: 12,
    padding: 10,
  },
  recordingText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#5E5F5E",
    lineHeight: 18,
  },
  sessionTabs: {
    flexDirection: "row",
    backgroundColor: "#F1F4EC",
    borderWidth: 2,
    borderColor: "#E8EBEA",
    borderRadius: 28,
    padding: 4,
  },
  sessionTabButton: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: "center",
  },
  sessionTabButtonActive: {
    backgroundColor: colors.primary,
  },
  sessionTabText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#5E5F5E",
  },
  sessionTabTextActive: {
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  sessionButton: {
    backgroundColor: "#336B57",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 4,
  },
  sessionButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#fff",
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  infoIcon: {
    width: 20,
    height: 20,
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
    marginTop: -8,
  },
  detailsToggleText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: colors.primary,
  },
  accordionContent: {
    gap: 16,
    marginTop: -8,
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
    backgroundColor: "#FBFCF4",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8EBEA",
    padding: 20,
  },
});
