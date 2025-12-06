/**
 * Change Password Screen
 *
 * Settings screen for updating user's password with validation.
 * Requires current password and enforces password requirements:
 * 8-255 characters, must match confirmation.
 */

import { useState } from "react";
import { KeyboardAvoidingView, Platform, View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colorPallet } from "@/styles/variables";
import { typography, containers } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { FormTextInput, FormButton, BackButton } from "@/components";
import { updatePassword } from "@/api/endpoints";
import axios from "axios";

// ============================================================================
// Component
// ============================================================================

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validate and submit password change
  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 255) {
      setError("Password must be between 8 and 255 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (oldPassword === newPassword) {
      setError("New password must be different from old password");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // update password
      await updatePassword({
        current_password: oldPassword,
        new_password: newPassword,
      });

      router.back();
    } catch (err: unknown) {
      console.error("Password update error:", err);

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const serverMessage =
            typeof err.response.data === "string"
              ? err.response.data
              : JSON.stringify(err.response.data);
          setError(`${serverMessage}`);
        } else if (err.request) {
          setError("No response from server. Please try again.");
        } else {
          setError(`Request setup error: ${err.message}`);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[containers.centerContainer, styles.container]}
    >
      <BackButton />

      {/* title with Icon */}
      <View style={styles.titleContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={28}
          color={colorPallet.primary}
          style={styles.titleIcon}
        />
        <Text style={[typography.h1, styles.title]}>Change Password</Text>
      </View>

      <View style={containers.formContainer}>
        {/* old password input */}
        <FormTextInput
          label="Current Password"
          placeholder="••••••••"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />

        {/* new password input */}
        <FormTextInput
          label="New Password"
          placeholder="••••••••"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        {/* confirm new password input */}
        <FormTextInput
          label="Confirm New Password"
          placeholder="••••••••"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* password requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementText}>
            Password must be 8-255 characters
          </Text>
        </View>

        {error && <Text style={typography.errorText}>{error}</Text>}

        <FormButton
          mode="contained"
          title={loading ? "Saving..." : "Save Changes"}
          onPress={handleSubmit}
          disabled={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    color: colorPallet.neutral_lightest,
  },
  requirementsContainer: {
    marginTop: 4,
    marginBottom: 24,
  },
  requirementText: {
    ...typography.body,
    color: colorPallet.neutral_2,
    fontSize: 13,
  },
});