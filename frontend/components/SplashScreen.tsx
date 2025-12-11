/**
 * Splash Screen Component
 * 
 * Animated splash screen displayed during app initialization. Shows the app
 * logo with configurable animation settings including animation type, duration,
 * and delay. Uses react-native-animatable for entrance animations.
 */

import React from "react";
import { View } from "react-native";
import * as Animatable from "react-native-animatable";
import { containers, images } from "@/styles/index";
import logo from "@/assets/images/gainz_logo_full.png";

// ============================================================================
// Types
// ============================================================================

interface SplashScreenProps {
  animation?: string;
  duration?: number;
  delay?: number;
}

// ============================================================================
// Component
// ============================================================================

export default function SplashScreen({
  animation = "fadeInUp",
  duration = 1500,
  delay = 500,
}: SplashScreenProps) {
  return (
    <View style={containers.splashContainer}>
      <Animatable.Image
        animation={animation}
        duration={duration}
        delay={delay}
        source={logo}
        style={images.logo}
        resizeMode="contain"
      />
    </View>
  );
}