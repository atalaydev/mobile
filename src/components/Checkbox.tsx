import { Text } from "@/components/Text";
import { Pressable, StyleSheet, View } from "react-native";

type CheckboxProps = {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  error?: boolean;
};

export function Checkbox({ checked, onToggle, children, error }: CheckboxProps) {
  return (
    <Pressable style={styles.container} onPress={onToggle}>
      <View style={[styles.box, checked && styles.boxChecked, error && !checked && styles.boxError]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.content}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  box: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#E8EBEA",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  boxChecked: {
    backgroundColor: "#336B57",
    borderColor: "#336B57",
  },
  boxError: {
    borderColor: "#DC3545",
  },
  checkmark: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    flex: 1,
  },
});
