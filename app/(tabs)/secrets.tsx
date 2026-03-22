import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useFocusEffect } from 'expo-router';
import PinEntryScreen from '@/components/ui/PinEntryScreen';
import NotesListScreen from '@/components/ui/NotesListScreen';

export default function SecretsScreen() {
  usePreventScreenCapture();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Run when switching tabs (unfocusing screen)
        setIsAuthenticated(false);
      };
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
      // Lock if app goes to background or becomes inactive
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Provide a completely blank screen when the app is inactive (recent apps menu)
  if (appState !== 'active') {
    return <View style={styles.container} />;
  }

  if (!isAuthenticated) {
    return <PinEntryScreen onUnlock={() => setIsAuthenticated(true)} />;
  }

  return <NotesListScreen title="Secrets" isSecret={true} contentPlaceholder="Secret Content" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});
