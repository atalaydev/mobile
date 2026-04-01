import { Text } from "@/components/Text";
import { Pressable, StyleSheet, View } from "react-native";

type ActivityCardProps = {
  title: string;
  time: string;
  onPress?: () => void;
};

export function ActivityCard({ title, time, onPress }: ActivityCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.dateText}>{time}</Text>
        <Pressable style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Etkinliği İncele</Text>
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
