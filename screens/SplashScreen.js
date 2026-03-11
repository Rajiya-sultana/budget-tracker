import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const dotAnim1 = useRef(new Animated.Value(0.3)).current;
  const dotAnim2 = useRef(new Animated.Value(0.3)).current;
  const dotAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Fade + scale in the logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing loading dots
    const animateDot = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ])
      ).start();

    animateDot(dotAnim1, 0);
    animateDot(dotAnim2, 200);
    animateDot(dotAnim3, 400);
  }, []);

  return (
    <LinearGradient
      colors={["#7c3aed", "#8b5cf6", "#a78bfa"]}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.container}
    >
      {/* Logo area */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="wallet" size={52} color="#8b5cf6" />
        </View>
        <Text style={styles.appName}>Budget Tracker</Text>
        <Text style={styles.tagline}>Track. Save. Grow.</Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View style={[styles.dotsContainer, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.dot, { opacity: dotAnim1 }]} />
        <Animated.View style={[styles.dot, { opacity: dotAnim2 }]} />
        <Animated.View style={[styles.dot, { opacity: dotAnim3 }]} />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#4c1d95",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  appName: {
    fontSize: 34,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.75)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 80,
    flexDirection: "row",
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
});
