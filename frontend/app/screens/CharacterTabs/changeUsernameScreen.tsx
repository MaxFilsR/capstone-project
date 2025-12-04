import { useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colorPallet } from "@/styles/variables";
import { typography, containers } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { FormTextInput, FormButton, BackButton } from "@/components";
import { getCharacter, updateUsername } from "@/api/endpoints";
import axios from "axios";

export default function ChangeUsernameScreen() {
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getCharacter();
        setCurrentUsername(profile.username);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load current username");
      } finally {
        setFetchingProfile(false);
      }
    }

    loadProfile();
  }, []);

  // validate and submit username change
  const handleSubmit = async () => {
    if (!newUsername) {
      setError("Please enter a username");
      return;
    }

    if (newUsername === currentUsername) {
      setError("New username must be different from current username");
      return;
    }

    if (newUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (newUsername.length > 20) {
      setError("Username must be less than 20 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // call API to update username
      await updateUsername({ username: newUsername });

      router.back();
    } catch (err: unknown) {
      console.error("Username update error:", err);

      // handle different error types
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

  if (fetchingProfile) {
    return (
      <View style={[containers.centerContainer, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text
          style={[
            typography.body,
            { color: colorPallet.neutral_lightest, marginTop: 16 },
          ]}
        >
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[containers.centerContainer, styles.container]}
    >
      <BackButton />

      {/* title with icon */}
      <View style={styles.titleContainer}>
        <Ionicons
          name="at-outline"
          size={28}
          color={colorPallet.primary}
          style={styles.titleIcon}
        />
        <Text style={[typography.h1, styles.title]}>
          Change Username
        </Text>
      </View>

      <View style={containers.formContainer}>
        {/* current username display card */}
        <View style={styles.currentUsernameCard}>
          <Text style={styles.currentUsernameLabel}>
            CURRENT USERNAME
          </Text>
          <Text style={styles.currentUsernameValue}>
            @{currentUsername}
          </Text>
        </View>

        {/* new username input */}
        <FormTextInput
          label="New Username"
          placeholder="Enter new username"
          value={newUsername}
          onChangeText={setNewUsername}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
        />

        {/* username requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementText}>
            3-20 characters
          </Text>
          <Text style={styles.requirementText}>
            Letters, numbers, and underscores only
          </Text>
        </View>

        {/* error message */}
        {error && <Text style={typography.errorText}>{error}</Text>}

        {/* submit button */}
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
  currentUsernameCard: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  currentUsernameLabel: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  currentUsernameValue: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    fontSize: 18,
    fontWeight: "700",
  },
  requirementsContainer: {
    marginTop: 4,
    marginBottom: 24,
  },
  requirementText: {
    ...typography.body,
    color: colorPallet.neutral_2,
    fontSize: 13,
    marginBottom: 4,
  },
});


