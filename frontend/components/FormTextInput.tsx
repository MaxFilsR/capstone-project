import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import { COLORS } from "../styles/variables";

type FormInputProps = {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  style?: ViewStyle;
};

export const FormTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
}: FormInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: isFocused ? COLORS.primary : COLORS.neutral_lightest },
        ]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.neutral_3}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 4,
    fontFamily: "Anton_400Regular",
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.neutral_darkest,
    color: COLORS.neutral_darkest,
    fontSize: 16,
  },
});
