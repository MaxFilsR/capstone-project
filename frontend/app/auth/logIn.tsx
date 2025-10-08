import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
  Text,
} from "react-native";
import { FormTextInput, FormButton } from "@/components";
import { typography, containers, images } from "@/styles/index";
import { colorPallet } from "@/styles/variables";
import logo from "@/assets/images/gainz_logo_full.png";

export default function LogInScreen() {
  const [isNewUser, setNewUser] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const switchAuthMode = () => {
    setNewUser((prev) => !prev);
    setError(null);
  };

  async function handleSubmit() {
    if (isNewUser) {
      setError(null);
      router.push("/auth/onboarding/personalInfo");
    } else {
      if (!email || !password) {
        setError("Please fill in all fields.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }
    setError(null);
    return;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={containers.centerContainer}
    >
      <Image style={images.logo} source={logo} />

      <View style={containers.formContainer}>
        <Text
          style={[
            typography.h1,
            { color: colorPallet.neutral_lightest, textAlign: "center" },
          ]}
        >
          {isNewUser ? "Sign Up" : "Sign In"}
        </Text>
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

        {error && <Text style={typography.errorText}>{error}</Text>}

        <View style={containers.formActionContainer}>
          <FormButton
            mode="contained"
            title={isNewUser ? "Sign Up" : "Sign In"}
            onPress={handleSubmit}
          />

          <FormButton
            mode="text"
            title={
              isNewUser
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"
            }
            color="secondary"
            onPress={switchAuthMode}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
