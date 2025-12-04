import { useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colorPallet } from "@/styles/variables";
import { typography, containers } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { FormTextInput, FormButton, BackButton } from "@/components";
import { getCharacter, updateEmail } from "@/api/endpoints";
import axios from "axios";

export default function ChangeEmailScreen() {
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        // const profile = await getCharacter();
        // setCurrentEmail(profile.email);

        setCurrentEmail("user@example.com");
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load current email");
      } finally {
        setFetchingProfile(false);
      }
    }

    loadProfile();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!newEmail || !confirmEmail) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(newEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (newEmail !== confirmEmail) {
      setError("Email addresses do not match");
      return;
    }

    if (newEmail === currentEmail) {
      setError("New email must be different from current email");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // update email
      await updateEmail({ email: newEmail });

      router.back();
    } catch (err: unknown) {
      console.error("Email update error:", err);

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

      {/* title with Icon */}
      <View style={styles.titleContainer}>
        <Ionicons
          name="mail-outline"
          size={28}
          color={colorPallet.primary}
          style={styles.titleIcon}
        />
        <Text style={[typography.h1, styles.title]}>Change Email</Text>
      </View>

      <View style={containers.formContainer}>
        {/* current email card */}
        <View style={styles.currentEmailCard}>
          <Text style={styles.currentEmailLabel}>CURRENT EMAIL</Text>
          <Text style={styles.currentEmailValue}>{currentEmail}</Text>
        </View>

        {/* new email input */}
        <FormTextInput
          label="New Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          value={newEmail}
          onChangeText={setNewEmail}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* confirm email input */}
        <FormTextInput
          label="Confirm Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          value={confirmEmail}
          onChangeText={setConfirmEmail}
          autoCapitalize="none"
          autoCorrect={false}
        />

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
  currentEmailCard: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  currentEmailLabel: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  currentEmailValue: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    fontSize: 18,
    fontWeight: "700",
  },
});


