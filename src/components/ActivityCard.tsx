import { Text } from "@/components/Text";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";

type ActivityCardProps = {
  title: string;
  startDate: string;
  timezone: string;
  onPress?: () => void;
};

function formatDate(dateStr: string, timeZone: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const locale = i18n.language === "tr" ? "tr-TR" : "en-US";
  return date.toLocaleDateString(locale, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone });
}

export function ActivityCard({ title, startDate, timezone, onPress }: ActivityCardProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.dateText}>{formatDate(startDate, timezone)}</Text>
        <Pressable style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>{t("agenda.viewDetails")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#E2EBB7",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1832281A",
    overflow: "hidden",
  },
  top: {
    backgroundColor: "#FCFCFC",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#183228",
    lineHeight: 20,
  },
  bottom: {
    backgroundColor: "#E2EBB7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#336B57",
  },
  button: {
    backgroundColor: "#336B57",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#FCFCFC",
  },
});
