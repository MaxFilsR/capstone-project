import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import SplashScreen from "@/components/SplashScreen";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Anton_400Regular } from "@expo-google-fonts/anton";

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
  const { user, fetchUserProfile, logout } = useAuth();
  const [loadingUser, setLoadingUser] = useState(true);
  const hasFetchedProfile = useRef(false); // <-- prevents multiple calls

  useEffect(() => {
    async function verifyUser() {
      if (hasFetchedProfile.current) return; // prevent reruns
      hasFetchedProfile.current = true;

      try {
        if (user) {
          await fetchUserProfile();
        }
      } catch (err) {
        console.warn("Failed to load user profile:", err);
        await logout();
      } finally {
        setLoadingUser(false);
      }
    }

    verifyUser();
  }, []); // <-- empty dependency array = only runs once on mount

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
