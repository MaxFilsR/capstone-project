import { StyleSheet } from "react-native";
import { COLORS } from "./variables";

export const AUTH = StyleSheet.create({
  centerContainer: {
    display: "flex",
  },
  title: {
    fontSize: 28,
    fontFamily: "Anton",
    color: COLORS.neutral_lightest,
    marginBottom: 10,
    textAlign: "center",
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.neutral_darkest,
  },
  error: {
    color: "red",
  },
});
