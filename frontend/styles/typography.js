import { StyleSheet } from "react-native";
import { colorPallet } from "./variables";

export const typography = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontFamily: "Anton",
    color: colorPallet.primary,
  },
  h2: {
    fontSize: 18,
    fontFamily: "Anton",
    color: colorPallet.primary,
  },
  h3: {
    fontSize: 16,
    fontFamily: "Anton",
    color: colorPallet.primary,
  },
  h4: {
    fontSize: 14,
    fontFamily: "Anton",
    color: colorPallet.primary,
  },
  h5: {
    fontSize: 12,
    fontFamily: "Anton",
    color: colorPallet.primary,
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
  header: {
    fontSize: 24,
    fontFamily: "Anton",
    color: colorPallet.primary,
  },
});
