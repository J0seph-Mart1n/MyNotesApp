import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useState } from 'react';
import { View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme, ThemeProvider as AppThemeProvider } from '@/hooks/ThemeContext';
import AnimatedSplashScreen from '@/components/Common/AnimatedSplashScreen';
import { PinAuthProvider } from '@/hooks/PinAuthContext';

export const unstable_settings = {
  anchor: '(drawer)',
};

function RootLayoutNav() {
  const { colors } = useTheme();
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      </Stack>
      {!isSplashComplete && (
        <AnimatedSplashScreen onAnimationComplete={() => setIsSplashComplete(true)} />
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <PinAuthProvider>
        <RootLayoutNav />
      </PinAuthProvider>
    </AppThemeProvider>
  );
}