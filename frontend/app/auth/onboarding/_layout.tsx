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
    />
  );
}
