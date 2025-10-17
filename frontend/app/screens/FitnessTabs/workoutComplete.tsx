import React from "react";
import { router } from "expo-router";
import { View, Text, Image, ScrollView, StyleSheet, Pressable } from "react-native";
import { BackButton, FormButton } from "@/components";
import trophy from "@/assets/images/trophy_temp.png";
import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { globalStyles } from "@/styles/globalStyles";


type StatPair = { label: string; value: string | number };

type Props = {
    routineName?: string;
    playerName?: string;  // Kato oikee nimi
    summary?: StatPair[];
    onDone?: () => void;
};


export default function WorkoutComplete({
    fitness = "Strength Workout",
    playerName = "Player 1",
    summary,
    onDone,
    trophySource,
}: Props) {
    // Replace with actual data later
    const rows: StatPair[] =
        summary ?? [
            { label: "Workout Time", value: "1:05:30" },
            { label: "Gainz", value: "55" },
        ];

    const handleDone = () => {
        if (onDone) {
            onDone();
            return;
        } try {
            router.back();
        } catch (e) {
        }
    };

    const pairs: StatPair[][] = [];
    for (let i = 0; i < rows.length; i +=2) {
        pairs.push(rows.slice(i, i + 2));
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Done (top-right) */}
            <Pressable onPress={handleDone} hitSlop={12} style={styles.doneWrap}>
                <Text style={styles.doneText}>Done</Text>
            </Pressable>

            {/* Title */}
            <Text style={[typography.h1, styles.title]}>
                {`${fitness} Complete`}
            </Text>

            <Image source={trophy} style={styles.trophy} resizeMode="contain"/>

            {/* Post Workout Message */}
            <Text style={[typography.h1, styles.postMessage]}>
                Good job, {playerName}!
            </Text>

            {/* Summary */}
            <Text style={styles.sectionHeader}></Text>

            <View style={styles.card}>
                {pairs.map((pair, idx) => (
                    <View
                        key={`${pair[0].label}-${pair[1]?.label ?? idx}`}
                        style={styles.row}
                    >
                        {/* Left Cell */}
                        <View style={styles.cell}>
                            <Text style={styles.cellLabel}>{pair[0].label}</Text>
                            <Text style={styles.cellValue}>
                                {typeof pair[0].value === "number"
                                ? pair[0].value.toLocaleString()
                                : pair[0].value}
                            </Text>
                        </View>

                        {/* Right Cell */}
                        <View style={styles.cell}>
                            {pair[1] ? (
                                <>
                                    <Text style={styles.cellLabel}>{pair[1].label}</Text>
                                    <Text style={styles.cellValue}>
                                        {typeof pair[1].value === "number"
                                        ? pair[1].value.toLocaleString()
                                        : pair[1].value}
                                    </Text>
                                </>
                            ) : null}
                        </View>
                    </View>
                ))}
            </View>

            <View style={{ height: 32}} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colorPallet.neutral_darkest,
    },
    content: {
        padding: 16,
        paddingTop: 100,
    },

    doneWrap: {
        position: "absolute",
        right: 16,
        top: 40,
        zIndex: 1,
    },
    doneText: {
        color: colorPallet.secondary,
        fontSize: 16,
        fontWeight: "700",
    },

    title: {
        color: colorPallet.primary,
        textAlign: "center",
        marginTop: 8,
    },

    trophy: {
        width: "72%",
        height: 180,
        alignSelf: "center",
        marginVertical: 12,
    },

    postMessage: {
        color: colorPallet.neutral_lightest,
        textAlign: "center",
        marginBottom: 12,
        marginTop: 4,
    },

    sectionHeader: {
        color: colorPallet.neutral_lightest,
        fontSize: 18,
        fontWeight: "800",
        marginTop: 8,
        marginBottom: 8,
    },

    card: {
        backgroundColor: colorPallet.neutral_darkest,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colorPallet.primary,
        overflow: "hidden",
    },

    row: {
        flexDirection: "row",
    },
    rowDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colorPallet.neutral_5,
    },

    cell: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 14,
    },

    cellLeftDivider: {
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderLeftColor: colorPallet.neutral_5,
    },

    cellLabel: {
        ...typography.h1,
        color: colorPallet.neutral_lightest,
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 4,
    },

    cellValue: {
        color: colorPallet.neutral_3,
        fontSize: 16,
        fontWeight: "400",
    },
});
