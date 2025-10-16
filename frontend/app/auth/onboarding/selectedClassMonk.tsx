import { router } from "expo-router";
import { View, Text, Image, ScrollView } from "react-native";
import { BackButton, FormButton } from "@/components";
import monk from "@/assets/images/monk-male-full-brown.png";
import { containers, typography } from "@/styles";
import { colorPallet } from "@/styles/variables";

export default function selectedClassMonk() {
    return (
        <ScrollView
            contentContainerStyle={[containers.centerContainer]}
            style={{ backgroundColor: "#0C0C0C" }}
        >
            <BackButton />

            {/* Container with consistent spacing */}
            <View style={{ width: "100%", gap: 24 }}>
                {/* title */}
                <Text
                    style={[
                        typography.h1,
                        {
                            color: colorPallet.neutral_lightest,
                            textAlign: "center",
                        },
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
                                typography.h1,
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
                        <Text style={[typography.body, { color: "#DADADA" }]}>
                            Calm and precise. Master of form, flexibility, and
                            body control through mindful movement.
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
                            { label: "Strength", value: 4, color: "#D64545" },
                            { label: "Endurance", value: 7, color: "#E9E34A" },
                            {
                                label: "Flexibility",
                                value: 10,
                                color: "#6DE66D",
                            },
                        ].map((s) => (
                            <View
                                key={s.label}
                                style={{ alignItems: "center", width: "25%" }}
                            >
                                <Text
                                    style={{
                                        color: "#FFF",
                                        fontWeight: "800",
                                        fontSize: 18,
                                    }}
                                >
                                    {s.value}
                                </Text>
                                <Text
                                    style={{
                                        color: s.color,
                                        marginTop: 2,
                                        fontSize: 12,
                                    }}
                                >
                                    {s.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
                <View style={containers.formActionContainer}>
                    <FormButton
                        title="Next"
                        onPress={() => {
                            router.push("/auth/onboarding/workoutSchedule");
                        }}
                    />

                    <FormButton
                        title="Select My Own Class"
                        mode="text"
                        color="secondary"
                        onPress={() => {
                            router.push(
                                "/auth/onboarding/swipeableClassSelector"
                            );
                        }}
                    />
                </View>
            </View>
        </ScrollView>
    );
}
