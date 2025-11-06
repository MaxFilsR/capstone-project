import React from "react";
import { View, StyleSheet, StatusBar, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TabBar, { Tab } from "@/components/TabBar";
import FriendsScreen from "../screens/SocialTabs/FriendsScreen";
import LeaderboardScreen from "../screens/SocialTabs/LeaderboardScreen";
import QuickActionButton from "@/components/QuickActionButton";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { containers } from "@/styles";
import { Ionicons } from "@expo/vector-icons";

const SocialScreen = () => {
  const tabs: Tab[] = [
    { name: "Friends", component: FriendsScreen },
    { name: "Leaderboard", component: LeaderboardScreen },
  ];

  const handleSearchPress = () => {
    // TODO: Navigate to search screen
    console.log("Search pressed - will open search screen");
  };

  return (
    <SafeAreaView style={containers.safeArea} edges={["top", "left", "right"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colorPallet.neutral_darkest}
      />
      <View style={containers.container}>
        {/* Custom Header with Search */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Social</Text>
          <Pressable
            onPress={handleSearchPress}
            style={styles.searchButton}
            hitSlop={8}
          >
            <Ionicons name="search" size={24} color={colorPallet.secondary} />
          </Pressable>
        </View>

        {/* Tab Bar without page title since we have custom header */}
        <TabBar tabs={tabs} initialTab={0} />

        {/* Quick Action Button */}
        <QuickActionButton />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  pageTitle: {
    ...typography.h1,
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
  },
});

export default SocialScreen;
