import { joinAppointment } from "@/api/appointments";
import { joinEventParticipation } from "@/api/event-participations";
import { ActivityCard } from "@/components/ActivityCard";
import { Calendar } from "@/components/Calendar";
import { EmptyAgenda } from "@/components/EmptyAgenda";
import { Text } from "@/components/Text";
import { UpcomingActivityCard } from "@/components/UpcomingActivityCard";
import { useAuth } from "@/contexts/AuthContext";
import { useHeader } from "@/contexts/HeaderContext";
import { useAppointments } from "@/hooks/queries/useAppointments";
import { useEventParticipations } from "@/hooks/queries/useEventParticipations";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";

const locationTypeLabels: Record<string, string> = {
  remote: "Online",
  hybrid: "Hibrit",
  "in-person": "Yüz yüze",
};

export default function AgendaScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const router = useRouter();
  const { setVariant } = useHeader();
  const name = session?.user?.user_metadata?.full_name as string | undefined;
  const timezone = (session?.user?.user_metadata?.timezone as string) ?? "Europe/Istanbul";
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const { dateRange, tzOffsetMs } = useMemo(() => {
    const toUTCStr = (date: Date) => date.toISOString().slice(0, 19) + "Z";

    const probe = new Date();
    const getHM = (tz: string) => {
      const p = new Intl.DateTimeFormat("en", {
        timeZone: tz, hour: "numeric", minute: "numeric", day: "numeric", hour12: false,
      }).formatToParts(probe);
      const v = (t: string) => Number(p.find((x) => x.type === t)!.value);
      return { day: v("day"), h: v("hour"), m: v("minute") };
    };
    const utc = getHM("UTC");
    const tz = getHM(timezone);
    const utcMin = utc.day * 1440 + utc.h * 60 + utc.m;
    const tzMin = tz.day * 1440 + tz.h * 60 + tz.m;
    const offsetMs = (tzMin - utcMin) * 60 * 1000;

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");

    // Start: today's 00:00:00 in user's tz → UTC
    const today = new Date();
    const todayDay = String(today.getDate()).padStart(2, "0");
    const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
    const todayYear = today.getFullYear();
    const startDate = new Date(Date.parse(`${todayYear}-${todayMonth}-${todayDay}T00:00:00Z`) - offsetMs);

    // End: last day of selected month 23:59:59 in user's tz → UTC
    const lastDay = new Date(year, selectedDate.getMonth() + 1, 0).getDate();
    const endDate = new Date(Date.parse(`${year}-${month}-${String(lastDay).padStart(2, "0")}T23:59:59Z`) - offsetMs);

    return { dateRange: `${toUTCStr(startDate)},${toUTCStr(endDate)}`, tzOffsetMs: offsetMs };
  }, [selectedDate.getFullYear(), selectedDate.getMonth(), timezone]);

  const { data: participations, isLoading: isLoadingParticipations, isRefetching: isRefetchingParticipations, refetch: refetchParticipations } = useEventParticipations({
    query: { filters: { state: "confirmed", date__range: dateRange }, prefetch: { event: true } },
  });

  const { data: appointments, isLoading: isLoadingAppointments, isRefetching: isRefetchingAppointments, refetch: refetchAppointments } = useAppointments({
    query: { filters: { state: "confirmed", date__range: dateRange }, prefetch: { expert: true, session_option: true } },
  });

  const isLoading = isLoadingParticipations || isLoadingAppointments;
  const isRefetching = isRefetchingParticipations || isRefetchingAppointments;
  const refetch = useCallback(() => {
    refetchParticipations();
    refetchAppointments();
  }, [refetchParticipations, refetchAppointments]);

  type AgendaItem =
    | { type: "participation"; data: NonNullable<typeof participations>[number] }
    | { type: "appointment"; data: NonNullable<typeof appointments>[number] };

  const allItems = useMemo(() => {
    const now = Date.now();
    const all: AgendaItem[] = [];

    for (const p of participations ?? []) {
      if (new Date(p.end_date).getTime() < now) continue;
      all.push({ type: "participation", data: p });
    }

    for (const a of appointments ?? []) {
      if (!a.start_date || !a.end_date) continue;
      if (new Date(a.end_date).getTime() < now) continue;
      all.push({ type: "appointment", data: a });
    }

    all.sort((a, b) => new Date(a.data.start_date!).getTime() - new Date(b.data.start_date!).getTime());

    return all;
  }, [participations, appointments]);

  // Days that have activities (for calendar dots)
  const activeDays = useMemo(() => {
    const days = new Set<string>();
    for (const item of allItems) {
      const date = new Date(new Date(item.data.start_date!).getTime() + tzOffsetMs);
      days.add(`${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`);
    }
    return days;
  }, [allItems, tzOffsetMs]);

  // Filter items for selected day
  const items = useMemo(() => {
    const selKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    return allItems.filter((item) => {
      const date = new Date(new Date(item.data.start_date!).getTime() + tzOffsetMs);
      return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}` === selKey;
    });
  }, [allItems, selectedDate, tzOffsetMs]);

  const hasActivities = items.length > 0;
  const [first, ...rest] = items;

  const getItemTitle = (item: AgendaItem) => {
    if (item.type === "participation") return item.data.event?.title ?? "";
    return typeof item.data.session_option === "object" ? item.data.session_option.title : "";
  };

  const getItemBanner = (item: AgendaItem) => {
    if (item.type === "participation") return item.data.event?.banner ?? "";
    return typeof item.data.session_option === "object" ? item.data.session_option.banner : "";
  };

  const getItemExpert = (item: AgendaItem) => {
    if (item.type === "participation") {
      const expert = item.data.event?.expert;
      return typeof expert === "object" ? expert : null;
    }
    const expert = item.data.expert;
    return typeof expert === "object" ? expert : null;
  };

  const getItemLocation = (item: AgendaItem) => {
    if (item.type === "participation") {
      const event = item.data.event;
      if (!event) return { label: "", location: "" };
      return {
        label: locationTypeLabels[event.type] ?? event.type,
        location: event.type !== "remote" ? (event.location ?? "") : "",
      };
    }
    return { label: "Online", location: "" };
  };

  const handleJoin = async (item: AgendaItem) => {
    try {
      console.log("join: fetching credentials for", item.type, item.data.id);
      const credentials = item.type === "participation"
        ? await joinEventParticipation(item.data.id)
        : await joinAppointment(item.data.id);
      console.log("join: credentials received", JSON.stringify(credentials));
      const userName = session?.user?.user_metadata?.full_name ?? `*****${session?.user?.phone?.slice(-4)}`;
      router.push({ pathname: "/zoom", params: { token: credentials.token, id: credentials.id, password: credentials.password, userName } });
      console.log("join: zoom meeting started");
    } catch (e) {
      console.error("join failed:", e);
    }
  };

  const renderUpcoming = (item: AgendaItem) => {
    const expert = getItemExpert(item);
    const loc = getItemLocation(item);
    return (
      <UpcomingActivityCard
        activity={{
          title: getItemTitle(item),
          imageUrl: getItemBanner(item),
          locationType: loc.label,
          location: loc.location,
          startDate: new Date(item.data.start_date!),
          startTime: new Date(item.data.start_date!).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: timezone }),
          endTime: new Date(item.data.end_date!).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: timezone }),
          host: {
            name: expert?.title ?? "",
            subtitle: expert?.subtitle ?? null,
            avatarUrl: expert?.photo ?? "",
          },
        }}
        variant={item.type === "participation" ? "event" : "appointment"}
        onJoin={() => handleJoin(item)}
      />
    );
  };

  const renderSmallCard = (item: AgendaItem) => (
    <ActivityCard
      key={item.data.id}
      title={getItemTitle(item)}
      startDate={item.data.start_date!}
      timezone={timezone}
      onPress={() => {}}
    />
  );

  useFocusEffect(
    useCallback(() => {
      setVariant("primary");
    }, [setVariant])
  );

  return (
    <View style={styles.root}>
      <View style={styles.stickySection}>
        <Image
          source={require("@/assets/images/clover.svg")}
          style={styles.clover}
          contentFit="contain"
        />
        <View style={styles.greeting}>
          <Text style={name ? styles.greetingText : styles.nameText}>{t("agenda.greeting")}</Text>
          {name && <Text style={styles.nameText} numberOfLines={1} adjustsFontSizeToFit>{t("agenda.name", { name })}</Text>}
        </View>
        <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} activeDays={activeDays} />
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#336B57" />
        </View>
      ) : hasActivities ? (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#336B57" />}
        >
          <View style={styles.activities}>
            {first && renderUpcoming(first)}
            {rest.length > 0 && (
              <View style={styles.restCards}>
                {rest.map((item) => renderSmallCard(item))}
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.emptyScroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#336B57" />}
        >
          <View style={styles.emptyContainer}>
            <EmptyAgenda onExplore={() => router.push("/explore")} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  clover: {
    position: "absolute",
    top: 30,
    right: -20,
    width: 180,
    height: 180,
    opacity: 0.15,
  },
  stickySection: {
    backgroundColor: "#336B57",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: -40,
    paddingTop: 40,
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  greeting: {
    marginTop: 8,
  },
  greetingText: {
    fontSize: 18,
    color: "#EBF1EF",
  },
  nameText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  activities: {
    marginTop: 16,
    paddingBottom: 100,
  },
  restCards: {
    marginTop: 12,
    gap: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyScroll: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    marginTop: 16,
    marginBottom: 100,
  },
});
