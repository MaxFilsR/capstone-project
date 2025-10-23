import React, { useState } from "react";
import { Text, ScrollView, Image, TouchableOpacity, View } from "react-native";
import { tabStyles } from "@/styles";
import logo from "@/assets/images/gainz_logo_full.png";
import { globalStyles } from "@/styles/globalStyles";
import Popup from "@/components/PopupModal";
import { colorPallet } from "@/styles/variables";

const RoutinesScreen = () => {
  const [showCreateRoutine, setShowCreateRoutine] = useState(false);

  return (
    <ScrollView style={tabStyles.tabContent}>
      <Image style={globalStyles.logo} source={logo} />

      <Text style={[globalStyles.h1, { alignSelf: "center" }]}>
        Routines Tab
      </Text>

      {/* + Button */}
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <TouchableOpacity
          style={{
            borderRadius: 30,
            width: 60,
            height: 60,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => setShowCreateRoutine(true)}
        >
          <Text
            style={{
              color: colorPallet.secondary,
              fontSize: 30,
            }}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>

      <Popup
        visible={showCreateRoutine}
        mode="createRoutine"
        onClose={() => setShowCreateRoutine(false)}
      />
    </ScrollView>
  );
};

export default RoutinesScreen;
