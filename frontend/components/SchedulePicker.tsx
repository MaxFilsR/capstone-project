import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colorPallet } from "@/styles/variables"; // your colorPallet file

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export const SchedulePicker = () => {
  const [schedule, setSchedule] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  const toggleDay = (index: number) => {
    const newSchedule = [@.schedule];
    newSchedule[index] = newSchedule[index] === 1 ? 0 : 1;
    setSchedule(newSchedule);
  };

  return (
    <View>
      <Text style={styles.heading}>Pick Your Workout Days:</Text>
      <View style={styles.scheduleContainer}>
        {DAYS.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              schedule[index] === 1 && styles.dayButtonActive,
            ]}
            onPress={() => toggleDay(index)}
          >
            <Text
              style={[
                styles.dayButtonText,
                schedule[index] === 1 && styles.dayButtonTextActive,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Optional: debug output */}
      <Text style={{ marginTop: 10 }}>
        Schedule Array: {JSON.stringify(schedule)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scheduleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  dayButtonActive: {
    backgroundColor: colorPallet.secondary, // active color
  },
  dayButtonText: {
    fontSize: 16,
    color: "#333",
  },
  dayButtonTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
});
