import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthState = 'loading' | 'setup' | 'recovery_display' | 'entry' | 'forgot_pin' | 'authenticated';

interface PinAuthContextType {
  authState: AuthState;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  actualPin: string;
  setActualPin: React.Dispatch<React.SetStateAction<string>>;
  pinToSave: string;
  setPinToSave: React.Dispatch<React.SetStateAction<string>>;
}

const PinAuthContext = createContext<PinAuthContextType | undefined>(undefined);

export const PinAuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>('loading');
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

  useEffect(() => {
    checkPin();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Lock if app goes to background or becomes inactive
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setAuthState((prev) => (prev === 'authenticated' ? 'entry' : prev));
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <PinAuthContext.Provider
      value={{
        authState,
        setAuthState,
        actualPin,
        setActualPin,
        pinToSave,
        setPinToSave,
      }}
    >
      {children}
    </PinAuthContext.Provider>
  );
};

export const usePinAuth = () => {
  const context = useContext(PinAuthContext);
  if (context === undefined) {
    throw new Error('usePinAuth must be used within a PinAuthProvider');
  }
  return context;
};
