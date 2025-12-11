import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { typography } from "@/styles";
import { FormButton } from "@/components";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";
import { Quest } from "@/api/endpoints";

type Params = {
  completedQuests?: string;
  workoutName?: string;
  workoutTime?: string;
  points?: string;
  exercises?: string;
};

// Sparkle animation component
const Sparkle = ({ delay = 0 }) => {
  const { width, height } = Dimensions.get("window");
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(Math.random() * height)).current;
  const translateX = useRef(new Animated.Value(Math.random() * width)).current;

  useEffect(() => {
    const animate = () => {
      opacity.setValue(0);
      scale.setValue(0);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };

    animate();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        opacity,
        transform: [{ scale }, { translateX }, { translateY }],
      }}
    >
      <Ionicons name="star" size={20} color={colorPallet.primary} />
    </Animated.View>
  );
};

export default function QuestCompleteScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams<Params>();

  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const trophyScale = useRef(new Animated.Value(0)).current;
  const trophyRotate = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({
      presentation: "card",
      animation: "fade",
      headerShown: false,
      gestureEnabled: false,
    });

    // Parse completed quests
    if (params.completedQuests) {
      try {
        const quests = JSON.parse(params.completedQuests);
        console.log("🎯 QuestCompleteScreen received quests:", quests);
        setCompletedQuests(quests);
      } catch (error) {
        console.error("Failed to parse completed quests:", error);
      }
    }

    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Trophy animation
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(trophyScale, {
          toValue: 1,
          tension: 40,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(trophyRotate, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [navigation, params.completedQuests]);

  const handleContinue = () => {
    // Navigate to workout complete screen
    router.replace({
      pathname: "/screens/FitnessTabs/workoutComplete",
      params: {
        name: params.workoutName,
        workoutTime: params.workoutTime,
        points: params.points,
        exercises: params.exercises,
      },
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "#6DE66D";
      case "medium":
        return "#E9E34A";
      case "hard":
        return "#D64545";
      default:
        return colorPallet.primary;
    }
  };

  const getRewardText = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "+50 Coins";
      case "medium":
        return "+100 Coins";
      case "hard":
        return "+200 Coins";
      default:
        return "+50 Coins";
    }
  };

  const getQuestDescription = (quest: Quest): string => {
    const parts: string[] = [];
    
    parts.push(`Complete ${quest.number_of_workouts_needed} workout${quest.number_of_workouts_needed > 1 ? 's' : ''}`);
    
    if (quest.workout_duration) {
      parts.push(`at least ${quest.workout_duration} minutes long`);
    }
    
    if (quest.exercise_category) {
      parts.push(`including ${quest.exercise_category} exercises`);
    }
    
    if (quest.exercise_muscle) {
      parts.push(`targeting ${quest.exercise_muscle}`);
    }
    
    return parts.join(', ');
  };

  const trophyRotateZ = trophyRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-180deg", "0deg"],
  });

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  if (completedQuests.length === 0) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>No quests completed</Text>
        <FormButton title="Continue" onPress={handleContinue} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Sparkles */}
      <View style={styles.sparklesContainer} pointerEvents="none">
        {Array.from({ length: 25 }).map((_, i) => (
          <Sparkle key={i} delay={i * 100} />
        ))}
      </View>

      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { scale: trophyScale },
                  { rotateZ: trophyRotateZ },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.iconGlow,
                {
                  opacity: glowOpacity,
                },
              ]}
            />
            <Ionicons name="trophy" size={64} color={colorPallet.primary} />
          </Animated.View>
          <Text style={styles.title}>
            {completedQuests.length === 1 ? "Quest Complete!" : "Quests Complete!"}
          </Text>
          <Text style={styles.subtitle}>
            {completedQuests.length === 1
              ? "You've completed a quest!"
              : `You've completed ${completedQuests.length} quests!`}
          </Text>
        </View>

        {/* Completed Quests List */}
        <ScrollView
          style={styles.questsList}
          contentContainerStyle={styles.questsListContent}
          showsVerticalScrollIndicator={false}
        >
          {completedQuests.map((quest, index) => (
            <Animated.View
              key={quest.id}
              style={[
                styles.questCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50 + index * 10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Quest Header */}
              <View style={styles.questHeader}>
                <View
                  style={[
                    styles.difficultyBadge,
                    {
                      backgroundColor: getDifficultyColor(quest.difficulty),
                    },
                  ]}
                >
                  <Text style={styles.difficultyText}>
                    {quest.difficulty.toUpperCase()}
                  </Text>
                </View>
                <Ionicons
                  name="checkmark-circle"
                  size={32}
                  color={colorPallet.secondary}
                />
              </View>

              {/* Quest Name */}
              <Text style={styles.questName}>{quest.name}</Text>

              {/* Quest Description */}
              <Text style={styles.questDescription}>
                {getQuestDescription(quest)}
              </Text>

              {/* Quest Progress */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '100%' }]} />
                </View>
                <Text style={styles.progressText}>
                  {quest.number_of_workouts_completed} / {quest.number_of_workouts_needed} completed
                </Text>
              </View>

              {/* Reward */}
              <View style={styles.rewardContainer}>
                <Ionicons
                  name="trophy-outline"
                  size={20}
                  color={colorPallet.primary}
                />
                <Text style={styles.rewardText}>
                  Reward: {getRewardText(quest.difficulty)}
                </Text>
              </View>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <FormButton title="Continue" onPress={handleContinue} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  sparklesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  container: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colorPallet.primary,
    padding: 24,
    maxHeight: "90%",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colorPallet.neutral_darkest,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colorPallet.primary,
  },
  iconGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colorPallet.primary,
    shadowColor: colorPallet.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 20,
  },
  title: {
    ...typography.h1,
    color: colorPallet.primary,
    fontSize: 36,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "900",
  },
  subtitle: {
    ...typography.body,
    color: colorPallet.neutral_2,
    fontSize: 16,
    textAlign: "center",
  },
  questsList: {
    flex: 1,
    marginBottom: 16,
  },
  questsListContent: {
    gap: 16,
    paddingBottom: 8,
  },
  questCard: {
    backgroundColor: colorPallet.neutral_darkest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
    padding: 16,
  },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    ...typography.body,
    fontSize: 12,
    fontWeight: "800",
    color: colorPallet.neutral_darkest,
  },
  questName: {
    ...typography.h2,
    color: colorPallet.neutral_lightest,
    fontSize: 20,
    marginBottom: 8,
    fontWeight: "700",
  },
  questDescription: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: colorPallet.neutral_5,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colorPallet.secondary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
    textAlign: 'center',
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colorPallet.neutral_5,
  },
  rewardText: {
    ...typography.body,
    color: colorPallet.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  buttonContainer: {
    paddingTop: 8,
  },
  errorText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 16,
    marginBottom: 20,
  },
});