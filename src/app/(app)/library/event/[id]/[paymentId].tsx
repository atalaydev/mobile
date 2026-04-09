import { getEventParticipations } from "@/api/event-participations";
import { Text } from "@/components/Text";
import { colors } from "@/constants/colors";
import { useEvent } from "@/hooks/queries/useEvent";
import { Category } from "@/types/category";
import { EventParticipation } from "@/types/eventParticipation";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import i18n from "i18next";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, StyleSheet, View } from "react-native";

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
  const categories = (event?.categories ?? []).filter((c): c is Category => typeof c === "object").sort((a, b) => Number(a.sub) - Number(b.sub) || a.name.localeCompare(b.name));
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

  const getRecordingDeadline = (p: EventParticipation) => {
    if (!p.recordings_access_duration) return null;
    const deadline = new Date(p.start_date);
    deadline.setDate(deadline.getDate() + p.recordings_access_duration);
    return deadline;
  };

  const openRecording = (participationId: string, recordingId: string) => {
    router.push({ pathname: "/library/watch", params: { participationId, recordingId } });
  };

  const handleWatchRecording = (p: EventParticipation) => {
    const recordings = p.recordings ?? [];
    if (recordings.length === 0) return;

    if (recordings.length === 1) {
      openRecording(p.id, recordings[0]);
      return;
    }

    Alert.alert(
      "",
      undefined,
      [
        ...recordings.map((recordingId, i) => ({
          text: t("library.recordingPart", { current: i + 1 }),
          onPress: () => openRecording(p.id, recordingId),
        })),
        { text: t("notifications.cancel"), style: "cancel" as const },
      ],
    );
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

                {categories.length > 0 && (
                  <View style={[styles.infoRow, { alignItems: "center" }]}>
                    <View style={styles.infoIcon}><SymbolView name="square.grid.2x2" size={20} tintColor={colors.primary} /></View>
                    <FlatList
                      data={categories}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chipList}
                      keyExtractor={(cat) => cat.id}
                      renderItem={({ item: cat, index: i }) => (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          {i > 0 && <Text style={styles.infoDivider}>|</Text>}
                          {cat.sub ? (
                            <Text style={styles.infoMuted}>{cat.name}</Text>
                          ) : (
                            <View style={styles.infoChip}>
                              <Text style={styles.infoChipText}>{cat.name}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    />
                  </View>
                )}

                {event?.activity_level != null && (
                  <View style={[styles.infoRow, { alignItems: "center" }]}>
                    <View style={styles.infoIcon}><SymbolView name="chart.bar" size={20} tintColor={colors.primary} /></View>
                    <Text style={styles.infoTitle}>
                      {{ 1: t("event.activityLevelAll"), 2: t("event.activityLevelBeginner"), 3: t("event.activityLevelIntermediate"), 4: t("event.activityLevelAdvanced") }[event.activity_level] ?? t("event.activityLevelAll")}
                    </Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}><SymbolView name="mappin.and.ellipse" size={20} tintColor={colors.primary} /></View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>{t("event.location")}</Text>
                    <Text style={styles.infoValue}>
                      {event?.type === "remote" ? t("event.locationRemote") : event?.type === "hybrid" ? t("event.locationHybrid") : t("event.locationInPerson")}
                    </Text>
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
                  <Text style={styles.sessionTitle}>{next.event_session_title || event?.title}</Text>
                  <View style={styles.sessionLocationRow}>
                    <SymbolView name="mappin.and.ellipse" size={14} tintColor={colors.primary} />
                    <Text style={styles.sessionLocation}>{t("library.online")}</Text>
                  </View>
                  {(() => {
                    const deadline = getRecordingDeadline(next);
                    if (deadline) {
                      return (
                        <View style={styles.recordingInfo}>
                          <SymbolView name="info.circle" size={14} tintColor={colors.primary} style={{ marginTop: 2 }} />
                          <Text style={styles.recordingText}>
                            {t("library.recordingAvailableBefore")}<Text style={styles.recordingBold}>{formatSessionDate(deadline.toISOString())}</Text>{t("library.recordingAvailableAfter")}
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })()}
                  <Pressable style={styles.sessionButton}>
                    <Text style={styles.sessionButtonText}>{t("library.joinLive")}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>{t("library.sessionsTitle")}</Text>

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

            {sessionTab === "planned" && planned.length === 0 && (
              <View style={styles.emptyContainer}>
                <SymbolView name="calendar.badge.clock" size={36} tintColor="#C1D5CE" />
                <Text style={styles.emptyText}>{t("library.emptyPlanned")}</Text>
              </View>
            )}

            {sessionTab === "planned" && planned.map((p) => (
              <View key={p.id} style={styles.sessionCard}>
                <View style={styles.sessionBadge}>
                  <Text style={styles.sessionBadgeText}>{t("library.currentSession", { current: sessionNumbers.get(p.id) })}</Text>
                </View>
                <Text style={styles.sessionDate}>{formatSessionDate(p.start_date)}</Text>
                <Text style={styles.sessionTitle}>{p.event_session_title || event?.title}</Text>
                <View style={styles.sessionLocationRow}>
                  <SymbolView name="mappin.and.ellipse" size={14} tintColor={colors.primary} />
                  <Text style={styles.sessionLocation}>{t("library.online")}</Text>
                </View>
                {(() => {
                  const deadline = getRecordingDeadline(p);
                  if (deadline) {
                    return (
                      <View style={styles.recordingInfo}>
                        <SymbolView name="info.circle" size={14} tintColor={colors.primary} style={{ marginTop: 2 }} />
                        <Text style={styles.recordingText}>
                          {t("library.recordingAvailableBefore")}<Text style={styles.recordingBold}>{formatSessionDate(deadline.toISOString())}</Text>{t("library.recordingAvailableAfter")}
                        </Text>
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>
            ))}

            {sessionTab === "past" && past.length === 0 && (
              <View style={styles.emptyContainer}>
                <SymbolView name="clock.arrow.circlepath" size={36} tintColor="#C1D5CE" />
                <Text style={styles.emptyText}>{t("library.emptyPast")}</Text>
              </View>
            )}

            {sessionTab === "past" && past.map((p) => (
              <View key={p.id} style={styles.sessionCard}>
                <View style={styles.sessionBadge}>
                  <Text style={styles.sessionBadgeText}>{t("library.currentSession", { current: sessionNumbers.get(p.id) })}</Text>
                </View>
                <Text style={styles.sessionDate}>{formatSessionDate(p.start_date)}</Text>
                <Text style={styles.sessionTitle}>{p.event_session_title || event?.title}</Text>
                <View style={styles.sessionLocationRow}>
                  <SymbolView name="mappin.and.ellipse" size={14} tintColor={colors.primary} />
                  <Text style={styles.sessionLocation}>{t("library.online")}</Text>
                </View>
                {(() => {
                  const deadline = getRecordingDeadline(p);
                  if (!deadline) return null;
                  return (
                    <>
                      <View style={styles.recordingInfo}>
                        <SymbolView name="info.circle" size={14} tintColor={colors.primary} style={{ marginTop: 2 }} />
                        <Text style={styles.recordingText}>
                          {t("library.recordingAvailableBefore")}<Text style={styles.recordingBold}>{formatSessionDate(deadline.toISOString())}</Text>{t("library.recordingAvailableAfter")}
                        </Text>
                      </View>
                      {(p.recordings?.length ?? 0) > 0 && (
                        <Pressable
                          style={[styles.sessionButton, !p.recordings_watchable && styles.sessionButtonDisabled]}
                          onPress={() => handleWatchRecording(p)}
                          disabled={!p.recordings_watchable}
                        >
                          <Text style={styles.sessionButtonText}>{t("library.watchRecording")}</Text>
                        </Pressable>
                      )}
                    </>
                  );
                })()}
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
    backgroundColor: "#FBFCF4",
    borderWidth: 1,
    borderColor: "#E2EBB7",
    borderRadius: 12,
    padding: 10,
  },
  recordingText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#336B57",
    lineHeight: 18,
  },
  recordingBold: {
    fontFamily: "Inter_700Bold",
    color: "#336B57",
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
  sessionButtonDisabled: {
    opacity: 0.4,
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
  emptyContainer: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8EBEA",
    borderStyle: "dashed",
  },
  emptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#5E5F5E",
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
