import { useState } from "react";
import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TouchableOpacity
} from "react-native";
import { globalStyles } from "../../../styles/globalStyles";
import { AUTH } from "../../../styles/authStyles";
import { BackButton, FormButton } from "../../../components";


type Option = {
    id: "warrior" | "monk" | "assassin" | "wizard" | "gladiator";
    label: string;
    value: "strength" | "yoga" | "cardio" | "mixed" | "competitive"
};

const OPTIONS: Option[] = [
    { id: "warrior", label: "Weightlifting / Strength Training", value: "strength" },
    { id: "monk", label: "Yoga / Flexibility / Mobility", value: "yoga" },
    { id: "assassin", label: "Running / Cardio / Outdoor Activities", value: "cardio" },
    { id: "wizard", label: "Mixed / Cross-Training", value: "mixed" },
    { id: "gladiator", label: "Competitive / Sports", value: "competitive" },
];

export const screenOptions = {
  headerShown: false,
};

export default function WorkoutStyleScreen() {
  const [selected, setSelected] = useState<Option | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selected) {
      setError("Please select a workout style.");
      return;
    }
    setError(null);

    router.push("./accountDetails"); //next step
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={globalStyles.centerContainer}
    >
      <BackButton />
      <Text style={globalStyles.h1}>
        What is your preferred workout style?
      </Text>
      <View style={{marginTop: 24, width: "100%"}}>
        {OPTIONS.map((opt) => (
            <RadioRow
                key={opt.id}
                label={opt.label}
                selected={selected?.id === opt.id}
                onPress={() => setSelected(opt)}
            />
        ))}

        {error ? (
            <Text style={[globalStyles.errorText, { marginTop: 16}]}>
                {error}
            </Text>
        ) : null}

        <FormButton title="Next" onPress={handleSubmit} />
        </View>
    </KeyboardAvoidingView>
    );
}

    /* Styling */

    function RadioRow({
        label,
        selected,
        onPress,
    }: {
        label:string;
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
                <View
                    style={{
                        height: 24,
                        width: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: selected ? "#A8F200" : "#DDD",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                    }}
                >
                {selected ? (
                    <View
                        style={{
                            height: 12,
                            width: 12,
                            borderRadius: 6,
                            backgroundColor: "#A8F200"
                        }}
                    />
                ) : null}
                </View>

                <Text
                    style={[
                        globalStyles.body,
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
