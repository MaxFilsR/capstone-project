import React from "react";
import { View } from "react-native";
import * as Animatable from "react-native-animatable";
import { containers, images } from "@/styles/index";
import logo from "@/assets/images/gainz_logo_full.png";

interface SplashScreenProps {
  animation?: string;
  duration?: number;
  delay?: number;
}

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
