import React from "react";
import { View, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import { globalStyles } from "../styles/globalStyles";
import { AUTH } from "../styles/authStyles";
import logo from "../assets/images/gainz_logo_full.png";

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
    <View style={AUTH.splashContainer}>
      <Animatable.Image
        animation={animation}
        duration={duration}
        delay={delay}
        source={logo}
        style={globalStyles.logo}
        resizeMode="contain"
      />
    </View>
  );
}
