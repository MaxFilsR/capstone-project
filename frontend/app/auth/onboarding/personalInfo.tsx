import { useState } from "react";
import { router } from "expo-router";
import { KeyboardAvoidingView, Platform, View, Text } from "react-native";
import { FormTextInput, FormButton } from "@/components";
import { typography, containers } from "@/styles/index";
import { colorPallet } from "@/styles/variables";
import { BackButton } from "@/components";

export default function PersonalInfoScreen() {
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    router.push("./workoutStyle"); //next step
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={containers.centerContainer}
    >
      <BackButton />
      <Text
        style={[
          typography.h1,
          { color: colorPallet.neutral_lightest, textAlign: "center" },
        ]}
      >
        What should we call you?
      </Text>
      <View style={containers.formContainer}>
        <FormTextInput
          label="First Name"
          placeholder="John"
          value={fName}
          onChangeText={setFName}
        />

        <FormTextInput
          label="Last Name"
          placeholder="Doe"
          value={lName}
          onChangeText={setLName}
        />

        {error && (
          <Text style={{ color: "red", marginVertical: 8 }}>{error}</Text>
        )}

        <FormButton mode="contained" title="Next" onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}
