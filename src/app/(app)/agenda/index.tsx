import { ActivityCard } from "@/components/ActivityCard";
import { Calendar } from "@/components/Calendar";
import { EmptyAgenda } from "@/components/EmptyAgenda";
import { Text } from "@/components/Text";
import { UpcomingActivityCard, type Activity } from "@/components/UpcomingActivityCard";
import { useAuth } from "@/contexts/AuthContext";
import { useHeader } from "@/contexts/HeaderContext";
import { useEventParticipations } from "@/hooks/queries/useEventParticipations";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

export default function AgendaScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const router = useRouter();
  const { setBackgroundColor } = useHeader();
  const name = session?.user?.user_metadata?.full_name as string | undefined;
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const { data: participations, isLoading } = useEventParticipations({
    query: { prefetch: { event: true } },
  });

  useEffect(() => {
    console.log("participations:", JSON.stringify(participations, null, 2));
  }, [participations]);

  const hasActivities = (participations?.length ?? 0) > 0;
  const mockActivity: Activity = {
    title: "İyi Yaş Almak İçin Hormon Sağlığında Dikkat Edilmesi Gerekenler",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    locationType: "Yüz yüze",
    location: "Beykoz, Istanbul",
    startDate: new Date(Date.now() + 3 * 60 * 60 * 1000),
    startTime: "18.30",
    endTime: "20.30",
    host: { name: "Furkan Derinsu", avatarUrl: "https://i.pravatar.cc/100?img=11" },
  };

  useFocusEffect(
    useCallback(() => {
      setBackgroundColor("#336B57");
      return () => {
        setBackgroundColor(undefined);
      };
    }, [setBackgroundColor])
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
        <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </View>
      {hasActivities ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.activities}>
            <UpcomingActivityCard activity={mockActivity} onJoin={() => {}} />
            <View style={{ marginTop: 12, gap: 10 }}>
              <ActivityCard
                title="İyi Yaş Almak İçin Hormon Sağlığında Dikkat Edilmesi Gerekenler"
                time="18.30 - 20.30"
                onPress={() => {}}
              />
              <ActivityCard
                title="İyi Yaş Almak İçin Hormon Sağlığında Dikkat Edilmesi Gerekenler"
                time="18.30 - 20.30"
                onPress={() => {}}
              />
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyAgenda onExplore={() => router.navigate("/explore")} />
        </View>
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
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 100,
  },
});
