import React, { useState } from "react";
import { Button } from "react-native-paper";
import { StyleSheet } from "react-native";
import { colorPallet } from "@/styles/variables";

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
  color = "primary",
}: FormButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const buttonColor =
    color === "primary" ? colorPallet.primary : colorPallet.primary;

  // For "text" mode, make text shift color on press
  const textColor =
    mode === "text"
      ? isPressed
        ? buttonColor
        : colorPallet.secondary
      : colorPallet.neutral_darkest;

  const backgroundColor = mode === "contained" ? buttonColor : "transparent";

  return (
    <Button
      mode={mode}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      buttonColor={backgroundColor}
      textColor={textColor}
      rippleColor={mode === "text" ? "transparent" : undefined}
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
    marginVertical: 0,
    borderRadius: 12,
    fontSize: 40,
  },
});
