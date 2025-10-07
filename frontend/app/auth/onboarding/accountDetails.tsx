// app/onboarding/personalInfo.tsx
import { useState } from "react";
import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  Image,
} from "react-native";
import { FormTextInput, FormButton } from "../../../components";
import { globalStyles } from "../../../styles/globalStyles";
import logo from "../../../assets/images/gainz_logo_full.png";
import { AUTH } from "../../../styles/authStyles";
import { BackButton } from "../../../components";

export const screenOptions = {
  headerShown: false,
};

export default function PersonalInfoScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    router.push("./accountDetails"); //next step
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={globalStyles.centerContainer}
    >
      <BackButton />
      <Text style={AUTH.title}>Account Details</Text>
      <View style={globalStyles.formContainer}>
        <FormTextInput
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <FormTextInput
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && (
          <Text style={{ color: "red", marginVertical: 8 }}>{error}</Text>
        )}

        <FormButton mode="contained" title="Next" onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}
