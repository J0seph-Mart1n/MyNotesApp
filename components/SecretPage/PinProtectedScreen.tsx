import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePinAuth } from '@/hooks/PinAuthContext';
import PinEntryScreen from '@/components/SecretPage/PinEntryScreen';
import PinSetupScreen from '@/components/SecretPage/PinSetupScreen';
import RecoveryPinDisplayScreen from '@/components/SecretPage/RecoveryPinDisplayScreen';
import ForgotPinScreen from '@/components/SecretPage/ForgotPinScreen';

interface PinProtectedScreenProps {
  children: React.ReactNode;
  title: string;
}

export default function PinProtectedScreen({ children, title }: PinProtectedScreenProps) {
  const { authState, setAuthState, actualPin, setActualPin, pinToSave, setPinToSave } = usePinAuth();

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
            title={title}
            actualPin={actualPin} 
            onUnlock={() => setAuthState('authenticated')} 
            onForgotPin={() => setAuthState('forgot_pin')}
        />
    );
  }

  // If authenticated
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});
