import { useTheme } from '@/hooks/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../Common/PageHeader';

const PIN_LENGTH = 4;

type PinSetupScreenProps = {
  onSetupComplete: (pin: string) => void;
};

export default function PinSetupScreen({ onSetupComplete }: PinSetupScreenProps) {
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState('');
  const { colors } = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    if (step === 'create' && pinInput.length === PIN_LENGTH) {
      setTimeout(() => {
        setStep('confirm');
        setError('');
      }, 300);
    } else if (step === 'confirm' && confirmPinInput.length === PIN_LENGTH) {
      if (pinInput === confirmPinInput) {
        setError('');
        onSetupComplete(pinInput);
      } else {
        setError('PINs do not match. Please try again.');
        setTimeout(() => {
          setConfirmPinInput('');
          setPinInput('');
          setStep('create');
        }, 800);
      }
    }
  }, [pinInput, confirmPinInput, step, onSetupComplete]);

  const handlePress = (val: string) => {
    setError('');
    if (step === 'create' && pinInput.length < PIN_LENGTH) {
      setPinInput((prev) => prev + val);
    } else if (step === 'confirm' && confirmPinInput.length < PIN_LENGTH) {
      setConfirmPinInput((prev) => prev + val);
    }
  };

  const handleDelete = () => {
    setError('');
    if (step === 'create') {
      setPinInput((prev) => prev.slice(0, -1));
    } else {
      setConfirmPinInput((prev) => prev.slice(0, -1));
    }
  };

  const currentInput = step === 'create' ? pinInput : confirmPinInput;
  const promptTitle = step === 'create' ? 'Create PIN' : 'Confirm PIN';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title="Set your PIN" navigation={navigation} />

      <View style={styles.contentContainer}>
        <Text style={[styles.promptTitle, { color: colors.text }]}>{promptTitle}</Text>

        <View style={styles.dotsContainer}>
          {[...Array(PIN_LENGTH)].map((_, i) => {
            const isFilled = i < currentInput.length;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: isFilled ? colors.text : 'transparent',
                    borderColor: colors.text
                  }
                ]}
              />
            );
          })}
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.spacerText}> </Text>
        )}

        <View style={styles.numpadContainer}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.numButton, { borderColor: colors.border || '#2c2c2c', backgroundColor: colors.card || '#1f1f1f' }]}
              activeOpacity={0.7}
              onPress={() => handlePress(num)}
            >
              <Text style={[styles.numText, { color: colors.text }]}>{num}</Text>
            </TouchableOpacity>
          ))}

          <View style={[styles.numButton, { backgroundColor: 'transparent', borderWidth: 0 }]} />
          <TouchableOpacity
            style={[styles.numButton, { borderColor: colors.border || '#2c2c2c', backgroundColor: colors.card || '#1f1f1f' }]}
            activeOpacity={0.7}
            onPress={() => handlePress('0')}
          >
            <Text style={[styles.numText, { color: colors.text }]}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.numButton, { backgroundColor: 'transparent', borderWidth: 0 }]}
            activeOpacity={0.7}
            onPress={handleDelete}
          >
            <Ionicons name="backspace-outline" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  promptTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  numpadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 320,
    gap: 15,
  },
  numButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  numText: {
    fontSize: 32,
    fontWeight: '400',
  },
  errorText: {
    color: '#ff6b6b',
    height: 20,
    marginBottom: 30,
    fontSize: 14,
    textAlign: 'center',
  },
  spacerText: {
    height: 20,
    marginBottom: 30,
  },
});
