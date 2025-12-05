import { useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colorPallet } from "@/styles/variables";
import { typography, containers } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { FormTextInput, FormButton, BackButton } from "@/components";
import { getCharacter, updateName } from "@/api/endpoints";
import axios from "axios";

export default function EditNameScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        setFirstName("John");
        setLastName("Doe");
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load current name");
      } finally {
        setFetchingProfile(false);
      }
    }

    loadProfile();
  }, []);

  const handleSubmit = async () => {
    if (!firstName || !lastName) {
      setError("Please fill in both fields");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // update name
      await updateName({ first_name: firstName, last_name: lastName });

      router.back();
    } catch (err: unknown) {
      console.error("Name update error:", err);

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
          name="person-outline"
          size={28}
          color={colorPallet.primary}
          style={styles.titleIcon}
        />
        <Text style={[typography.h1, styles.title]}>Edit Name</Text>
      </View>

      <View style={containers.formContainer}>
        {/* first name input */}
        <FormTextInput
          label="First Name"
          placeholder="John"
          value={firstName}
          onChangeText={setFirstName}
        />

        {/* last name input */}
        <FormTextInput
          label="Last Name"
          placeholder="Doe"
          value={lastName}
          onChangeText={setLastName}
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
});







