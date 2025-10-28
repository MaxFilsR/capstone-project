///screens/FitnessTabs/routineScreens/durationRoutine

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput as RNTextInput } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { typography } from "@/styles";
import { BackButton, FormButton } from "@/components";
import { colorPallet } from "@/styles/variables";
import { TextInput } from "react-native-paper";

export default function DurationRoutineScreen() {
  const navigation = useNavigation();
  const router = useRouter()
  const [duration, setDuration] = useState(""); //hh:mm

  useEffect(() => {
    navigation.setOptions({
      presentation: "card",
      animation: "slide_from_right",
      headerShown: false,
      contentstyle: { backgroundColor: "#0B0B0B" },
    });
  }, [navigation]);

  function onBack() {
    router.back();
  }

  function onEndWorkout() {
    // Go to the Fitness tab root and show the Routines segment
    router.replace({ pathname: "/(tabs)/fitness", params: { tab: "routines" } });
  }

  function onChangeDur(t: string) {
    const cleaned = t.replace(/[^\d:]/g, "").slice(0, 5);
    setDuration(cleaned);
  }

  return (
    <View style={styles.screen}>
      {/* back button */}
      <View style={styles.backContainer}>
        <BackButton onPress={onBack} />
      </View>

      {/* main content */}
      <View style={styles.contentWrap}>
        <Text style={styles.title}>Workout Duration</Text>

        <View style={styles.inputWrap}>
          <RNTextInput
            value={duration}
            onChangeText={onChangeDur}
            placeholder="hh:mm"
            placeholderTextColor={colorPallet.neutral_4}
            keyboardType="numbers-and-punctuation"
            returnKeyType="done"
            style={styles.input}
          />
        </View>

        <FormButton
          title="End Workout"
          onPress={onEndWorkout}
          style={styles.endButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backContainer: {
    position: "absolute",
    top: 20,
    left: 10,
    zIndex: 10,
  },
  contentWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -40, // fine-tunes upward offset
  },
  title: {
    ...typography.h1,
    color: colorPallet.neutral_lightest,
    textAlign: "center",
    marginBottom: 24,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: colorPallet.neutral_4,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
    width: "85%",
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: "transparent",
    color: colorPallet.neutral_lightest,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 1,
  },
  endButton: {
    alignSelf: "center",
    width: 180,
    marginTop: 8,
  },
});