/**
 * Settings Screen
 *
 * Main settings menu providing navigation to all account settings.
 * Includes change username, change email, change password, edit name, change workout schedule, and change class options.
 */
import React from "react";
import { Text, ScrollView, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { BackButton } from "@/components";
import { useAuth } from "@/lib/auth-context";

// ============================================================================
// Types
// ============================================================================

type SettingsItem = {
  title: string;
  route: string;
  icon: string;
};

// ============================================================================
// Component
// ============================================================================

const SettingScreen = () => {
  const { logout } = useAuth();

  // user account settings
  const accountSettings: SettingsItem[] = [
    {
      title: "Change Username",
      route: "/screens/CharacterTabs/changeUsernameScreen",
      icon: "at-outline",
    },
    {
      title: "Change Email",
      route: "/screens/CharacterTabs/changeEmailScreen",
      icon: "mail-outline",
    },
    {
      title: "Change Password",
      route: "/screens/CharacterTabs/changePasswordScreen",
      icon: "lock-closed-outline",
    },
    {
      title: "Edit Name",
      route: "/screens/CharacterTabs/editNameScreen",
      icon: "person-outline",
    },
    {
      title: "Workout Schedule",
      route: "/screens/CharacterTabs/workoutScheduleScreen",
      icon: "calendar-outline",
    },
    {
      title: "Change Class",
      route: "/screens/CharacterTabs/changeClassScreen",
      icon: "shield-outline",
    },
  ];

  // Navigate to settings screen
  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  // Confirm before log out
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Double confirmation before deleting account
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "Are you sure?",
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                {
                  text: "Yes, Delete My Account",
                  style: "destructive",
                  onPress: () => {
                    console.log("Deleting account...")
                      //api delete account
                  },
                },
              ]
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Render individual settings item with icon and chevron
  const renderSettingsItem = (item: SettingsItem) => (
    <TouchableOpacity
      key={item.title}
      style={styles.settingsItem}
      onPress={() => handleNavigation(item.route)}
      activeOpacity={0.7}
    >
      {/* icon */}
      <View style={styles.settingsItemLeft}>
        <Ionicons
          name={item.icon}
          size={22}
          color={colorPallet.primary}
          style={styles.settingsIcon}
        />
        {/* setting title */}
        <Text style={styles.settingsItemText}>{item.title}</Text>
      </View>

      {/* chevron arrow */}
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={colorPallet.neutral_4}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* back button */}
      <BackButton />

      {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* account section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.sectionCard}>
            {accountSettings.map(renderSettingsItem)}
          </View>
        </View>

        {/* log out */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colorPallet.neutral_darkest}
            style={styles.buttonIcon}
          />
          <Text style={styles.logoutButtonText}>LOG OUT</Text>
        </TouchableOpacity>

        {/* delete account */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={colorPallet.critical}
            style={styles.buttonIcon}
          />
          <Text style={styles.deleteButtonText}>DELETE ACCOUNT</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    paddingTop: 80,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    ...typography.h1,
    color: colorPallet.primary,
    fontSize: 32,
    fontWeight: "800",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },

  // sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },

  //settings items
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.neutral_5,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingsIcon: {
    marginRight: 12,
  },
  settingsItemText: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    fontSize: 16,
    fontWeight: "600",
  },

  // logout button
  logoutButton: {
    backgroundColor: colorPallet.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  logoutButtonText: {
    ...typography.body,
    color: colorPallet.neutral_darkest,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // delete button
  deleteButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colorPallet.critical,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 20,
  },
  deleteButtonText: {
    ...typography.body,
    color: colorPallet.critical,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default SettingScreen;