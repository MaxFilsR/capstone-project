import { StyleSheet } from "react-native";
import { colorPallet } from "./variables";

export const AUTH = StyleSheet.create({
  centerContainer: {
    display: "flex",
  },
  title: {
    fontSize: 24,
    fontFamily: "Anton",
    color: colorPallet.neutral_lightest,
    marginBottom: 10,
    textAlign: "center",
    padding: 1,
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_darkest,
  },
  error: {
    color: "red",
  },
});
