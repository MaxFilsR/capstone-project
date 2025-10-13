import React from "react";
import { Text, ScrollView, Image } from "react-native";
import { tabStyles } from "@/styles";
import { globalStyles } from "@/styles/globalStyles";
import logo from "@/assets/images/gainz_logo_full.png";

const LibraryScreen = () => (
  <ScrollView style={tabStyles.tabContent}>
    <Image style={globalStyles.logo} source={logo} />

    <Text style={[globalStyles.h1, { alignSelf: "center" }]}> Library Tab</Text>
  </ScrollView>
);

export default LibraryScreen;
