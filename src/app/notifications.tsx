import { Text } from "@/components/Text";
import { StyleSheet, View } from "react-native";

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.empty}>Henüz bildiriminiz yok.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  empty: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#666",
  },
});
