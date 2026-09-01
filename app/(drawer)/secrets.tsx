import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PinEntryScreen from '@/components/SecretPage/PinEntryScreen';
import NotesListScreen from '@/components/Common/NotesListScreen';
import PinSetupScreen from '@/components/SecretPage/PinSetupScreen';
import RecoveryPinDisplayScreen from '@/components/SecretPage/RecoveryPinDisplayScreen';
import ForgotPinScreen from '@/components/SecretPage/ForgotPinScreen';

type AuthState = 'loading' | 'setup' | 'recovery_display' | 'entry' | 'forgot_pin' | 'authenticated';

export default function SecretsScreen() {
  usePreventScreenCapture();

  const [authState, setAuthState] = useState<AuthState>('loading');
  const [appState, setAppState] = useState(AppState.currentState);
  const [actualPin, setActualPin] = useState('');
  const [pinToSave, setPinToSave] = useState('');

  const checkPin = async () => {
    try {
      const storedPin = await AsyncStorage.getItem('secret_pin');
      if (storedPin) {
        setActualPin(storedPin);
        setAuthState((prev) => (prev === 'authenticated' ? 'authenticated' : 'entry'));
      } else {
        setAuthState('setup');
      }
    } catch (e) {
      console.error(e);
      setAuthState('setup');
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkPin();
      return () => {
        // Run when switching tabs (unfocusing screen)
        // If we leave the screen, we should lock it if it was authenticated
        setAuthState((prev) => (prev === 'authenticated' ? 'entry' : prev));
      };
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
      // Lock if app goes to background or becomes inactive
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setAuthState((prev) => (prev === 'authenticated' ? 'entry' : prev));
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (appState !== 'active') {
    return <View style={styles.container} />;
  }

  if (authState === 'loading') {
    return <View style={styles.container} />;
  }

  if (authState === 'setup') {
    return (
      <PinSetupScreen 
        onSetupComplete={(pin) => {
          setPinToSave(pin);
          setAuthState('recovery_display');
        }} 
      />
    );
  }

  if (authState === 'recovery_display') {
    return (
      <RecoveryPinDisplayScreen 
        pinToSave={pinToSave}
        onComplete={() => {
            setActualPin(pinToSave);
            setAuthState('authenticated');
        }}
      />
    );
  }

  if (authState === 'forgot_pin') {
      return (
          <ForgotPinScreen 
              onReset={() => setAuthState('setup')}
              onCancel={() => setAuthState('entry')}
          />
      );
  }

  if (authState === 'entry') {
    return (
        <PinEntryScreen 
            actualPin={actualPin} 
            onUnlock={() => setAuthState('authenticated')} 
            onForgotPin={() => setAuthState('forgot_pin')}
        />
    );
  }

  return <NotesListScreen title="Secrets" isSecret={true} contentPlaceholder="Secret Content" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});