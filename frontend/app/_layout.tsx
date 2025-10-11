import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Anton_400Regular } from "@expo-google-fonts/anton";
import * as SecureStore from "expo-secure-store";

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Anton_400Regular,
  });

  if (showSplash || !fontsLoaded) return <SplashScreen />;

  return (
    <AuthProvider>
      <InnerStack />
    </AuthProvider>
  );
}

function InnerStack() {
  const { user } = useAuth();
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingUser(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loadingUser) return <SplashScreen />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitle: "",
        headerShadowVisible: false,
      }}
    >
      {/* Main app - for authenticated AND onboarded users */}
      <Stack.Protected guard={!!user && user.onboarded === true}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Auth folder - handles both login AND onboarding */}
      <Stack.Protected guard={!user || user.onboarded !== true}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
