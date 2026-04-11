import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="library/event/[id]/[paymentId]" options={{ presentation: "fullScreenModal" }} />
      <Stack.Screen name="library/session/[id]/[paymentId]" options={{ presentation: "fullScreenModal" }} />
      <Stack.Screen name="schedule/[sessionOptionId]/[appointmentId]" options={{ presentation: "formSheet" }} />
      <Stack.Screen name="watch" options={{ presentation: "fullScreenModal" }} />
      <Stack.Screen name="zoom" options={{ presentation: "fullScreenModal" }} />
      <Stack.Screen name="notifications" options={{ presentation: "formSheet", headerShown: true, headerTitle: "Bildirimler" }} />
    </Stack>
  );
}
