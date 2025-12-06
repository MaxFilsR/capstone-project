/**
 * Tabs Layout
 *
 * Main navigation configuration for the app's bottom tab bar.
 * Defines 5 primary tabs: Quests, Fitness, Summary, Social, and Character.
 */

import { Tabs } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// ============================================================================
// Component
// ============================================================================

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: "#8CE61A",
        tabBarInactiveTintColor: "#AAAAAA",
        tabBarActiveBackgroundColor: "#090909",
        tabBarInactiveBackgroundColor: "#090909",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#090909", // your desired background
          borderTopWidth: 1,
          position: "absolute", // helps cover bottom inset
        },
      }}
    >

      {/* Quests Tab */}
      <Tabs.Screen
        name="quests"
        options={{
          title: "Quests",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="task" size={24} color={color} />
          ),
        }}
      />

      {/* Fitness Tab */}
      <Tabs.Screen
        name="fitness"
        options={{
          title: "Fitness",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="fitness-center" size={24} color={color} />
          ),
        }}
      />

      {/* Summary Tab (Home) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Summary",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="area-chart" size={24} color={color} />
          ),
        }}
      />

      {/* Social Tab */}
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="castle" size={24} color={color} />
          ),
        }}
      />

      {/* Character Tab */}
      <Tabs.Screen
        name="character"
        options={{
          title: "Character",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="tag-faces" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
