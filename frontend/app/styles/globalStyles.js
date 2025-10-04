import { StyleSheet } from "react-native";
import { COLORS } from "./variables";

export const globalStyles = StyleSheet.create({
  h1: {
    color: COLORS.secondary,
    fontSize: 24,
    fontFamily: "Anton",
  },
  p: {
    color: COLORS.neutral_lightest,
    fontSize: 16,
    fontFamily: "Anton",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.neutral_darkest,
  },
  logo: {
    width: 400,
    height: 100,
    resizeMode: "stretch",
  },
});
