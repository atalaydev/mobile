import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Text";

export default function SupportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Support</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
});
