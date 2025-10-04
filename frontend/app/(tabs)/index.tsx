import { Text, View, Image } from "react-native";
import { globalStyles } from "../styles/globalStyles";

export default function Index() {
  return (
    <View style={globalStyles.container}>
      <Image
        style={globalStyles.logo}
        source={require("..//..//assets/images/Gainz Logo Full.png")}
      />

      <Text style={globalStyles.h1}> Home Screen</Text>
    </View>
  );
}
