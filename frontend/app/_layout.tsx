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
import { WorkoutLibraryProvider } from "@/lib/workout-library-context";
import { RoutinesProvider } from "@/lib/routines-context";
import { storage } from "@/utils/storageHelper";
import { FriendsProvider } from "@/lib/friends-context";
import { QuestProvider } from "@/lib/quest-context";
import { InventoryProvider } from "@/lib/inventory-context";

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
      <InnerProviders />
    </AuthProvider>
  );
}

function InnerProviders() {
  const { user } = useAuth();

  return (
    <WorkoutLibraryProvider>
      <RoutinesProvider>
        <FriendsProvider>
          <InventoryProvider>
            <QuestProvider>
              <InnerStack />
            </QuestProvider>
          </InventoryProvider>
        </FriendsProvider>
      </RoutinesProvider>
    </WorkoutLibraryProvider>
  );
}

function InnerStack() {
  const { user, fetchUserProfile, logout } = useAuth();
  const [loadingUser, setLoadingUser] = useState(true);
  const hasFetchedProfile = useRef(false);

  useEffect(() => {
    async function verifyUser() {
      const token = await storage.getItem("accessToken");

      if (!token || !user) {
        hasFetchedProfile.current = false;
        setLoadingUser(false);
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