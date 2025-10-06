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
    width: "100%", // take full width of the container
    height: undefined, // let aspect ratio define height
    aspectRatio: 4, // width / height ratio (400 / 100 = 4)
    resizeMode: "contain", // scales logo proportionally
  },

  centerContainer: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    backgroundColor: COLORS.neutral_darkest,
    padding: 16,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: COLORS.neutral_lightest,
    textAlign: "left",
  },
  formContainer: {
    gap: 24,
    paddingVertical: 24,
  },
});
