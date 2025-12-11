/**
 * Social Tab Screen
 *
 * Main social screen with Friends and Leaderboard tabs.
 * Features custom header with search button that opens a modal
 * for finding and adding new friends.
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Pressable,
  Text,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TabBar, { Tab } from "@/components/TabBar";
import FriendsScreen from "../screens/SocialTabs/FriendsScreen";
import LeaderboardScreen from "../screens/SocialTabs/LeaderboardScreen";
import NewFriendSearchScreen from "../screens/SocialTabs/NewFriendSearchScreen";
import QuickActionButton from "@/components/QuickActionButton";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { containers } from "@/styles";
import { Ionicons } from "@expo/vector-icons";

// ============================================================================
// Component
// ============================================================================

const SocialScreen = () => {
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Tab configuration for Friends and Leaderboard
  const tabs: Tab[] = [
    { name: "Friends", component: FriendsScreen },
    { name: "Leaderboard", component: LeaderboardScreen },
  ];

  // Open friend search modal
  const handleSearchPress = () => {
    setShowSearchModal(true);
  };

  // Close friend search modal
  const handleCloseSearch = () => {
    setShowSearchModal(false);
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

        {/* Search Modal */}
        <Modal
          visible={showSearchModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseSearch}
        >
          <SafeAreaView
            style={styles.modalContainer}
            edges={["top", "left", "right"]}
          >
            <View style={styles.modalHeader}>
              <Pressable
                onPress={handleCloseSearch}
                style={styles.closeButton}
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={28}
                  color={colorPallet.neutral_lightest}
                />
              </Pressable>
            </View>
            <NewFriendSearchScreen />
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

// ============================================================================
// Styles
// ============================================================================

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
  modalContainer: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
});

export default SocialScreen;
