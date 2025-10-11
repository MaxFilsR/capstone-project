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

    // Validate all required data is present
    if (!data.firstName || !data.lastName || !data.classId) {
      setError(
        "Missing onboarding information. Please go back and complete all steps. " +
          data.firstName +
          " " +
          data.lastName +
          " " +
          data.classId
      );
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Update username in context
      updateUsername(username);

      // Prepare onboarding payload
      const payload: OnboardingRequest = {
        first_name: data.firstName,
        last_name: data.lastName,
        class_id: data.classId,
        workout_schedule: data.workoutSchedule,
        username: username,
      };

      // Submit to backend
      await submitOnboarding(payload);

      // Mark user as onboarded
      await completeOnboarding();

      // Reset onboarding data
      resetData();

      // Navigate to main app
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
