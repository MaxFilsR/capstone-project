import { StyleSheet } from "react-native";
import { colorPallet } from "./variables";

export const typography = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontFamily: "Anton",
    color: colorPallet.secondary,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: colorPallet.neutral_lightest,
    textAlign: "left",
  },
  errorText: {
    color: "red",
    fontSize: 14,
  },
});
