import { Text } from "@/components/Text";
import { colors } from "@/constants/colors";
import { useHeader } from "@/contexts/HeaderContext";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

const tabs = [
  { key: "events", label: "Etkinlikler", icon: "text.book.closed" },
  { key: "sessions", label: "Seanslar", icon: "doc.text" },
  { key: "digital", label: "Dijital\nÜrünler", icon: "play.circle" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function LibraryScreen() {
  const { setVariant } = useHeader();
  const [activeTab, setActiveTab] = useState<TabKey>("events");

  useFocusEffect(
    useCallback(() => {
      setVariant("light");
    }, [setVariant])
  );

  return (
    <View style={styles.root}>
      <View style={styles.bgContainer}>
        <Image
          source={require("@/assets/images/library-bg.svg")}
          style={styles.bgImage}
          contentFit="cover"
        />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Sahip Olduğunuz İçerikler</Text>
        <Text style={styles.subtitle}>
          Satın aldığınız etkinlikler ve dijital ürünler burada listelenir.
        </Text>

        <View style={styles.tabs}>
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <SymbolView
                  name={tab.icon}
                  size={24}
                  tintColor={active ? "#fff" : colors.primary}
                />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  bgContainer: {
    position: "absolute",
    top: -150,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (396 / 390),
  },
  bgImage: {
    width: "100%",
    height: "100%",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#183228",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#666",
    marginTop: 6,
    lineHeight: 20,
  },
  tabs: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  tab: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#1832281A",
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.primary,
    textAlign: "center",
  },
  tabLabelActive: {
    color: "#fff",
  },
});
