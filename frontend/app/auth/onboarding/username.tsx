import { useState } from "react";
import { router } from "expo-router";
import { KeyboardAvoidingView, Platform, View, Text } from "react-native";
import { FormTextInput, FormButton, BackButton } from "@/components";
import { globalStyles } from "@/styles/globalStyles";
import { AUTH } from "@/styles/authStyles";
import { useAuth } from "@/lib/auth-context";
import { useOnboarding } from "@/lib/onboarding-context";
import { submitOnboarding, OnboardingRequest } from "@/api/endpoints";

export default function UsernameScreen() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { completeOnboarding } = useAuth();
  const { data, updateUsername, resetData } = useOnboarding();

  const handleSubmit = async () => {
    if (!username) {
      setError("Please enter a username");
      return;
    }

    // Validate required data
    if (!data.firstName || !data.lastName) {
      setError(
        "Missing onboarding information. Please go back and complete all steps."
      );
      return;
    }

    setError(null);
    setLoading(true);

    try {
      updateUsername(username);

      // Prepare onboarding payload - use placeholder class_id for now
      const payload: OnboardingRequest = {
        first_name: data.firstName,
        last_name: data.lastName,
        class_id: 1, // Temporary placeholder - skip class selection
        workout_schedule: data.workoutSchedule,
        username: username,
      };

      await submitOnboarding(payload);
      await completeOnboarding();
      resetData();
      router.replace("/(tabs)/character");
    } catch (err) {
      console.error("Onboarding completion error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={globalStyles.centerContainer}
    >
      <BackButton />
      <Text style={AUTH.title}>What should we call your new character?</Text>

      <View style={globalStyles.formContainer}>
        <FormTextInput
          label="Username"
          placeholder="JDoe"
          value={username}
          onChangeText={setUsername}
        />

        {error && (
          <Text style={{ color: "red", marginVertical: 8 }}>{error}</Text>
        )}

        <FormButton
          mode="contained"
          title={loading ? "Creating..." : "Start"}
          onPress={handleSubmit}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
