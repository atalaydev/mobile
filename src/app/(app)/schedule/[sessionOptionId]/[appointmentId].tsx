import { Text } from "@/components/Text";
import { colors } from "@/constants/colors";
import { initiateAppointment } from "@/api/appointments";
import { useAvailabilitySlots } from "@/hooks/queries/useAvailabilitySlots";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import i18n from "i18next";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const DAYS_TR = ["Pzt", "Sal", "Çrş", "Prş", "Cum", "Cmt", "Pzr"];
const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Monday-first index (0=Mon, 6=Sun)
function getDayOfWeek(year: number, month: number, day: number) {
  const d = new Date(year, month, day).getDay();
  return d === 0 ? 6 : d - 1;
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function ScheduleScreen() {
  const { sessionOptionId, appointmentId } = useLocalSearchParams<{ sessionOptionId: string; appointmentId: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const isTr = i18n.language === "tr";
  const insets = useSafeAreaInsets();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOffset = getDayOfWeek(viewYear, viewMonth, 1);

  const { availableDates, isLoading: isLoadingSlots } = useAvailabilitySlots(sessionOptionId, viewYear, viewMonth);
  const timeSlots = availableDates[selectedDate] ?? [];

  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = Array(firstDayOffset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth, firstDayOffset, daysInMonth]);

  const isAvailable = (day: number) => {
    const key = dateKey(viewYear, viewMonth, day);
    return key in availableDates;
  };

  const isToday = (day: number) => {
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  };

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleSelectDate = (day: number) => {
    if (isPast(day)) return;
    const key = dateKey(viewYear, viewMonth, day);
    setSelectedDate(key);
    setSelectedTime(null);
  };

  const selectedLabel = useMemo(() => {
    const d = new Date(selectedDate);
    const locale = isTr ? "tr-TR" : "en-US";
    return d.toLocaleDateString(locale, { day: "numeric", month: "long", weekday: "long" });
  }, [selectedDate, isTr]);

  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;
    const [year, month, day] = selectedDate.split("-").map(Number);
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const date = new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
    try {
      setIsConfirming(true);
      await initiateAppointment(appointmentId, date);
      router.back();
    } catch {
      Alert.alert(t("common.error"), t("schedule.confirmFailed"));
    } finally {
      setIsConfirming(false);
    }
  };

  const months = isTr ? MONTHS_TR : MONTHS_EN;
  const days = isTr ? DAYS_TR : DAYS_EN;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.handleBarContainer}>
        <View style={styles.handleBar} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>{t("schedule.dateSelection")}</Text>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Pressable onPress={prevMonth} hitSlop={12}>
              <SymbolView name="chevron.left" size={16} tintColor={colors.primary} />
            </Pressable>
            <View style={styles.calendarHeaderCenter}>
              <Text style={styles.monthTitle}>{months[viewMonth]} {viewYear}</Text>
              {(viewMonth !== today.getMonth() || viewYear !== today.getFullYear()) && (
                <Pressable style={styles.todayChip} hitSlop={12} onPress={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }}>
                  <Text style={styles.todayChipText}>{t("schedule.today")}</Text>
                </Pressable>
              )}
            </View>
            <Pressable onPress={nextMonth} hitSlop={12}>
              <SymbolView name="chevron.right" size={16} tintColor={colors.primary} />
            </Pressable>
          </View>

          {isLoadingSlots && <ActivityIndicator size="small" color={colors.primary} />}

          <View style={styles.dayHeaders}>
            {days.map((d) => (
              <Text key={d} style={styles.dayHeader}>{d}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarCells.map((day, i) => {
              if (day === null) return <View key={`empty-${i}`} style={styles.dayCell} />;
              const key = dateKey(viewYear, viewMonth, day);
              const available = isAvailable(day);
              const past = isPast(day);
              const selected = selectedDate === key;
              const todayDay = isToday(day);

              return (
                <Pressable
                  key={key}
                  style={styles.dayCell}
                  onPress={() => handleSelectDate(day)}
                  disabled={past}
                >
                  <View style={[
                    styles.dayInner,
                    selected && styles.daySelected,
                    !selected && available && styles.dayAvailable,
                    !selected && todayDay && styles.dayToday,
                  ]}>
                    <Text style={[
                      styles.dayText,
                      past && styles.dayTextPast,
                      selected && styles.dayTextSelected,
                      !selected && available && styles.dayTextAvailable,
                    ]}>
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>{t("schedule.timeSelection")}</Text>
        <View style={[styles.timeSlotsCard, styles.timeSlotsCardGrow, timeSlots.length > 0 && styles.timeSlotsCardFilled]}>
          {timeSlots.length === 0 ? (
            <View style={styles.emptyContainer}>
              <SymbolView name="clock.badge.xmark" size={36} tintColor="#C1D5CE" />
              <Text style={styles.emptyText}>{t("schedule.noSlots")}</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.timeGrid}>
                {timeSlots.map((slot) => {
                  const selected = selectedTime === slot;
                  return (
                    <Pressable
                      key={slot}
                      style={[styles.timeSlot, selected && styles.timeSlotSelected]}
                      onPress={() => setSelectedTime(slot)}
                    >
                      <Text style={[styles.timeSlotText, selected && styles.timeSlotTextSelected]}>{slot}</Text>
                    </Pressable>
                  );
                })}
                {Array.from({ length: (3 - (timeSlots.length % 3)) % 3 }).map((_, i) => (
                  <View key={`filler-${i}`} style={styles.timeSlotFiller} />
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          style={[styles.confirmButton, (!selectedDate || !selectedTime || isConfirming) && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!selectedDate || !selectedTime || isConfirming}
        >
          {isConfirming
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.confirmButtonText}>{t("schedule.confirm")}</Text>
          }
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F4EC",
  },
  handleBarContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C1CCCA",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  calendarCard: {
    backgroundColor: "#EBF1EF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1832281A",
    padding: 16,
    gap: 12,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  calendarHeaderCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  todayChip: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  todayChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: colors.primary,
  },
  monthTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: colors.primary,
  },
  dayHeaders: {
    flexDirection: "row",
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: colors.primary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayAvailable: {
    backgroundColor: "#D3E194",
  },
  dayToday: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: colors.text,
  },
  dayTextPast: {
    color: "#C1CCCA",
  },
  dayTextSelected: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  dayTextAvailable: {
    color: colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  timeSlotsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1832281A",
    borderStyle: "dashed",
    padding: 16,
  },
  timeSlotsCardGrow: {
    flex: 1,
  },
  timeSlotsCardFilled: {
    borderStyle: "solid",
    backgroundColor: "#EBF1EF",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    justifyContent: "space-between",
  },
  timeSlot: {
    width: "31%",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#FBFCF4",
    borderColor: "#1832281A",
    alignItems: "center",
  },
  timeSlotFiller: {
    width: "31%",
  },
  timeSlotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.text,
  },
  timeSlotTextSelected: {
    color: "#fff",
  },
  emptyContainer: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 32,
  },
  emptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#5E5F5E",
    textAlign: "center",
  },
  noSlots: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#5E5F5E",
    textAlign: "center",
    paddingVertical: 16,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#E8EBEA",
    backgroundColor: "#F1F4EC",
  },
  selectionSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  selectionSummaryText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: colors.text,
  },
  selectionSummaryDot: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#C1CCCA",
  },
  selectionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: colors.text,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#fff",
  },
});
