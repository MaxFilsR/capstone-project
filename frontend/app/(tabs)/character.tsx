import { Text, View, Image, Button } from "react-native";
import { globalStyles } from "@/styles/globalStyles";
import logo from "@/assets/images/gainz_logo_full.png";
import { useAuth } from "@/lib/auth-context";

export default function Index() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // RootLayout will automatically redirect to /auth/logIn
  };

  return (
    <View style={globalStyles.container}>
      <Image style={globalStyles.logo} source={logo} />

      <Text style={globalStyles.h1}>Character Screen</Text>

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
