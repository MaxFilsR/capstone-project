import { useState } from "react";
import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { BackButton, FormButton } from "@/components";
import { globalStyles } from "@/styles/globalStyles";
import { typography, containers } from "@/styles";
import { colorPallet } from "@/styles/variables";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function WorkoutScheduleScreen() {
  const [schedule, setSchedule] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index] = !newSchedule[index];
    setSchedule(newSchedule);
  };

  const handleSubmit = () => {
    setError(null);

    router.push("./username"); // next step
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={globalStyles.centerContainer}
    >
      <BackButton />
      <View style={containers.formContainer}>
        <Text
          style={[
            typography.h1,
            { color: colorPallet.neutral_lightest, textAlign: "left" },
          ]}
        >
          What days do you plan on working out?
        </Text>

        {/* Schedule Picker */}
        <View style={styles.scheduleContainer}>
          {DAYS.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                schedule[index] && styles.dayButtonActive, // use boolean
              ]}
              onPress={() => toggleDay(index)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  schedule[index] && styles.dayButtonTextActive, // use boolean
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FormButton mode="contained" title={"Next"} onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scheduleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    width: "100%",
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colorPallet.neutral_darkest,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colorPallet.neutral_lightest,
  },
  dayButtonActive: {
    backgroundColor: colorPallet.primary,
    borderColor: colorPallet.primary,
  },
  dayButtonText: {
    fontSize: 14, // fixed size
    fontFamily: "Inter-SemiBold", // fixed font
    color: colorPallet.neutral_lightest,
  },
  dayButtonTextActive: {
    fontSize: 14, // same size
    fontFamily: "Inter-SemiBold", // same font
    color: colorPallet.neutral_darkest,
  },
});
