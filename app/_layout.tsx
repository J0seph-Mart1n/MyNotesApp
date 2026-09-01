import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useState } from 'react';
import { View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider as AppThemeProvider } from '@/hooks/ThemeContext';
import AnimatedSplashScreen from '@/components/Common/AnimatedSplashScreen';

export const unstable_settings = {
  anchor: '(drawer)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  return (
    <AppThemeProvider>
      <View style={{ flex: 1, backgroundColor: '#121212' }}>
        <Stack>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        </Stack>
        {!isSplashComplete && (
          <AnimatedSplashScreen onAnimationComplete={() => setIsSplashComplete(true)} />
        )}
      </View>
    </AppThemeProvider>
  );
}