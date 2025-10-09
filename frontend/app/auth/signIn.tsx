import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
  Text,
} from "react-native";
import { FormTextInput, FormButton } from "../../components";
import { globalStyles } from "../../styles/globalStyles";
import logo from "@/assets/images/gainz_logo_full.png";
import { AUTH } from "@/styles/authStyles";
import { signUp, SignUpRequest } from "../../api/endpoints";

export default function SignIn() {
  const [isNewUser, setNewUser] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { login, register, logout, user } = useAuth();

  const switchAuthMode = () => {
    setNewUser((prev) => !prev);
    setError(null);
  };

  async function handleSubmit() {
    if (isNewUser) {
      if (!email || !password) {
        setError("Please fill in all fields.");
        return;
      }else if (password.length < 8 || password.length > 255) {
        setError("Password must be at between 8 and 255 characters.");
        return;
      }else{
        let request: SignUpRequest = {
          email: email,
          password: password,
        }
        try {
          const response = await signUp(request);
		  const access_token: string = response.access_token;
      } catch (err: unknown) {String(err)}
      }
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
      //implement real login method
    }
    setError(null);
    return;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={globalStyles.centerContainer}
    >
      <Image style={globalStyles.logo} source={logo} />
      <Text style={AUTH.title}>{isNewUser ? "Create Account" : "Sign In"}</Text>
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

        {error && <Text style={AUTH.error}>{error}</Text>}
      </View>
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

      {user && (
        <FormButton
          mode="contained"
          title="Log Out"
          color="secondary"
          onPress={async () => await logout()}
        />
      )}
    </KeyboardAvoidingView>
  );
}
