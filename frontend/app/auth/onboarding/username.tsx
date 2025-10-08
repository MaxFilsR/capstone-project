import { useState } from "react";
import { router } from "expo-router";
import { KeyboardAvoidingView, Platform, View, Text } from "react-native";
import { FormTextInput, FormButton, BackButton } from "@/components";
import { globalStyles } from "@/styles/globalStyles";
import { AUTH } from "@/styles/authStyles";

export default function UsernameScreen({
  setLoggedIn,
}: {
  setLoggedIn?: (value: boolean) => void;
}) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!username) {
      setError("Please enter a username");
      return;
    }

    setError(null);

    // Mark user as logged in
    setLoggedIn?.(true);

    // Navigate to main app stack
    router.replace("/(tabs)/character");
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

        <FormButton mode="contained" title="Start" onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}
