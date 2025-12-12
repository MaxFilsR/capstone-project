/**
 * Personal Info Screen
 *
 * First onboarding step where users input their first and last name.
 */

import { useState } from "react";
import { router } from "expo-router";
import { KeyboardAvoidingView, Platform, View, Text } from "react-native";
import { FormTextInput, FormButton, BackButton } from "@/components";
import { typography, containers } from "@/styles/index";
import { colorPallet } from "@/styles/variables";
import { useOnboarding } from "@/lib/onboarding-context";


// ============================================================================
// Component
// ============================================================================


export default function PersonalInfoScreen() {
  const { data, updateFirstName, updateLastName } = useOnboarding();
  const [fName, setFName] = useState(data.firstName);
  const [lName, setLName] = useState(data.lastName);
  const [error, setError] = useState<string | null>(null);


  /**
   * Validate form and save to context, then navigate to next step
   */
  const handleSubmit = () => {
    if (!fName || !lName) {
      setError("Please fill in both fields");
      return;
    }

    setError(null);

    // Save to onboarding context
    updateFirstName(fName);
    updateLastName(lName);

    // Navigate to workout style selection
    router.push("/auth/onboarding/workoutStyle"); // Next step
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={containers.centerContainer}
    >
      {/* Back button */}
      <BackButton />

      {/* Title */}
      <Text
        style={[
          typography.h1,
          { color: colorPallet.neutral_lightest, textAlign: "center" },
        ]}
      >
        What should we call you?
      </Text>

      {/* Form container */}
      <View style={containers.formContainer}>
        {/* First name input */}
        <FormTextInput
          label="First Name"
          placeholder="John"
          value={fName}
          onChangeText={setFName}
        />

        {/* Last name input */}
        <FormTextInput
          label="Last Name"
          placeholder="Doe"
          value={lName}
          onChangeText={setLName}
        />

        {/* Error message */}
        {error && (
          <Text style={{ color: "red", marginVertical: 8 }}>{error}</Text>
        )}

        {/* Submit button */}
        <FormButton mode="contained" title="Next" onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}
