/**
 * Image Styles
 * 
 * Reusable styles for images and image components throughout the app.
 */

import { StyleSheet } from "react-native";

export const images = StyleSheet.create({
  logo: {
    width: "100%",
    height: undefined,
    aspectRatio: 4,
    resizeMode: "contain",
  },
  thumbnail: {
    width: "100%",
    height: 250,
  },
});