import { Text, View, Image } from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import logo from "../../assets/images/gainz_logo_full.png";

export default function Index() {
  return (
    <View style={globalStyles.container}>
      <Image style={globalStyles.logo} source={logo} />

      <Text style={globalStyles.h1}> Fitness Screen</Text>
    </View>
  );
}
