import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";

type CharacterCardProps = {
  className?: string;
  description?: string;
  image: ImageSourcePropType;
  stats: {
    strength: number;
    endurance: number;
    flexibility: number;
  };
  borderColor?: string;
  accentColor?: string;
  username?: string;
  level?: number;
  currentExp?: number;
  expNeeded?: number;
};

export default function CharacterCard({
  className,
  description,
  image,
  stats,
  borderColor = colorPallet.primary,
  accentColor = colorPallet.secondary,
  username,
  level,
  currentExp,
  expNeeded,
}: CharacterCardProps) {
  const progressPercentage =
    currentExp !== undefined && expNeeded !== undefined && expNeeded > 0
      ? (currentExp / expNeeded) * 100
      : 0;

  return (
    <View style={[styles.container, { borderColor }]}>
      {/* Character Image */}
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
      </View>

      {/* Character Info */}
      {(username || className || description) && (
        <View style={styles.infoContainer}>
          {/* Username and Level */}
          {username && level !== undefined && (
            <View
              style={[
                styles.userInfoSection,
                (className || description) && styles.userInfoSectionWithBorder,
              ]}
            >
              <View style={styles.userHeader}>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.level}>Level {level}</Text>
              </View>

              {/* Progress Bar */}
              {currentExp !== undefined && expNeeded !== undefined && (
                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(progressPercentage, 100)}%`,
                          backgroundColor: colorPallet.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.expText}>
                    {currentExp} / {expNeeded} XP
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Class Name */}
          {className && (
            <Text style={[styles.className, { color: accentColor }]}>
              {className}
            </Text>
          )}

          {/* Description */}
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      )}

      {/* Stats */}
      <View style={[styles.statsContainer, { borderTopColor: accentColor }]}>
        {[
          { label: "Strength", value: stats.strength, color: "#D64545" },
          { label: "Endurance", value: stats.endurance, color: "#E9E34A" },
          { label: "Flexibility", value: stats.flexibility, color: "#6DE66D" },
        ].map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: stat.color }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colorPallet.neutral_6,
    marginBottom: 16,
  },
  imageContainer: {
    padding: 10,
    alignItems: "center",
    backgroundColor: colorPallet.neutral_darkest,
  },
  image: {
    height: 350,
    width: "100%",
    resizeMode: "contain",
  },
  infoContainer: {
    padding: 16,
    paddingVertical: 12,
  },
  userInfoSection: {
    marginBottom: 16,
    paddingBottom: 16,
  },
  userInfoSectionWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.neutral_4,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  username: {
    ...typography.h2,
    color: colorPallet.neutral_lightest,
    fontWeight: "700",
    fontSize: 20,
  },
  level: {
    ...typography.body,
    color: colorPallet.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  progressSection: {
    gap: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: colorPallet.neutral_4,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  expText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
    textAlign: "right",
  },
  className: {
    ...typography.h1,
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 6,
  },
  description: {
    ...typography.body,
    color: colorPallet.neutral_2,
  },
  statsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    width: "25%",
  },
  statValue: {
    color: colorPallet.neutral_lightest,
    fontWeight: "800",
    fontSize: 18,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
  },
});
