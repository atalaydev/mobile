import { Text } from "@/components/Text";
import { StyleSheet, View } from "react-native";

type ChipProps = {
  label: string;
  variant?: "outline" | "filled";
};

export function Chip({ label, variant = "filled" }: ChipProps) {
  return (
    <View style={[styles.chip, variant === "outline" ? styles.outline : styles.filled]}>
      <Text style={[styles.text, variant === "outline" ? styles.outlineText : styles.filledText]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filled: {
    backgroundColor: "#C1D5CE",
  },
  outline: {
    borderWidth: 1,
    borderColor: "#336B57",
  },
  text: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  filledText: {
    color: "#336B57",
  },
  outlineText: {
    color: "#336B57",
  },
});
