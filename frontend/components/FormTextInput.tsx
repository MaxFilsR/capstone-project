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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>

      <View>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: isFocused ? COLORS.primary : COLORS.neutral_lightest,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.neutral_3}
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
            style={styles.iconContainer}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color={COLORS.secondary}
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
    color: COLORS.neutral_lightest,
    fontSize: 16,
    paddingRight: 40, // leave space for eye icon
  },
  iconContainer: {
    position: "absolute",
    right: 10,
    top: 12,
  },
});
