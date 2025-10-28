import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextStyle,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colorPallet } from "@/styles/variables";

type FormInputProps = {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  iconContainerStyle?: ViewStyle;
};

export const FormTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  containerStyle,
  labelStyle,
  inputStyle,
  iconContainerStyle,
}: FormInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={containerStyle}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>

      <View>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: isFocused
                ? colorPallet.primary
                : colorPallet.neutral_lightest,
            },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colorPallet.neutral_3}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={[styles.iconContainer, iconContainerStyle]}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color={colorPallet.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    color: colorPallet.primary,
    marginBottom: 4,
    fontFamily: "Anton_400Regular",
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: colorPallet.neutral_darkest,
    color: colorPallet.neutral_lightest,
    fontSize: 16,
    paddingRight: 40,
    margin: 0,
  },
  iconContainer: {
    position: "absolute",
    right: 10,
    top: 12,
  },
});
