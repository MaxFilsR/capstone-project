// app/onboarding/_layout.tsx
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitle: "",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="accountDetails" options={{ headerShown: false }} />
      <Stack.Screen name="personalInfo" options={{ headerShown: false }} />
    </Stack>
  );
}
