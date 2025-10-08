import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import SplashScreen from "../components/SplashScreen";
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

  return <InnerStack />;
}

function InnerStack() {
  // Hardcoded logged-in variable
  const loggedIn = false; // change to true to simulate logged-in user

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitle: "",
        headerShadowVisible: false,
      }}
    >
      {loggedIn ? (
        // Stack for logged-in users
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        // Stack for guests
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
