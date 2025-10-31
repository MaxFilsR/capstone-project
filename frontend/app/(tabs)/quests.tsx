import { Text, View, Image } from "react-native";
import { globalStyles } from "@/styles/globalStyles";
import logo from "@/assets/images/gainz_logo_full.png";
import QuickActionButton from "@/components/QuickActionButton";

export default function Index() {
  return (
    <View style={globalStyles.container}>
      <Image style={globalStyles.logo} source={logo} />

      <Text style={globalStyles.h1}> Quests Screen</Text>

      {/* Quick Action Button */}
      <QuickActionButton />
    </View>
  );
}
