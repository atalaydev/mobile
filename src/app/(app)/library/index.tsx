import { useHeader } from "@/contexts/HeaderContext";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Text } from "@/components/Text";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LibraryScreen() {
  const { setBackgroundColor } = useHeader();

  useFocusEffect(
    useCallback(() => {
      setBackgroundColor(undefined);
    }, [setBackgroundColor])
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={{ fontSize: 24 }}>Library</Text>
    </SafeAreaView>
  );
}
