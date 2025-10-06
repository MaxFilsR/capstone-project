import React from "react";
import { StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { COLORS } from "../styles/variables";

type FormInputProps = {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  mode?: "flat" | "outlined";
  style?: object;
};

export const FormTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  mode = "flat",
  style,
}: FormInputProps) => {
  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      mode={mode}
      backgroundColor={COLORS.neutral_lightest}
      selectionColor={COLORS.primary}
      outlineColor={COLORS.primary}
      activeOutlineColor={COLORS.primary}
      textColor={COLORS.neutral_darkest}
      placeholderTextColor={COLORS.neutral_lightest}
    />
  );
};
