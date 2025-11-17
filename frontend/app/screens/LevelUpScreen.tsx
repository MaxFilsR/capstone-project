import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { FormButton } from "@/components";

// Confetti piece animation
const ConfettiPiece = ({ delay = 0, color = "#FFD700", id = 0 }) => {
  const { width, height } = Dimensions.get("window");
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(Math.random() * width)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const driftAmount = (Math.random() - 0.5) * 200;

  useEffect(() => {
    const startAnimation = () => {
      translateY.setValue(-50);
      translateX.setValue(Math.random() * width);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height + 100,
          duration: 3000 + Math.random() * 2000,
          delay,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(translateX, {
          toValue: translateX._value + driftAmount,
          duration: 3000 + Math.random() * 2000,
          delay,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.loop(
          Animated.timing(rotate, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.linear,
          })
        ),
      ]).start(({ finished }) => {
        if (finished) startAnimation();
      });
    };

    startAnimation();
  }, []);

  const rotateZ = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: 10,
        height: 10,
        backgroundColor: color,
        transform: [{ translateX }, { translateY }, { rotateZ }],
        top: 0,
        left: 0,
      }}
    />
  );
};

type Params = {
  oldLevel: string;
  newLevel: string;
  levelsGained: string;
  workoutName: string;
  workoutTime: string;
  points: string;
  exercises: string;
};

export default function LevelUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();

  const [showButton, setShowButton] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Animation values
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scaleLevel = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const levelNumberScale = useRef(new Animated.Value(0.3)).current; // start visible but small
  const levelNumberRotate = useRef(new Animated.Value(0)).current;

  const oldLevel = parseInt(params.oldLevel || "1");
  const newLevel = parseInt(params.newLevel || "2");
  const levelsGained = parseInt(params.levelsGained || "1");

  useEffect(() => {
    // === 1. Start confetti & circle badge animation together ===
    setTimeout(() => {
      setShowConfetti(true);

      Animated.parallel([
        Animated.spring(levelNumberScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(levelNumberRotate, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // === 2. Run background + LEVEL UP text animation ===
    Animated.sequence([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleLevel, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Show continue button after main animations finish
      setShowButton(true);
    });

    // === 3. Continuous glow pulse ===
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
  }, []);

  const handleContinue = () => {
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

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const levelNumberRotateZ = levelNumberRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "0deg"],
  });

  const confettiColors = [
    colorPallet.primary,
    colorPallet.secondary,
    "#FFD700",
    "#FFA500",
    "#FF6B6B",
    "#4ECDC4",
  ];

  return (
    <View style={styles.container}>
      {/* Animated Background Overlay */}
      <Animated.View style={[styles.overlay, { opacity: fadeIn }]} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* LEVEL UP Text with glow */}
        <Animated.View
          style={[
            styles.levelUpContainer,
            {
              transform: [{ scale: scaleLevel }],
              opacity: fadeIn,
            },
          ]}
        >
          <Animated.View style={[styles.glow, { opacity: glowOpacity }]}>
            <Text style={styles.levelUpTextGlow}>LEVEL UP!</Text>
          </Animated.View>
          <Text style={styles.levelUpText}>LEVEL UP!</Text>
        </Animated.View>

        {/* Level Number (circle badge) */}
        <Animated.View
          style={[
            styles.levelNumberContainer,
            {
              transform: [
                { scale: levelNumberScale },
                { rotateZ: levelNumberRotateZ },
              ],
            },
          ]}
        >
          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>LEVEL</Text>
            <Text style={styles.levelNumber}>{newLevel}</Text>
          </View>
        </Animated.View>

        {/* Levels gained indicator */}
        {levelsGained > 1 && (
          <Animated.View
            style={[styles.levelsGainedContainer, { opacity: fadeIn }]}
          >
            <Text style={styles.levelsGainedText}>+{levelsGained} Levels!</Text>
          </Animated.View>
        )}

        {/* Stats */}
        <Animated.View style={[styles.statsContainer, { opacity: fadeIn }]}>
          <Text style={styles.statsText}>
            {oldLevel} → {newLevel}
          </Text>
          <Text style={styles.flavorText}>Your training is paying off!</Text>
        </Animated.View>

        {/* Continue Button */}
        {showButton && (
          <Animated.View style={[styles.buttonContainer, { opacity: fadeIn }]}>
            <FormButton
              title="Continue"
              onPress={handleContinue}
              style={styles.continueButton}
            />
          </Animated.View>
        )}
      </View>

      {/* Confetti */}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {Array.from({ length: 350 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              id={i}
              delay={i * 15}
              color={confettiColors[i % confettiColors.length]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  levelUpContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  levelUpTextGlow: {
    fontSize: 64,
    fontWeight: "900",
    color: colorPallet.primary,
    textAlign: "center",
    textShadowColor: colorPallet.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    letterSpacing: 4,
  },
  levelUpText: {
    fontSize: 64,
    fontWeight: "900",
    color: colorPallet.neutral_lightest,
    textAlign: "center",
    textShadowColor: colorPallet.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 4,
  },
  levelNumberContainer: {
    marginBottom: 20,
  },
  levelBadge: {
    backgroundColor: colorPallet.primary,
    borderRadius: 100,
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: colorPallet.secondary,
    shadowColor: colorPallet.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: colorPallet.neutral_darkest,
    letterSpacing: 2,
  },
  levelNumber: {
    fontSize: 80,
    fontWeight: "900",
    color: colorPallet.neutral_lightest,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  levelsGainedContainer: {
    marginBottom: 20,
    backgroundColor: colorPallet.secondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelsGainedText: {
    fontSize: 24,
    fontWeight: "800",
    color: colorPallet.neutral_darkest,
  },
  statsContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  statsText: {
    fontSize: 28,
    fontWeight: "700",
    color: colorPallet.neutral_lightest,
    marginBottom: 8,
  },
  flavorText: {
    fontSize: 16,
    fontWeight: "600",
    color: colorPallet.neutral_3,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 20,
  },
  continueButton: {
    minWidth: 200,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
});
