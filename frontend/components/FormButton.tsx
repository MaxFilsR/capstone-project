import React, { useState } from "react";
import { Button } from "react-native-paper";
import { StyleSheet, ViewStyle, TextStyle, StyleProp } from "react-native";
import { colorPallet } from "@/styles/variables";

type FormButtonProps = {
  title: string;
  onPress: () => void;
  mode?: "text" | "contained" | "outlined";
  style?: ViewStyle | ViewStyle[];
  labelStyle?: StyleProp<TextStyle>;
  color?: "primary" | "secondary" | "critical";
  textColor?: string;
  buttonColor?: string;
  fontSize?: number;
  disabled?: boolean;
};

export const FormButton = ({
  title,
  onPress,
  mode = "contained",
  style,
  labelStyle,
  color = "primary",
  textColor: customTextColor,
  buttonColor: customButtonColor,
  fontSize,
  disabled = false,
}: FormButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const getDefaultButtonColor = () => {
    switch (color) {
      case "critical":
        return colorPallet.critical;
      case "secondary":
        return colorPallet.secondary;
      case "primary":
      default:
        return colorPallet.primary;
    }
  };

  const defaultButtonColor = getDefaultButtonColor();
  const bgColor = customButtonColor || defaultButtonColor;

  // Disabled styles
  const disabledBackground =
    mode === "contained" ? colorPallet.neutral_5 : "transparent";
  const disabledText =
    mode === "contained" ? colorPallet.neutral_3 : colorPallet.neutral_5;

  const computedBackgroundColor = disabled
    ? disabledBackground
    : mode === "contained"
    ? bgColor
    : "transparent";

  const computedTextColor = disabled
    ? disabledText
    : customTextColor
    ? customTextColor
    : mode === "text"
    ? isPressed
      ? bgColor
      : defaultButtonColor
    : colorPallet.neutral_darkest;

  const computedLabelStyle: StyleProp<TextStyle> = [
    ...(fontSize ? [{ fontSize }] : []),
    ...(labelStyle ? [labelStyle] : []),
  ].filter(Boolean);

  return (
    <Button
      mode={mode}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      buttonColor={computedBackgroundColor}
      textColor={computedTextColor}
      rippleColor={mode === "text" ? "transparent" : undefined}
      style={[styles.button, style]}
      labelStyle={computedLabelStyle}
      contentStyle={{ paddingVertical: 6 }}
      disabled={disabled}
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
  },
});
