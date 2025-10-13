import { StyleSheet } from "react-native";
import { colorPallet } from "./variables";

export const containers = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_darkest,
    padding: 16,
    gap: 24,
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_darkest,
  },
  formContainer: {
    gap: 24,
    marginVertical: 8,
    width: "100%",
  },
  formActionContainer: {
    gap: 4,
  },
});
