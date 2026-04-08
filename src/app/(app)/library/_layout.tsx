import { Stack } from "expo-router";

export default function LibraryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="event/[id]/[paymentId]" options={{ presentation: "formSheet" }} />
      <Stack.Screen name="session/[id]/[paymentId]" options={{ presentation: "formSheet" }} />
    </Stack>
  );
}
