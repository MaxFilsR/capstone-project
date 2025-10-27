import { AuthProvider, useAuth } from "@/lib/auth-context";
import { router, Stack } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import SplashScreen from "@/components/SplashScreen";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Anton_400Regular } from "@expo-google-fonts/anton";
import { WorkoutLibraryProvider } from "@/lib/workout-library-context";
import { RoutinesProvider } from "@/lib/routines-context";

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
      <WorkoutLibraryProvider>
        <RoutinesProvider>
          <InnerStack />
        </RoutinesProvider>
      </WorkoutLibraryProvider>
    </AuthProvider>
  );
}

function InnerStack() {
  const { user, fetchUserProfile, logout } = useAuth();
  const [loadingUser, setLoadingUser] = useState(true);
  const hasFetchedProfile = useRef(false);

  useEffect(() => {
    async function verifyUser() {
      if (!user) {
        hasFetchedProfile.current = false;
        setLoadingUser(false);
        router.replace("/auth/logIn");
        return;
      }

      if (user.onboarded !== true) {
        setLoadingUser(false);
        return;
      }

      if (hasFetchedProfile.current) return;
      hasFetchedProfile.current = true;

      try {
        await fetchUserProfile();
      } catch (err) {
        console.warn("Failed to load user profile:", err);
        await logout();
      } finally {
        setLoadingUser(false);
      }
    }

    verifyUser();
  }, [user]);

  if (loadingUser) return <SplashScreen />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitle: "",
        headerShadowVisible: false,
      }}
    >
      <Stack.Protected guard={!!user && user.onboarded === true}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!user || user.onboarded !== true}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
