// app/onboarding/selectedClassWarrior.tsx
import { router } from "expo-router";
import { View, Text, Image, ScrollView } from "react-native";
import { BackButton, FormButton } from "@/components";
import { globalStyles } from "@/styles/globalStyles";
import monk from "@/assets/images/monk-male-full.png";
import { AUTH } from "../../../styles/authStyles";

export const screenOptions = {
  headerShown: false,
};

export default function selectedClassMonk() {
  return (
    <ScrollView
      contentContainerStyle={[
        globalStyles.centerContainer,
        { paddingTop: 8, paddingBottom: 32 },
      ]}
      style={{ backgroundColor: "#0C0C0C" }}
    >
      <BackButton />

      {/* title */}
      <Text
        style={[
          globalStyles.h1,
          { textAlign: "center", marginTop: 8, marginBottom: 12 },
        ]}
      >
        Your Class is:
      </Text>

      {/* Workout category class */}
      <View
        style={{
          width: "100%",
          alignSelf: "center",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#96F200",
          overflow: "hidden",
          backgroundColor: "#121212",
          marginTop: 16,
        }}
      >
        <View
          style={{
            padding: 10,
            alignItems: "center",
            backgroundColor: "#0F0F0F",
          }}
        >
          <Image
            source={monk}
            style={{
              height: 350,
              width: "100%",
              resizeMode: "contain",
            }}
          />
        </View>

        {/* Character name + description */}
        <View style={{ padding: 16, paddingVertical: 12 }}>
          <Text
            style={[
              globalStyles.h1,
              {
                color: "#8CE61A",
                fontWeight: "800",
                fontSize: 18,
                marginBottom: 6,
              },
            ]}
          >
            Monk
          </Text>
          <Text style={[globalStyles.body, { color: "#DADADA" }]}>
            Finds strength in mobility, yoga, and mindful movement
          </Text>
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: "row",
            borderTopWidth: 1,
            borderColor: "#8CE61A",
            paddingVertical: 14,
            paddingHorizontal: 12,
            justifyContent: "space-between",
          }}
        >
          {[
            { label: "Vitality", value: 8, color: "#D35AD6" },
            { label: "Strength", value: 3, color: "#D64545" },
            { label: "Endurance", value: 6, color: "#E9E34A" },
            { label: "Agility", value: 9, color: "#6DE66D" },
          ].map((s) => (
            <View key={s.label} style={{ alignItems: "center", width: "25%" }}>
              <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 18 }}>
                {s.value}
              </Text>
              <Text style={{ color: s.color, marginTop: 2, fontSize: 12 }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <FormButton
        title="Next"
        onPress={() => {
          router.push("/auth/onboarding/username");
        }}
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
}
