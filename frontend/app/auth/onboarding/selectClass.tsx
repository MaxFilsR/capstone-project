/**
 * Select Class Screen
 *
 * Alternative class selection screen with list-based interface showing all classes.
 */
import { useState, useEffect } from "react";
import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { globalStyles } from "@/styles/globalStyles";
import { BackButton, FormButton } from "@/components";
import { useOnboarding } from "@/lib/onboarding-context";
import { getClasses, CharacterClass } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";


// ============================================================================
// Component
// ============================================================================


export default function SelectClassScreen() {
  // Context and state
  const { updateClassId } = useOnboarding();
  const [classes, setClasses] = useState<CharacterClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load classes on mount
  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await getClasses();
        setClasses(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load classes:", err);
        setError("Failed to load classes. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadClasses();
  }, []);

  // Save selected class to context and navigate to next screen
  const handleSubmit = () => {
    if (!selectedClass) {
      setError("Please select a class");
      return;
    }

    // Save class ID to context
    updateClassId(selectedClass.id);

    // Navigate to next screen
    router.push("/auth/onboarding/workoutSchedule");
  };

  if (loading) {
    return (
      <View
        style={[globalStyles.centerContainer, { justifyContent: "center" }]}
      >
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={{ color: colorPallet.neutral_lightest, marginTop: 16 }}>
          Loading classes...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={globalStyles.centerContainer}
    >
      {/* Back button */}
      <BackButton />
      <ScrollView style={{ width: "100%" }}>
        {/* Title */}
        <Text style={globalStyles.h1}>Choose Your Class</Text>

        {/* Error message */}
        {error && (
          <Text style={[typography.errorText, { marginTop: 16 }]}>{error}</Text>
        )}

        {/* Class list */}
        <View style={{ marginTop: 24 }}>
          {classes.map((classItem) => (
            <TouchableOpacity
              key={classItem.id}
              onPress={() => {
                setSelectedClass(classItem);
                setError(null);
              }}
              style={{
                padding: 16,
                marginBottom: 12,
                borderRadius: 8,
                borderWidth: 2,
                borderColor:
                  selectedClass?.id === classItem.id
                    ? colorPallet.primary
                    : colorPallet.neutral_darkest,
                backgroundColor:
                  selectedClass?.id === classItem.id
                    ? `${colorPallet.primary}20`
                    : colorPallet.neutral_darkest,
              }}
            >
              {/* Class name */}
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter-Bold",
                  color: colorPallet.neutral_lightest,
                  marginBottom: 8,
                }}
              >
                {classItem.name}
              </Text>

              {/* Stats */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <StatPill label="STR" value={classItem.stats.strength} />
                <StatPill label="END" value={classItem.stats.endurance} />
                <StatPill label="FLX" value={classItem.stats.flexibility} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit button */}
        <FormButton
          title="Next"
          onPress={handleSubmit}
          style={{ marginTop: 16, marginBottom: 32 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


// ============================================================================
// Helper Components
// ============================================================================

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: colorPallet.neutral_darkest,
      }}
    >
      {/* Stat label */}
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter-SemiBold",
          color: colorPallet.neutral_lightest,
          marginRight: 4,
        }}
      >
        {label}:
      </Text>
      {/* Stat value */}
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter-Bold",
          color: colorPallet.primary,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
