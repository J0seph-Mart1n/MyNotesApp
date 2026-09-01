import { useTheme } from '@/hooks/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../Common/PageHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native';

const PIN_LENGTH = 4;

interface PinEntryProps {
  actualPin: string;
  onUnlock: () => void;
  onForgotPin: () => void;
  title: string;
}

export default function PinEntryScreen({ actualPin, onUnlock, onForgotPin, title }: PinEntryProps) {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Automatically check PIN when it reaches the required length
  useEffect(() => {
    if (pinInput.length === PIN_LENGTH) {
      if (pinInput === actualPin) {
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
    <SafeAreaView style={styles.container}>
      <PageHeader title={title} navigation={navigation}/>

      <View style={styles.contentContainer}>
        <Text style={[styles.promptTitle, { color: colors.text }]}>Enter PIN</Text>

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

      <TouchableOpacity onPress={onForgotPin} style={styles.forgotButton}>
        <Text style={[styles.forgotButtonText, { color: colors.text }]}>Forgot PIN?</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
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
  forgotButton: {
    marginTop: 40,
    padding: 10,
  },
  forgotButtonText: {
    fontSize: 16,
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
});