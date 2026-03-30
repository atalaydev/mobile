import { useAuth } from "@/contexts/AuthContext";
import * as Burnt from "burnt";
import { useHeader } from "@/contexts/HeaderContext";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/Text";

export default function ProfileScreen() {
  const { setBackgroundColor } = useHeader();
  const { logout } = useAuth();

  useFocusEffect(
    useCallback(() => {
      setBackgroundColor(undefined);
    }, [setBackgroundColor])
  );

  const handleLogout = async () => {
    try {
      await logout();
      Burnt.toast({
        title: "Çıkış yapıldı.",
        preset: "done",
        haptic: "success",
      });
    } catch (error) {
      Burnt.toast({
        title: "Çıkış yapılamadı.",
        preset: "error",
        haptic: "error",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
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
