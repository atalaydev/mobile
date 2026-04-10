import { EventCard } from "@/components/EventCard";
import { SessionOptionCard } from "@/components/SessionOptionCard";
import { Text } from "@/components/Text";
import { colors } from "@/constants/colors";
import { useHeader } from "@/contexts/HeaderContext";
import { useLibrary } from "@/hooks/queries/useLibrary";
import { useDebounce } from "@/hooks/useDebounce";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { SymbolView } from "expo-symbols";
import i18n from "i18next";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;

function formatDateRange(firstDate: string, lastDate: string) {
  const locale = i18n.language === "tr" ? "tr-TR" : "en-US";
  const first = new Date(firstDate);
  const last = new Date(lastDate);
  const fmt = (d: Date) => d.toLocaleDateString(locale, { day: "numeric", month: "long", weekday: "long" });

  if (first.toDateString() === last.toDateString()) {
    return first.toLocaleDateString(locale, { day: "numeric", month: "long", weekday: "long", hour: "2-digit", minute: "2-digit" });
  }
  return `${fmt(first)} - ${fmt(last)}`;
}

const tabKeys = ["events", "sessions", "digital"] as const;
const tabIcons = {
  events: "text.book.closed",
  sessions: "doc.text",
  digital: "play.circle",
} as const;

type TabKey = (typeof tabKeys)[number];

const tabLabelKeys: Record<TabKey, string> = {
  events: "library.events",
  sessions: "library.sessions",
  digital: "library.digitalProducts",
};

