import FabMenu from '@/components/Common/FabMenu';
import ListEditorOverlay from '@/components/Common/ListEditorOverlay';
import NoteEditorOverlay from '@/components/Common/NoteEditorOverlay';
import { useTheme } from '@/hooks/ThemeContext';
import { useFocusEffect, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectedNote from './SelectedNote';
import PageHeader from './PageHeader';
import NoteRender from './NoteRender';
import { useNoteHandles, Note } from '@/functions/NoteHandles';

type NotesListScreenProps = {
  title: string;
  isSecret: boolean;
  contentPlaceholder?: string;
};

export default function NotesListScreen({ title, isSecret, contentPlaceholder }: NotesListScreenProps) {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const {
    notes,
    selectedNote,
    selectedNoteIds,
    setSelectedNoteIds,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    editTasks,
    setEditTasks,
    loadData,
    toggleSelection,
    handleDeleteSelected,
    handlePinSelected,
    handleOpenNote,
    handleNewTextNote,
    handleNewListNote,
    handleCloseNote
  } = useNoteHandles(isSecret);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(note => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (note.title && note.title.toLowerCase().includes(q)) return true;
    if (typeof note.content === 'string') {
      return note.content.toLowerCase().includes(q);
    }
    if (Array.isArray(note.content)) {
      return note.content.some(task => task.text.toLowerCase().includes(q));
    }
    return false;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  const isPinAction = !selectedNoteIds.every(id => notes.find(n => n.id === id)?.isPinned);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: selectedNote ? { display: 'none' } : {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
      },
    });
  }, [selectedNote, navigation, colors]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [isSecret])
  );

  const renderNoteCard = (item: Note) => {
    let previewContent = '';
    if (item.isList && Array.isArray(item.content)) {
      // Create a nice preview of the checklist items
      previewContent = item.content.map(task => `${task.isCompleted ? '✓' : '○'} ${task.text}`).join('\n');
    } else {
      previewContent = String(item.content || '');
    }

    const isSelected = selectedNoteIds.includes(item.id);

    return (
      <View key={item.id} style={styles.gridItem}>
        <NoteRender
          item={item}
          isSelected={isSelected}
          colors={colors}
          handleOpenNote={handleOpenNote}
          toggleSelection={toggleSelection}
          previewContent={previewContent}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {selectedNoteIds.length > 0 ? (
        <SelectedNote 
          selectedNoteIds={selectedNoteIds} 
          colors={colors} 
          handleDeleteSelected={handleDeleteSelected} 
          setSelectedNoteIds={setSelectedNoteIds}
          handlePinSelected={handlePinSelected}
          isPinAction={isPinAction}
        />
      ) : (
        <PageHeader title={title} navigation={navigation} />
      )}

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.subText} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search notes..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.subText} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {pinnedNotes.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pinned</Text>
            <View style={styles.gridContainer}>
              {pinnedNotes.map(renderNoteCard)}
            </View>
          </View>
        )}

        {otherNotes.length > 0 && (
          <View style={styles.sectionContainer}>
            {pinnedNotes.length > 0 && ( // Only show "Others" title if there are pinned notes to separate them from
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Others</Text>
            )}
            <View style={styles.gridContainer}>
              {otherNotes.map(renderNoteCard)}
            </View>
          </View>
        )}
        
        {filteredNotes.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.subText }]}>No notes found.</Text>
        )}
      </ScrollView>

      <FabMenu onNewNote={handleNewTextNote} onNewListNote={handleNewListNote} />

      <NoteEditorOverlay
        selectedNote={selectedNote && !selectedNote.isList ? (selectedNote as any) : null}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editContent={editContent}
        setEditContent={setEditContent}
        onClose={handleCloseNote}
        contentPlaceholder={contentPlaceholder || "Note"}
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
    backgroundColor: '#121212',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 32,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1.2,
    marginLeft: 12,
    marginBottom: 12,
    opacity: 0.8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});