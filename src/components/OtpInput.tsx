import { useCallback, useRef } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Text } from "@/components/Text";

type OtpInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
};

export function OtpInput({ value, onChangeText, length = 6 }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);

  const handlePress = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, "").slice(0, length);
      onChangeText(digits);
    },
    [length, onChangeText]
  );

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.container}>
        {Array.from({ length }, (_, i) => {
          const isFocused = i === value.length;
          return (
            <View
              key={i}
              style={[
                styles.cell,
                isFocused && styles.cellFocused,
                value[i] != null && styles.cellFilled,
              ]}
            >
              <Text style={styles.cellText}>{value[i] ?? ""}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  cell: {
    width: 42,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E8EBEA",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cellFocused: {
    borderColor: "#336B57",
  },
  cellFilled: {
    backgroundColor: "#F0F7F4",
  },
  cellText: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: "#183228",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
});
