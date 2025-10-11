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
import {
  signUp,
  SignUpRequest,
  logIn,
  LoginRequest,
} from "@/api/endpoints";
import axios from "axios";
import { useAuth } from "@/lib/auth-context";

export default function LogInScreen() {
  const [isNewUser, setNewUser] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();

  const switchAuthMode = () => {
    setNewUser((prev) => !prev);
    setError(null);
  };

  async function handleSubmit() {
    try {
      if (!email || !password || (isNewUser && !passwordConfirmation)) {
        setError("Please fill in all fields.");
        return;
      }

      if (isNewUser && (password.length < 8 || password.length > 255)) {
        setError("Password must be between 8 and 255 characters.");
        return;
      }

      if (isNewUser && password !== passwordConfirmation) {
        setError("Passwords do not match.");
        return;
      }

      setError(null);

      if (isNewUser) {
        // Sign Up Flow
        const signUpRequest: SignUpRequest = { email, password };
        const response = await signUp(signUpRequest);

        if (response && "access_token" in response) {
          const access_token = response.access_token;

          // New users need to complete onboarding
          await login(access_token, email, false);

          // Navigate to onboarding flow
          router.push("/auth/onboarding/personalInfo");
        }
      } else {
        // Log In Flow
        const loginRequest: LoginRequest = { email, password };
        const response = await logIn(loginRequest);

        if (response && "access_token" in response) {
          const token = response.access_token;

          // Existing users are already onboarded
          await login(token, email, true);
          // RootLayout will automatically redirect to main app
        } else {
          setError("Invalid response from server");
        }
      }
    } catch (err: unknown) {
      console.error("Login/Signup error:", err);

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const serverMessage =
            typeof err.response.data === "string"
              ? err.response.data
              : JSON.stringify(err.response.data);
          setError(`Error ${err.response.status}: ${serverMessage}`);
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
    }
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
        {isNewUser && (
          <FormTextInput
            label="Confirm Password"
            placeholder="••••••••"
            secureTextEntry
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
          />
        )}

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
