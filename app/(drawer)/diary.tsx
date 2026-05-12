import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import FabMenu from '@/components/Common/FabMenu';
import { useTheme } from '@/hooks/ThemeContext';
import { useFocusEffect, useNavigation } from 'expo-router';
import PageHeader from '@/components/Common/PageHeader';
import { DiaryColors } from '@/constants/Colors';
import CalenderPicker from '@/components/DiaryPage/CalenderPicker';
import { useDiaryHandles, DiaryEntry } from '@/functions/DiaryHandles';
import NoteEditorOverlay from '@/components/Common/NoteEditorOverlay';
import ListEditorOverlay from '@/components/Common/ListEditorOverlay';

export default function DiaryScreen() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const {
    entries,
    selectedNote,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    editTasks,
    setEditTasks,
    loadData,
    handleOpenNote,
    handleNewTextNote,
    handleNewListNote,
    handleCloseNote,
    handleDeleteEntry
  } = useDiaryHandles(date);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [date])
  );

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Sticky Top Gradient Header */}
      <PageHeader title="Diary" navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Section */}
        <CalenderPicker date={date} showPicker={showPicker} setShowPicker={setShowPicker} onChange={onChange} />

        {/* Journal Entries Section */}
        <View style={styles.section}>

          <View style={styles.entriesGrid}>
            {entries.length === 0 ? (
              <Text style={{ color: DiaryColors.onSurfaceVariant, textAlign: 'center', marginTop: 40 }}>
                No entries for this date.
              </Text>
            ) : (
              entries.map((entry) => {
                let previewContent = '';
                if (entry.isList && Array.isArray(entry.content)) {
                  previewContent = entry.content.map(task => `${task.isCompleted ? '✓' : '○'} ${task.text}`).join('\n');
                } else {
                  previewContent = String(entry.content || '');
                }

                // Format time:
                const entryTime = new Date(entry.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                return (
                  <TouchableOpacity activeOpacity={0.9} onPress={() => handleOpenNote(entry)} key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                      <View style={styles.entryHeaderLeft}>
                        <View>
                          <Text style={styles.entryTitle}>{entry.title || "Untitled"}</Text>
                          <Text style={styles.entryDate}>{entryTime}</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)}>
                        <MaterialIcons name="delete-outline" size={24} color="#ff6b6b" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.entrySnippet} numberOfLines={5}>{previewContent}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <FabMenu onNewNote={handleNewTextNote} onNewListNote={handleNewListNote} />

      <NoteEditorOverlay
        selectedNote={selectedNote && !selectedNote.isList ? (selectedNote as any) : null}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editContent={editContent}
        setEditContent={setEditContent}
        onClose={handleCloseNote}
        contentPlaceholder={"Dear Diary..."}
      />

      <ListEditorOverlay
        isOpen={!!selectedNote && selectedNote.isList}
        listTitle={editTitle}
        setListTitle={setEditTitle}
        tasks={editTasks}
        setTasks={setEditTasks}
        onClose={handleCloseNote}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DiaryColors.surface,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  section: {
    marginBottom: 40,
  },
  entriesGrid: {
    gap: 24,
  },
  entryCard: {
    backgroundColor: '#1f1f1f',
    borderColor: '#2c2c2c',
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  entryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 13,
    color: '#a0a0a0',
  },
  entrySnippet: {
    fontSize: 15,
    lineHeight: 24,
    color: '#d0d0d0',
    marginBottom: 8,
  },
});