import { Header } from "@/components/Header";
import { HeaderProvider } from "@/contexts/HeaderContext";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { View, StyleSheet } from "react-native";

export default function AppLayout() {
  return (
    <HeaderProvider>
      <View style={styles.root}>
        <Header />
        <NativeTabs tintColor="#336B57">
          <NativeTabs.Trigger name="index" hidden />
          <NativeTabs.Trigger name="agenda">
            <NativeTabs.Trigger.Icon sf="calendar" />
            <NativeTabs.Trigger.Label>Agenda</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="explore">
            <NativeTabs.Trigger.Icon sf="safari" />
            <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="library">
            <NativeTabs.Trigger.Icon sf="books.vertical" />
            <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="profile">
            <NativeTabs.Trigger.Icon sf="person.crop.circle" />
            <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        </NativeTabs>
      </View>
    </HeaderProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
