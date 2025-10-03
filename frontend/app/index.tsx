import { Text, View, Image, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.stretch}
        source={require("..//assets/images/Gainz Logo Full.png")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#090909",
  },
  stretch: {
    width: 400,
    height: 200,
    resizeMode: "stretch",
  },
});
