import { useHeader } from "@/contexts/HeaderContext";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";

export default function ExploreScreen() {
  const { setVariant } = useHeader();

  useFocusEffect(
    useCallback(() => {
      setVariant("light");
    }, [setVariant])
  );

  return <View style={{ flex: 1 }} />;
}
