import FabMenu from '@/components/Common/FabMenu';
import ListEditorOverlay from '@/components/Common/ListEditorOverlay';
import NoteEditorOverlay from '@/components/Common/NoteEditorOverlay';
import { useTheme } from '@/hooks/ThemeContext';
import { deleteNotesDB, fetchNotes, insertNotes, updateNotesDB } from '@/constants/database';
import { useFocusEffect, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TaskItem = {
  id: string;
  text: string;
  isCompleted: boolean;
};

type Note = {
  id: string;
  title: string;
  content: string | TaskItem[];
  isList: boolean;
};

type NotesListScreenProps = {
  title: string;
  isSecret: boolean;
  contentPlaceholder?: string;
};

export default function NotesListScreen({ title, isSecret, contentPlaceholder }: NotesListScreenProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const navigation = useNavigation();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { colors } = useTheme();

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

  const loadData = async () => {
    try {
      const data = await fetchNotes(isSecret ? 1 : 0);
      setNotes(data as Note[]);
    } catch (e) {
      console.error("Failed to load notes", e);
    }
  };

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTasks, setEditTasks] = useState<TaskItem[]>([]);

  const handleOpenNote = (note: Note) => {
    setEditTitle(note.title || '');
    if (note.isList) {
      setEditTasks(Array.isArray(note.content) ? note.content : []);
      setEditContent('');
    } else {
      setEditContent(typeof note.content === 'string' ? note.content : '');
      setEditTasks([]);
    }
    setSelectedNote(note);
  };

  const handleNewTextNote = () => {
    handleOpenNote({ id: Date.now().toString(), title: '', content: '', isList: false });
  };

  const handleNewListNote = () => {
    handleOpenNote({ id: Date.now().toString(), title: '', content: [{ id: Date.now().toString(), text: '', isCompleted: false }], isList: true });
  };

  const handleCloseNote = async () => {
    if (!selectedNote) return;
    const exists = notes.some((n) => n.id === selectedNote.id);

    const isBlankText = !selectedNote.isList && !editTitle.trim() && !editContent.trim();

    // Clean up completely empty task rows before saving
    const validTasks = editTasks.filter(task => task.text.trim().length > 0);

    const isBlankList = selectedNote.isList && !editTitle.trim() && validTasks.length === 0;
    const isBlank = isBlankText || isBlankList;

    const finalBody = selectedNote.isList ? JSON.stringify(validTasks) : editContent;
    const finalIsList = selectedNote.isList ? 1 : 0;

    if (exists) {
      if (isBlank) {
        await deleteNotesDB(selectedNote.id);
      } else {
        await updateNotesDB(selectedNote.id, editTitle, finalBody, finalIsList);
      }
    } else {
      if (!isBlank) {
        await insertNotes(editTitle, finalBody, isSecret ? 1 : 0, finalIsList);
      }
    }
    loadData();
    setSelectedNote(null);
  };

  const renderNote = ({ item }: { item: Note }) => {
    let previewContent = '';
    if (item.isList && Array.isArray(item.content)) {
      // Create a nice preview of the checklist items
      previewContent = item.content.map(task => `${task.isCompleted ? '✓' : '○'} ${task.text}`).join('\n');
    } else {
      previewContent = String(item.content || '');
    }

    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.noteTile} onPress={() => handleOpenNote(item)}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.noteContent} numberOfLines={6}>
          {previewContent}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.appTitle, { color: colors.text }]}>{title}</Text>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNote}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

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
    </View>
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
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  noteTile: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  noteContent: {
    fontSize: 14,
    color: '#d0d0d0',
    lineHeight: 20,
  },
});