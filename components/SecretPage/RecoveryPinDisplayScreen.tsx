import { useTheme } from '@/hooks/ThemeContext';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../Common/PageHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

type RecoveryPinDisplayScreenProps = {
  pinToSave: string;
  onComplete: () => void;
};

const generateRecoveryPin = () => {
  let pin = '';
  for (let i = 0; i < 12; i++) {
    pin += Math.floor(Math.random() * 10).toString();
  }
  return pin;
};

export default function RecoveryPinDisplayScreen({ pinToSave, onComplete }: RecoveryPinDisplayScreenProps) {
  const [recoveryPin, setRecoveryPin] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const { colors } = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    const init = async () => {
      const generatedPin = generateRecoveryPin();
      setRecoveryPin(generatedPin);
      try {
        await AsyncStorage.setItem('secret_pin', pinToSave);
        await AsyncStorage.setItem('recovery_pin', generatedPin);
        setIsSaved(true);
      } catch (e) {
        console.error('Error saving pins', e);
        Alert.alert('Error', 'Failed to save PIN.');
      }
    };
    init();
  }, [pinToSave]);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(recoveryPin);
    Alert.alert('Copied!', 'Recovery PIN copied to clipboard.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title="Recovery PIN" navigation={navigation} />

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Important</Text>
        <Text style={[styles.description, { color: colors.text }]}>
          This is your 12-digit recovery PIN. If you forget your 4-digit PIN, you will need this to access your secret notes.
        </Text>

        <TouchableOpacity 
          style={[styles.pinBox, { borderColor: colors.border || '#2c2c2c', backgroundColor: colors.card || '#1f1f1f' }]}
          onPress={copyToClipboard}
        >
          <Text style={[styles.pinText, { color: colors.text }]}>
            {recoveryPin.match(/.{1,4}/g)?.join('-')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.continueButton, { borderColor: colors.border || '#2c2c2c' }]} 
            onPress={() => {
              if (isSaved) {
                onComplete();
              }
            }}
        >
          <Text style={[styles.continueButtonText, { color: colors.text }]}>I have saved it</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    opacity: 0.8,
  },
  pinBox: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  pinText: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 2,
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
