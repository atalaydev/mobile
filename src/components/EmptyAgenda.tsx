import { Text } from "@/components/Text";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

type EmptyAgendaProps = {
  onExplore?: () => void;
};

export function EmptyAgenda({ onExplore }: EmptyAgendaProps) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.container}>
      <Text style={styles.message}>
        {t("agenda.emptyMessage")}
      </Text>
      <Pressable style={styles.button} onPress={onExplore}>
        <Text style={styles.buttonText}>{t("agenda.explore")}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E2EBB7",
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#336B57",
  },
  message: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#183228",
    lineHeight: 30,
  },
  button: {
    backgroundColor: "#336B57",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: "auto",
  },
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#fff",
  },
});
