import { Stack } from "expo-router";
import { OnboardingProvider } from "@/lib/onboarding-context";

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="personalInfo" options={{ headerShown: false }} />
        <Stack.Screen
          name="characterQuizTemp"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="preSelectedClassTemp"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="selectClass" options={{ headerShown: false }} />
        <Stack.Screen name="workoutSchedule" options={{ headerShown: false }} />
        <Stack.Screen name="username" options={{ headerShown: false }} />
      </Stack>
    </OnboardingProvider>
  );
}
