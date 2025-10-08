import { useState } from "react";
import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  Image,
} from "react-native";
import { FormButton } from "../../../components";
import { globalStyles } from "../../../styles/globalStyles";
import { AUTH } from "../../../styles/authStyles";
import { BackButton } from "../../../components";

export const screenOptions = {
  headerShown: false,
};

export default function CharacterQuizScreen() {
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    // if (!fName || !lName) {
    //   setError("Please fill in all fields.");
    //   return;
    // }
    setError(null);
    router.push("./preSelectedClassTemp"); //next step
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={globalStyles.centerContainer}
    >
      <BackButton />
      <Text style={AUTH.title}>What is your preferred workout Style?</Text>
      <View style={globalStyles.formContainer}>
        <FormButton mode="contained" title="Next" onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}
