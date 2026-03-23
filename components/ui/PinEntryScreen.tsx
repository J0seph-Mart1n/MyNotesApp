import { useTheme } from '@/hooks/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SECRET_PIN = '1234'; // Default PIN
const PIN_LENGTH = 4;

type PinEntryScreenProps = {
  onUnlock: () => void;
};

export default function PinEntryScreen({ onUnlock }: PinEntryScreenProps) {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const { colors } = useTheme();

  // Automatically check PIN when it reaches the required length
  useEffect(() => {
    if (pinInput.length === PIN_LENGTH) {
      if (pinInput === SECRET_PIN) {
        setError('');
        onUnlock(); // Success!
      } else {
        setError('Incorrect PIN. Please try again.');
        // Briefly delay clearing so user can see they entered 4 digits
        setTimeout(() => setPinInput(''), 400);
      }
    }
  }, [pinInput, onUnlock]);

  const handlePress = (val: string) => {
    setError('');
    if (pinInput.length < PIN_LENGTH) {
      setPinInput((prev) => prev + val);
    }
  };

  const handleDelete = () => {
    setError('');
    setPinInput((prev) => prev.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.appTitle, { color: colors.text }]}>Enter PIN</Text>

      {/* Visual Dots for PIN length */}
      <View style={styles.dotsContainer}>
        {[...Array(PIN_LENGTH)].map((_, i) => {
          const isFilled = i < pinInput.length;
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

      {/* Error Message or Spacer */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.spacerText}> </Text>
      )}

      {/* Numpad Grid */}
      <View style={styles.numpadContainer}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numButton}
            activeOpacity={0.7}
            onPress={() => handlePress(num)}
          >
            <Text style={[styles.numText, { color: colors.text }]}>{num}</Text>
          </TouchableOpacity>
        ))}

        {/* Bottom Row */}
        <View style={[styles.numButton, { backgroundColor: 'transparent', borderWidth: 0 }]} />
        <TouchableOpacity
          style={styles.numButton}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
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
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2c2c2c',
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
