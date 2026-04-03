import { Text } from "@/components/Text";
import { useAuth } from "@/contexts/AuthContext";
import { useHeader } from "@/contexts/HeaderContext";
import * as Burnt from "burnt";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { setVariant } = useHeader();
  const { logout } = useAuth();

  useFocusEffect(
    useCallback(() => {
      setVariant("light");
    }, [setVariant])
  );

  const handleLogout = async () => {
    try {
      await logout();
      Burnt.toast({
        title: t("profile.logoutSuccess"),
        preset: "done",
        haptic: "success",
      });
    } catch {
      Burnt.toast({
        title: t("profile.logoutFailed"),
        preset: "error",
        haptic: "error",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("profile.title")}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>{t("profile.logout")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: "auto",
    marginBottom: 120,
    height: 50,
    backgroundColor: "#DC3545",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
