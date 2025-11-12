import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";
import { typography, popupModalStyles } from "@/styles";
import { FormButton } from "@/components";
import Alert from "./Alert";

type SettingsScreenProps = {
  onClose: () => void;
  onLogout: () => void;
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onClose,
  onLogout,
}) => {
  const [alert, setAlert] = useState<{
    visible: boolean;
    mode: "alert" | "success" | "error" | "confirmAction";
    title: string;
    message: string;
  }>({
    visible: false,
    mode: "alert",
    title: "",
    message: "",
  });

  const handleLogoutPress = () => {
    setAlert({
      visible: true,
      mode: "confirmAction",
      title: "Logout",
      message: "Are you sure you want to logout?",
    });
  };

  const handleAlertConfirm = () => {
    setAlert({ ...alert, visible: false });
    if (alert.mode === "confirmAction") {
      onLogout();
      onClose();
    }
  };

  const handleAlertCancel = () => {
    setAlert({ ...alert, visible: false });
  };

  // Placeholder sections - will be implemented later
  const settingsSections = [
    {
      title: "Account",
      items: [
        { icon: "person" as const, label: "Edit Username", comingSoon: true },
        { icon: "mail" as const, label: "Change Email", comingSoon: true },
        { icon: "key" as const, label: "Change Password", comingSoon: true },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: "notifications" as const,
          label: "Notifications",
          comingSoon: true,
        },
        { icon: "moon" as const, label: "Dark Mode", comingSoon: true },
        { icon: "language" as const, label: "Language", comingSoon: true },
      ],
    },
    {
      title: "About",
      items: [
        {
          icon: "information-circle" as const,
          label: "App Version",
          comingSoon: true,
        },
        {
          icon: "document-text" as const,
          label: "Terms of Service",
          comingSoon: true,
        },
        {
          icon: "shield-checkmark" as const,
          label: "Privacy Policy",
          comingSoon: true,
        },
      ],
    },
  ];

  return (
    <View style={styles.modalSize}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[typography.h2, styles.headerTitle]}>Settings</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[popupModalStyles.closeText, styles.closeText]}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 &&
                      styles.settingItemLast,
                  ]}
                  activeOpacity={item.comingSoon ? 1 : 0.7}
                  disabled={item.comingSoon}
                >
                  <View style={styles.settingItemLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={
                          item.comingSoon
                            ? colorPallet.neutral_4
                            : colorPallet.secondary
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.settingLabel,
                        item.comingSoon && styles.settingLabelDisabled,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>

                  {item.comingSoon ? (
                    <Text style={styles.comingSoonBadge}>Coming Soon</Text>
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colorPallet.neutral_3}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogoutPress}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Alert
        visible={alert.visible}
        mode={alert.mode}
        title={alert.title}
        message={alert.message}
        onConfirm={handleAlertConfirm}
        onCancel={handleAlertCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalSize: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    flexGrow: 0,
    flexShrink: 1,
    borderWidth: 1,
    borderColor: colorPallet.primary,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colorPallet.neutral_darkest,
    maxHeight: "85%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.neutral_6,
  },
  headerTitle: {
    flex: 1,
    color: colorPallet.neutral_lightest,
  },
  closeButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  closeText: {
    color: colorPallet.secondary,
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
    marginTop: -2,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingTop: 16,
    paddingHorizontal: 14,
  },
  sectionTitle: {
    ...typography.body,
    fontSize: 13,
    color: colorPallet.neutral_3,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionContent: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.neutral_5,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colorPallet.neutral_darkest,
    justifyContent: "center",
    alignItems: "center",
  },
  settingLabel: {
    ...typography.body,
    fontSize: 15,
    color: colorPallet.neutral_lightest,
    fontWeight: "600",
  },
  settingLabelDisabled: {
    color: colorPallet.neutral_4,
  },
  comingSoonBadge: {
    ...typography.body,
    fontSize: 11,
    color: colorPallet.neutral_4,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  logoutContainer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colorPallet.neutral_6,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colorPallet.critical,
    paddingVertical: 14,
    borderRadius: 8,
  },
  logoutButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});

export default SettingsScreen;
