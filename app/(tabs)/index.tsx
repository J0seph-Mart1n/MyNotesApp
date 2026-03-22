import React from 'react';
import NotesListScreen from '@/components/ui/NotesListScreen';

export default function HomeScreen() {
  return <NotesListScreen title="Notes" isSecret={false} />;
}
