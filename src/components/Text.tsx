import { Text as RNText, type TextProps, StyleSheet } from "react-native";

export function Text({ style, ...props }: TextProps) {
  return <RNText style={[styles.default, style]} {...props} />;
}

const styles = StyleSheet.create({
  default: {
    fontFamily: "Inter_400Regular",
  },
});
