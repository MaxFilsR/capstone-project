import { StyleSheet } from "react-native";
import { colorPallet } from "./variables";

export const tabStyles = StyleSheet.create({
  tabContent: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    paddingHorizontal: 22,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 20,
    marginHorizontal: 16,
    color: "#FFFFFF",
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    marginHorizontal: 16,
    color: "#CCCCCC",
  },
  container: {
    flex: 1,
    paddingTop: 64,
    backgroundColor: colorPallet.neutral_darkest,
  },
  tabBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
