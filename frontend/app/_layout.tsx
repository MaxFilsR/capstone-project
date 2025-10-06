import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import SplashScreen from "../components/SplashScreen";

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <AuthProvider>
      <InnerStack />
    </AuthProvider>
  );
}

function InnerStack() {
  const { user } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitle: "",
        headerShadowVisible: false,
      }}
    >
      {/* Protected stack for logged-in users */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Protected stack for guests */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
