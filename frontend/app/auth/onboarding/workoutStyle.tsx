/**
 * Workout Style Screen
 *
 * Onboarding step where users select workout preference, which maps to character class.
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
} from "react-native";
import { BackButton, FormButton } from "@/components";
import { containers, typography } from "@/styles";
import { getClasses, CharacterClass } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";
import { useOnboarding } from "@/lib/onboarding-context";

// ============================================================================
// Types
// ============================================================================

type Option = {
  id: "warrior" | "monk" | "assassin" | "wizard" | "gladiator";
  label: string;
  value: "strength" | "yoga" | "cardio" | "mixed" | "competitive";
};

// ============================================================================
// Constants
// ============================================================================

// Workout style options that map to character classes
const OPTIONS: Option[] = [
  {
    id: "warrior",
    label: "Weightlifting / Strength Training",
    value: "strength",
  },
  { id: "monk", label: "Yoga / Flexibility / Mobility", value: "yoga" },
  {
    id: "assassin",
    label: "Running / Cardio / Outdoor Activities",
    value: "cardio",
  },
  { id: "wizard", label: "Mixed / Cross-Training", value: "mixed" },
  { id: "gladiator", label: "Competitive / Sports", value: "competitive" },
];

// ============================================================================
// Component
// ============================================================================

export default function WorkoutStyleScreen() {
  const [selected, setSelected] = useState<Option | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<CharacterClass[]>([]);
  const [loading, setLoading] = useState(true);
  const { updateClassId } = useOnboarding(); // ADD THIS

  // Fetch classes on mount
  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await getClasses();
        setClasses(data);
        console.log("Classes loaded:", data);
      } catch (err) {
        console.error("Failed to load classes:", err);
      } finally {
        setLoading(false);
      }
    }

    loadClasses();
  }, []);

  const handleSubmit = () => {
    if (!selected) {
      setError("Please select a workout style.");
      return;
    }
    setError(null);

    // Map workout style to class ID
    const classIdMap: Record<Option["value"], number> = {
      strength: 1, // Warrior
      yoga: 2, // Monk
      cardio: 3, // Assassin
      mixed: 4, // Wizard
      competitive: 5, // Gladiator
    };

    const selectedClassId = classIdMap[selected.value];

    console.log("=== WORKOUT STYLE SELECTION ===");
    console.log("Selected workout:", selected.value);
    console.log("Mapped to class ID:", selectedClassId);
    console.log("===============================");

    // Save class ID to context
    updateClassId(selectedClassId);

    // Navigate to appropriate confirmation screen
    if (selected.value === "strength") {
      router.push("/auth/onboarding/selectedClassWarrior");
      return;
    }
    if (selected.value === "yoga") {
      router.push("/auth/onboarding/selectedClassMonk");
      return;
    }
    if (selected.value === "cardio") {
      router.push("/auth/onboarding/selectedClassAssassin");
      return;
    }
    if (selected.value === "mixed") {
      router.push("/auth/onboarding/selectedClassWizard");
      return;
    }
    if (selected.value === "competitive") {
      router.push("/auth/onboarding/selectedClassGladiator");
      return;
    }
  };

  if (loading) {
    return (
      <View style={[containers.centerContainer, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={{ color: colorPallet.neutral_lightest, marginTop: 16 }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={containers.centerContainer}
    >
      {/* Back button */}
      <BackButton />

      {/* Title */}
      <Text
        style={[
          typography.h1,
          { color: colorPallet.neutral_lightest, textAlign: "center" },
        ]}
      >
        What is your preferred workout style?
      </Text>

      <View style={[containers.formContainer, { gap: 0 }]}>
        {OPTIONS.map((opt) => (
          <RadioRow
            key={opt.id}
            label={opt.label}
            selected={selected?.id === opt.id}
            onPress={() => setSelected(opt)}
          />
        ))}

        {/* Error message */}
        {error ? (
          <Text style={[typography.errorText, { marginTop: 16 }]}>{error}</Text>
        ) : null}

        {/* Submit button */}
        <FormButton
          title="Next"
          onPress={handleSubmit}
          style={{ marginTop: 16 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function RadioRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
      }}
    >
      {/* Radio button */}
      <View
        style={{
          height: 24,
          width: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: selected ? "#8CE61A" : "#DDD",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        {/* Selected indicator */}
        {selected ? (
          <View
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: "#8CE61A",
            }}
          />
        ) : null}
      </View>

      <Text
        style={[
          typography.body,
          {
            flex: 1,
            color: "#EDEDED",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
