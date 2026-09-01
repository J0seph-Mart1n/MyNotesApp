import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePreventScreenCapture } from 'expo-screen-capture';
import NotesListScreen from '@/components/Common/NotesListScreen';
import PinProtectedScreen from '@/components/SecretPage/PinProtectedScreen';

export default function SecretsScreen() {
  usePreventScreenCapture();

  return (
    <PinProtectedScreen title="Secrets">
      <NotesListScreen title="Secrets" isSecret={true} contentPlaceholder="Secret Content" />
    </PinProtectedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});