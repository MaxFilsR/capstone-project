import React, { useState } from "react";
import { Button } from "react-native-paper";
import { StyleSheet, ViewStyle, TextStyle, StyleProp } from "react-native";
import { colorPallet } from "@/styles/variables";

type FormButtonProps = {
  title: string;
  onPress: () => void;
  mode?: "text" | "contained" | "outlined";
  style?: ViewStyle | ViewStyle[];
  labelStyle?: StyleProp<TextStyle>; // Proper type for text/label style
  color?: "primary" | "secondary" | "critical";
  textColor?: string; // Custom text color override
  buttonColor?: string; // Custom button background color override
  fontSize?: number; // Custom font size
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

  const buttonColor = customButtonColor || defaultButtonColor;

  const getTextColor = () => {
    if (customTextColor) {
      return customTextColor;
    }

    if (mode === "text") {
      const baseColor = getDefaultButtonColor();
      return isPressed ? buttonColor : baseColor;
    }

    return colorPallet.neutral_darkest;
  };

  const textColor = getTextColor();
  const backgroundColor = mode === "contained" ? buttonColor : "transparent";

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
      buttonColor={backgroundColor}
      textColor={textColor}
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
    fontSize: 40,
  },
});
