import { StyleSheet } from "react-native";
import { colorPallet } from "./variables";

export const globalStyles = StyleSheet.create({
  h1: {
    color: colorPallet.secondary,
    fontSize: 24,
    fontFamily: "Anton",
  },
  p: {
    color: colorPallet.neutral_lightest,
    fontSize: 16,
    fontFamily: "Anton",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_darkest,
  },
  logo: {
    width: "100%", // take full width of the container
    height: undefined, // let aspect ratio define height
    aspectRatio: 4, // width / height ratio (400 / 100 = 4)
    resizeMode: "contain", // scales logo proportionally
    marginBottom: 16,
  },

  centerContainer: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    backgroundColor: colorPallet.neutral_darkest,
    padding: 16,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: colorPallet.neutral_lightest,
    textAlign: "left",
  },
  formContainer: {
    gap: 24,
    marginVertical: 8,
    paddingVertical: 0,
  },
});
