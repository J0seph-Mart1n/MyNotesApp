import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

type AnimatedSplashScreenProps = {
  onAnimationComplete: () => void;
};

// Prevent the native splash screen from hiding automatically
SplashScreen.preventAutoHideAsync().catch(() => {
  // It's okay if this fails in some edge cases (e.g. reloading the app in dev mode)
});

export default function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
  const containerOpacity = useSharedValue(1);
  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(1);

  useEffect(() => {
    const startAnimation = async () => {
      // Hide the native splash screen immediately, our React view takes over
      await SplashScreen.hideAsync();

      // Sequence: 
      // 1. Wait a moment
      // 2. Pulse scale slightly down then up
      // 3. Fade out the whole container

      logoScale.value = withDelay(
        500,
        withSequence(
          withTiming(0.9, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(10, { duration: 600, easing: Easing.in(Easing.exp) }) // Zoom way in
        )
      );

      logoOpacity.value = withDelay(
        800,
        withTiming(0, { duration: 300 })
      );

      containerOpacity.value = withDelay(
        900,
        withTiming(0, { duration: 400 }, (isFinished) => {
          if (isFinished) {
            runOnJS(onAnimationComplete)();
          }
        })
      );
    };

    startAnimation();
  }, [containerOpacity, logoScale, logoOpacity, onAnimationComplete]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
    };
  });

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Animated.Image
        source={require('../../assets/images/custom-splash.jpg')}
        style={[styles.image, animatedLogoStyle]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // Ensure it sits on top of everything while animating
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
