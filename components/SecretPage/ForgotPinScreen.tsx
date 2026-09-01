import { useTheme } from '@/hooks/ThemeContext';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../Common/PageHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ForgotPinScreenProps = {
  onReset: () => void;
  onCancel: () => void;
};

export default function ForgotPinScreen({ onReset, onCancel }: ForgotPinScreenProps) {
  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState('');
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handleVerify = async () => {
    setError('');
    const cleanInput = inputPin.replace(/[^0-9]/g, '');
    
    if (cleanInput.length !== 12) {
        setError('Recovery PIN must be 12 digits long.');
        return;
    }

    try {
      const storedRecoveryPin = await AsyncStorage.getItem('recovery_pin');
      if (cleanInput === storedRecoveryPin) {
        // Clear the old PINs so user can set a new one
        await AsyncStorage.removeItem('secret_pin');
        await AsyncStorage.removeItem('recovery_pin');
        onReset();
      } else {
        setError('Incorrect recovery PIN. Please try again.');
      }
    } catch (e) {
      console.error('Error verifying recovery pin', e);
      Alert.alert('Error', 'Failed to verify recovery PIN.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title="Forgot PIN" navigation={navigation} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.contentContainer}>
            <Text style={[styles.promptTitle, { color: colors.text }]}>Recover Access</Text>
            <Text style={[styles.description, { color: colors.text }]}>
                Enter the 12-digit recovery PIN that was generated when you first set up your Secret Notes.
            </Text>

            <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border || '#2c2c2c', backgroundColor: colors.card || '#1f1f1f' }]}
                placeholder="12-digit Recovery PIN"
                placeholderTextColor={colors.text + '80'}
                keyboardType="numeric"
                value={inputPin}
                onChangeText={setInputPin}
                maxLength={14} // to allow hyphens if user pastes them, though we strip them
            />

            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <Text style={styles.spacerText}> </Text>
            )}

            <TouchableOpacity 
                style={[styles.verifyButton, { backgroundColor: colors.tint || '#0a7ea4' }]} 
                onPress={handleVerify}
            >
                <Text style={styles.buttonText}>Verify & Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onCancel}
            >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  promptTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 16,
  },
  verifyButton: {
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff6b6b',
    height: 20,
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  spacerText: {
    height: 20,
    marginBottom: 16,
  },
});