export default function LibraryScreen() {
  const { setVariant } = useHeader();
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("events");
  const [eventSearchInput, setEventSearchInput] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState<"active" | "past">("active");
  const [sessionSearchInput, setSessionSearchInput] = useState("");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<"active" | "past">("active");
  const debouncedEventSearch = useDebounce(eventSearchInput, 500);
  const debouncedSessionSearch = useDebounce(sessionSearchInput, 500);
  const eventSearch = debouncedEventSearch.length >= 3 ? debouncedEventSearch : "";
  const sessionSearch = debouncedSessionSearch.length >= 3 ? debouncedSessionSearch : "";
  const [filterOpen, setFilterOpen] = useState(false);
  const isFocused = useIsFocused();

  const { data: eventData, isLoading: isLoadingEvents, fetchNextPage: fetchNextEvents, hasNextPage: hasNextEvents, isFetchingNextPage: isFetchingNextEvents } = useLibrary({
    query: {
      filters: {
        object_type: "EVENT_PARTICIPATION",
        has_current_session: eventStatusFilter === "active",
        ...(eventSearch && { search: eventSearch }),
      },
      sort: eventStatusFilter === "active" ? "latest_session_end" : "-last_session",
      prefetch: { event: true },
    },
    enabled: isFocused && activeTab === "events",
  });

  const { data: sessionData, isLoading: isLoadingSessions, fetchNextPage: fetchNextSessions, hasNextPage: hasNextSessions, isFetchingNextPage: isFetchingNextSessions } = useLibrary({
    query: {
      filters: {
        object_type: "SESSION_APPOINTMENT",
        has_current_session: sessionStatusFilter === "active",
        ...(sessionSearch && { search: sessionSearch }),
      },
      sort: sessionStatusFilter === "active" ? "latest_session_end" : "-last_session",
      prefetch: { session_option: true },
    },
    enabled: isFocused && activeTab === "sessions",
  });

  const eventItems = useMemo(() => eventData?.pages.flatMap((p) => p.results) ?? [], [eventData]);
  const sessionItems = useMemo(() => sessionData?.pages.flatMap((p) => p.results) ?? [], [sessionData]);


  useFocusEffect(
    useCallback(() => {
      setVariant("light");
    }, [setVariant])
  );

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isNearEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
          if (!isNearEnd) return;
          if (activeTab === "events" && hasNextEvents && !isFetchingNextEvents) fetchNextEvents();
          if (activeTab === "sessions" && hasNextSessions && !isFetchingNextSessions) fetchNextSessions();
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.bgContainer}>
          <Image
            source={require("@/assets/images/library-bg.svg")}
            style={styles.bgImage}
            contentFit="cover"
          />
        </View>
        <Text style={styles.title}>{t("library.title")}</Text>
        <Text style={styles.subtitle}>{t("library.subtitle")}</Text>

        <View style={styles.tabs}>
          {tabKeys.map((key) => {
            const active = activeTab === key;
            return (
              <Pressable
                key={key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(key)}
              >
                <SymbolView
                  name={tabIcons[key]}
                  size={24}
                  tintColor={active ? "#fff" : colors.text}
                />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {t(tabLabelKeys[key])}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {(activeTab === "events" || activeTab === "sessions") && (
          <View style={styles.searchContainer}>
            <View style={styles.searchSection}>
              <View style={styles.searchBar}>
                <SymbolView name="magnifyingglass" size={18} tintColor={colors.primary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={activeTab === "events" ? t("library.searchEvents") : t("library.searchSessions")}
                  placeholderTextColor="#999"
                  value={activeTab === "events" ? eventSearchInput : sessionSearchInput}
                  onChangeText={activeTab === "events" ? setEventSearchInput : setSessionSearchInput}
                />
              </View>
              <View style={styles.filterRow}>
                <Pressable onPress={() => setFilterOpen((v) => !v)} hitSlop={12}>
                  <SymbolView name="slider.horizontal.3" size={20} tintColor={colors.primary} />
                </Pressable>
                <Pressable
                  style={[styles.filterChip, (activeTab === "events" ? eventStatusFilter : sessionStatusFilter) === "active" && styles.filterChipActive]}
                  onPress={() => activeTab === "events" ? setEventStatusFilter("active") : setSessionStatusFilter("active")}
                >
                  <Text style={[styles.filterChipText, (activeTab === "events" ? eventStatusFilter : sessionStatusFilter) === "active" && styles.filterChipTextActive]}>
                    {t("library.active")}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.filterChip, (activeTab === "events" ? eventStatusFilter : sessionStatusFilter) === "past" && styles.filterChipActive]}
                  onPress={() => activeTab === "events" ? setEventStatusFilter("past") : setSessionStatusFilter("past")}
                >
                  <Text style={[styles.filterChipText, (activeTab === "events" ? eventStatusFilter : sessionStatusFilter) === "past" && styles.filterChipTextActive]}>
                    {t("library.past")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        <Modal visible={filterOpen} animationType="slide" presentationStyle="formSheet">
          <SafeAreaView style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>{t("library.filter")}</Text>
              <Pressable onPress={() => setFilterOpen(false)} hitSlop={12}>
                <SymbolView name="xmark.circle.fill" size={28} tintColor="#999" />
              </Pressable>
            </View>
          </SafeAreaView>
        </Modal>

        <Animated.View key={`${activeTab}-${activeTab === "events" ? eventStatusFilter : sessionStatusFilter}`} entering={FadeIn.duration(300)} style={styles.cards}>
          {activeTab === "events" && isLoadingEvents && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
          {activeTab === "sessions" && isLoadingSessions && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
          {activeTab === "events" && !isLoadingEvents && eventItems.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t("library.emptyEvents")}</Text>
              <Pressable style={styles.emptyButton} onPress={() => router.push("/explore")}>
                <Text style={styles.emptyButtonText}>{t("library.discover")}</Text>
              </Pressable>
            </View>
          )}
          {activeTab === "events" && !isLoadingEvents && eventItems.map((item, index) => {
            const event = typeof item.event === "object" ? item.event : null;
            const expert = event && typeof event.expert === "object" ? event.expert : null;
            const dateLabel = formatDateRange(item.first_session_date, item.last_session_date);

            return (
              <Animated.View key={item.id} entering={FadeInUp.duration(400)}>
              <EventCard
                title={item.title}
                imageUrl={event?.banner ?? ""}
                locationType={({ remote: t("locationType.remote"), hybrid: t("locationType.hybrid"), "in-person": t("locationType.inPerson"), in_person: t("locationType.inPerson") })[event?.type ?? ""] ?? event?.type ?? ""}
                sessionCount={item.planned_session_count}
                currentSession={item.planned_session_count > 1 && item.upcoming_session_count > 0 ? item.completed_session_count + 1 : undefined}
                date={dateLabel}
                expert={{
                  name: expert?.title ?? "",
                  subtitle: expert?.subtitle || t("agenda.expert"),
                  avatarUrl: expert?.photo ?? "",
                }}
                isPast={eventStatusFilter === "past"}
                onDetails={() => router.push(`/library/event/${item.object_id}/${item.id}`)}
              />
              </Animated.View>
            );
          })}
          {activeTab === "sessions" && !isLoadingSessions && sessionItems.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t("library.emptySessions")}</Text>
              <Pressable style={styles.emptyButton} onPress={() => router.push("/explore")}>
                <Text style={styles.emptyButtonText}>{t("library.discover")}</Text>
              </Pressable>
            </View>
          )}
          {activeTab === "sessions" && !isLoadingSessions && sessionItems.map((item, index) => {
            const sessionOption = typeof item.session_option === "object" ? item.session_option : null;
            const expert = sessionOption && typeof sessionOption.expert === "object" ? sessionOption.expert : null;
            const dateLabel = formatDateRange(item.first_session_date, item.last_session_date);
            const totalSessionCount = item.planned_session_count + item.unplanned_session_count;
            const hasUnplanned = item.unplanned_session_count > 0 && item.last_session_date != null && new Date(item.last_session_date) < new Date();

            return (
              <Animated.View key={item.id} entering={FadeInUp.duration(400)}>
              <SessionOptionCard
                title={item.title}
                imageUrl={sessionOption?.banner ?? ""}
                locationType={sessionOption?.location === 2 ? t("locationType.inPerson") : t("locationType.remote")}
                duration={sessionOption?.duration}
                sessionCount={totalSessionCount}
                currentSession={totalSessionCount > 1 && item.upcoming_session_count > 0 ? item.completed_session_count + 1 : undefined}
                unplannedCount={item.unplanned_session_count}
                hasUnplanned={hasUnplanned}
                date={dateLabel}
                expert={{
                  name: expert?.title ?? "",
                  subtitle: expert?.subtitle || t("agenda.expert"),
                  avatarUrl: expert?.photo ?? "",
                }}
                isPast={sessionStatusFilter === "past"}
                onDetails={() => router.push(`/library/session/${item.object_id}/${item.id}`)}
              />
              </Animated.View>
            );
          })}
          {(isFetchingNextEvents || isFetchingNextSessions) && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loadingMore} />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  bgContainer: {
    position: "absolute",
    top: -140,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (396 / 390),
  },
  bgImage: {
    width: "100%",
    height: "100%",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#212529",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#5E5F5E",
    marginTop: 6,
    lineHeight: 20,
  },
  tabs: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#1832281A",
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.text,
    textAlign: "center",
  },
  tabLabelActive: {
    color: "#fff",
  },
  searchContainer: {
    backgroundColor: "#FBFCF4",
    borderWidth: 1,
    borderColor: "#E8EBEA",
    borderRadius: 20,
    padding: 16,
    marginTop: 42,
  },
  searchSection: {
    gap: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F4EC",
    borderWidth: 1,
    borderColor: "#E8EBEA",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#183228",
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  filterChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 6,
    alignItems: "center",
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
  filterChipTextActive: {
    color: "#fff",
  },
  filterModal: {
    flex: 1,
    backgroundColor: "#FBFCF4",
    padding: 20,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#183228",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingMore: {
    paddingVertical: 16,
  },
  emptyState: {
    backgroundColor: "#F1F4EC",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#183228",
    textAlign: "center",
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  emptyButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#fff",
  },
  cards: {
    marginTop: 16,
    gap: 16,
  },
});
