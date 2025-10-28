import React from "react";
import { Text, ScrollView, Image } from "react-native";
import { tabStyles } from "@/styles";
import logo from "@/assets/images/gainz_logo_full.png";
import { globalStyles } from "@/styles/globalStyles";

const RecordsScreen = () => (
  <ScrollView style={tabStyles.tabContent}>
    <Image style={globalStyles.logo} source={logo} />

    <Text style={[globalStyles.h1, { alignSelf: "center" }]}> Coming Soon</Text>
  </ScrollView>
);

export default RecordsScreen;
