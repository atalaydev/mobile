import { colors } from "@/constants/colors";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, FlatList, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";

const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 20;
const MONTH_BUTTON_WIDTH = 56;
const LIST_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - MONTH_BUTTON_WIDTH;
const DAY_WIDTH = Math.floor(LIST_WIDTH / 5.5);
const ITEM_WIDTH = DAY_WIDTH;

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
  const today = useMemo(() => new Date(), []); // used by scrollToToday
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
          <View style={[styles.dayNumberContainer, isToday && styles.dayNumberToday]}>
            <Text style={styles.dayNumber}>
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

  const scrollToToday = useCallback(() => {
    onSelectDate(today);
  }, [today, onSelectDate]);

  return (
    <View style={styles.container}>
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
      <Pressable onPress={scrollToToday} style={styles.monthButton}>
        <SymbolView name="calendar" size={20} tintColor={colors.primary} />
        <Text style={styles.monthText}>{capitalizedMonth}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBFCF4",
    borderRadius: 16,
    paddingVertical: 8,
    marginTop: 16,
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
});
