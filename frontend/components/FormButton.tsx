import React from "react";
import { Button } from "react-native-paper";
import { StyleSheet } from "react-native";
import { COLORS } from "../styles/variables";

type FormButtonProps = {
  title: string;
  onPress: () => void;
  mode?: "text" | "contained" | "outlined";
  style?: object;
  color?: "primary" | "secondary";
};

export const FormButton = ({
  title,
  onPress,
  mode = "contained",
  style,
  color = "primary", // default to primary
}: FormButtonProps) => {
  const buttonColor = color === "primary" ? COLORS.primary : COLORS.secondary;
  const textColor = mode === "contained" ? COLORS.neutral_darkest : buttonColor;

  return (
    <Button
      mode={mode}
      onPress={onPress}
      buttonColor={mode === "contained" ? buttonColor : undefined}
      textColor={textColor}
      style={[styles.button, style]}
      contentStyle={{ paddingVertical: 6 }}
    >
      {title}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    marginVertical: 10,
    borderRadius: 12,
    fontSize: 40,
  },
});
