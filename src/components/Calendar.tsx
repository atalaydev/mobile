import { colors } from "@/constants/colors";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, FlatList, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInUp, FadeOut } from "react-native-reanimated";
import { Text } from "./Text";

const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 20;
const MONTH_BUTTON_WIDTH = 56;
const LIST_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - MONTH_BUTTON_WIDTH;
const DAY_WIDTH = Math.floor(LIST_WIDTH / 5.5);
const ITEM_WIDTH = DAY_WIDTH;

const GRID_PADDING = 12;
const GRID_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GRID_PADDING * 2;
const GRID_CELL = Math.floor(GRID_WIDTH / 7);

function getMonthDays(year: number, month: number) {
  const days: Date[] = [];
  const count = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= count; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type Props = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export function Calendar({ selectedDate, onSelectDate }: Props) {
  const { i18n } = useTranslation();
  const locale = i18n.language === "tr" ? "tr-TR" : "en-US";
  const today = useMemo(() => new Date(), []);
  const [expanded, setExpanded] = useState(false);
  const [viewingDate, setViewingDate] = useState(selectedDate);

  const days = useMemo(
    () => getMonthDays(selectedDate.getFullYear(), selectedDate.getMonth()),
    [selectedDate.getFullYear(), selectedDate.getMonth()],
  );
  const listRef = useRef<FlatList>(null);

  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale],
  );
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long" }),
    [locale],
  );
  const monthYearFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
    [locale],
  );

  const initialIndex = Math.max(0, days.findIndex((d) => isSameDay(d, selectedDate)));

  const renderItem = useCallback(
    ({ item }: { item: Date }) => {
      const selected = isSameDay(item, selectedDate);
      const isToday = isSameDay(item, today);
      const dayName = dayFormatter.format(item);
      const dayLabel = dayName.charAt(0).toUpperCase() + dayName.slice(1).replace(".", "");

      return (
        <Pressable
          onPress={() => onSelectDate(item)}
          style={[styles.dayItem, !selected && { opacity: 0.7 }]}
        >
          <View style={[styles.dayNumberContainer, isToday && styles.dayNumberToday, selected && styles.dayNumberSelected]}>
            <Text style={[styles.dayNumber, selected && styles.dayNumberTextSelected]}>
              {String(item.getDate()).padStart(2, "0")}
            </Text>
          </View>
          <Text style={[styles.dayName, selected && styles.dayNameSelected]}>
            {dayLabel}
          </Text>
        </Pressable>
      );
    },
    [selectedDate, today, dayFormatter, onSelectDate],
  );

  const monthLabel = monthFormatter.format(selectedDate);
  const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const toggleExpanded = useCallback(() => {
    if (!expanded) setViewingDate(selectedDate);
    setExpanded((v) => !v);
  }, [expanded, selectedDate]);

  // Full calendar grid
  const gridDays = useMemo(
    () => getMonthDays(viewingDate.getFullYear(), viewingDate.getMonth()),
    [viewingDate.getFullYear(), viewingDate.getMonth()],
  );

  const weekdayHeaders = useMemo(() => {
    const headers: string[] = [];
    // Monday-first week: start from a known Monday (2024-01-01)
    for (let i = 0; i < 7; i++) {
      const d = new Date(2024, 0, 1 + i); // 2024-01-01 is Monday
      const label = dayFormatter.format(d);
      headers.push(label.charAt(0).toUpperCase() + label.slice(1).replace(".", ""));
    }
    return headers;
  }, [dayFormatter]);

  const firstDayOffset = useMemo(() => {
    const first = new Date(viewingDate.getFullYear(), viewingDate.getMonth(), 1);
    const dow = first.getDay(); // 0=Sun
    return dow === 0 ? 6 : dow - 1; // Monday-first
  }, [viewingDate.getFullYear(), viewingDate.getMonth()]);

  const goToPrevMonth = useCallback(() => {
    setViewingDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewingDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    setViewingDate(today);
    onSelectDate(today);
  }, [today, onSelectDate]);

  const selectGridDay = useCallback(
    (date: Date) => {
      onSelectDate(date);
      setExpanded(false);
    },
    [onSelectDate],
  );

  const gridMonthLabel = monthYearFormatter.format(viewingDate);
  const capitalizedGridMonth = gridMonthLabel.charAt(0).toUpperCase() + gridMonthLabel.slice(1);

  return (
    <View>
      {!expanded && (
        <Animated.View
          key="strip"
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={styles.container}
        >
          <FlatList
            ref={listRef}
            data={days}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.toISOString()}
            renderItem={renderItem}
            getItemLayout={(_, index) => ({
              length: ITEM_WIDTH,
              offset: ITEM_WIDTH * index,
              index,
            })}
            initialScrollIndex={initialIndex}
            contentContainerStyle={styles.listContent}
          />
          <Pressable onPress={toggleExpanded} style={styles.monthButton}>
            <SymbolView name="calendar" size={20} tintColor={colors.primary} />
            <Text style={styles.monthText}>{capitalizedMonth}</Text>
          </Pressable>
        </Animated.View>
      )}

      {expanded && (
        <Animated.View
          key="grid"
          entering={FadeInUp.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.grid}
        >
          <View style={styles.gridHeader}>
            <View style={styles.gridHeaderLeft}>
              <Pressable onPress={goToPrevMonth} hitSlop={12}>
                <SymbolView name="chevron.left" size={16} tintColor={colors.primary} />
              </Pressable>
              <Text style={styles.gridMonthText}>{capitalizedGridMonth}</Text>
              <Pressable onPress={goToNextMonth} hitSlop={12}>
                <SymbolView name="chevron.right" size={16} tintColor={colors.primary} />
              </Pressable>
            </View>
            <View style={styles.gridHeaderRight}>
              <Pressable onPress={goToToday} hitSlop={12}>
                <SymbolView name="arrow.uturn.backward" size={18} tintColor={colors.primary} />
              </Pressable>
              <Pressable onPress={() => setExpanded(false)} style={styles.closeButton}>
                <SymbolView name="xmark" size={12} tintColor={colors.primary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.gridWeekdays}>
            {weekdayHeaders.map((h) => (
              <Text key={h} style={styles.gridWeekdayText}>
                {h}
              </Text>
            ))}
          </View>

          <View style={styles.gridBody}>
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.gridCell} />
            ))}
            {gridDays.map((d) => {
              const isToday = isSameDay(d, today);
              const isSelected = isSameDay(d, selectedDate);
              return (
                <Pressable
                  key={d.toISOString()}
                  onPress={() => selectGridDay(d)}
                  style={styles.gridCell}
                >
                  <View
                    style={[
                      styles.gridDayCircle,
                      isToday && styles.gridDayToday,
                      isSelected && styles.gridDaySelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.gridDayText,
                        isSelected && styles.gridDayTextSelected,
                      ]}
                    >
                      {d.getDate()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBFCF4",
    borderRadius: 16,
    paddingVertical: 8,
  },
  listContent: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  dayItem: {
    width: DAY_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumberContainer: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  dayNumberToday: {
    backgroundColor: "#D3E194",
  },
  dayNumberSelected: {
    backgroundColor: colors.primary,
  },
  dayNumberTextSelected: {
    color: "#fff",
  },
  dayNumber: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: colors.primary,
  },
  dayName: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: colors.primary,
    marginTop: 0,
  },
  dayNameSelected: {
    fontFamily: "Inter_600SemiBold",
  },
  monthButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    gap: 2,
  },
  monthText: {
    fontSize: 11,
    color: colors.primary,
    fontFamily: "Inter_500Medium",
  },

  // Full calendar grid
  grid: {
    marginTop: 16,
    backgroundColor: "#FBFCF4",
    borderRadius: 16,
    padding: GRID_PADDING,
  },
  gridHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  gridHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  gridHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  gridMonthText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: colors.primary,
  },
  gridWeekdays: {
    flexDirection: "row",
    marginBottom: 4,
  },
  gridWeekdayText: {
    width: GRID_CELL,
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: colors.primary,
    opacity: 0.5,
  },
  gridBody: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridCell: {
    width: GRID_CELL,
    height: GRID_CELL - 6,
    alignItems: "center",
    justifyContent: "center",
  },
  gridDayCircle: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  gridDayToday: {
    backgroundColor: "#D3E194",
  },
  gridDaySelected: {
    backgroundColor: colors.primary,
  },
  gridDayText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.primary,
  },
  gridDayTextSelected: {
    color: "#fff",
  },
});
