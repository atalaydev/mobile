import { Text } from "@/components/Text";
import { useHeader } from "@/contexts/HeaderContext";
import { useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, StyleSheet, View } from "react-native";

export default function ExploreScreen() {
  const { setVariant } = useHeader();
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      setVariant("light");
    }, [setVariant])
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t("explore.comingSoon")}</Text>
        </View>
        <Text style={styles.message}>{t("explore.description")}</Text>
        <Pressable style={styles.button} onPress={() => Linking.openURL("https://mibosowellbeing.com")}>
          <Text style={styles.buttonText}>{t("explore.visit")}</Text>
          <SymbolView name="arrow.up.right" size={14} tintColor="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "#F1F4EC",
  },
  card: {
    flex: 1,
    backgroundColor: "#C1D5CE",
    borderRadius: 20,
    padding: 20,
    gap: 12,
    marginBottom: 100,
  },
  badge: {
    backgroundColor: "#336B5720",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#336B57",
    letterSpacing: 0.3,
  },
  message: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#183228",
    lineHeight: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#336B57",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: "auto",
  },
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#fff",
  },
});
