import { useState, useCallback } from 'react';
import { fetchDiaryEntries, insertDiaryEntry, updateDiaryEntry, deleteDiaryEntry } from '@/constants/database';

export type TaskItem = {
  id: string;
  text: string;
  isCompleted: boolean;
};

export type DiaryEntry = {
  id: string;
  entryDate: string;
  title: string;
  content: string | TaskItem[];
  isList: boolean;
  createdAt: string;
};

export function useDiaryHandles(date: Date) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedNote, setSelectedNote] = useState<DiaryEntry | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTasks, setEditTasks] = useState<TaskItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchDiaryEntries(date);
      setEntries(data as DiaryEntry[]);
    } catch (e) {
      console.error("Failed to load diary entries", e);
    }
  }, [date]);

  const handleOpenNote = (note: DiaryEntry) => {
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
    handleOpenNote({ id: '', entryDate: '', title: '', content: '', isList: false, createdAt: '' });
  };

  const handleNewListNote = () => {
    handleOpenNote({ id: '', entryDate: '', title: '', content: [{ id: Date.now().toString(), text: '', isCompleted: false }], isList: true, createdAt: '' });
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteDiaryEntry(id);
    loadData();
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  };

  const handleCloseNote = async () => {
    if (!selectedNote) return;
    const isNew = selectedNote.id === '';

    const isBlankText = !selectedNote.isList && !editTitle.trim() && !editContent.trim();
    const validTasks = editTasks.filter(task => task.text.trim().length > 0);
    const isBlankList = selectedNote.isList && !editTitle.trim() && validTasks.length === 0;
    const isBlank = isBlankText || isBlankList;

    const finalBody = selectedNote.isList ? JSON.stringify(validTasks) : editContent;
    const finalIsList = selectedNote.isList ? 1 : 0;

    if (!isNew) {
      // Existing note
      if (isBlank) {
        await deleteDiaryEntry(selectedNote.id);
      } else {
        await updateDiaryEntry(selectedNote.id, editTitle, finalBody, finalIsList);
      }
    } else {
      // New note
      if (!isBlank) {
        await insertDiaryEntry(date, editTitle, finalBody, finalIsList);
      }
    }
    loadData();
    setSelectedNote(null);
  };

  return {
    entries,
    selectedNote,
    setSelectedNote,
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
  };
}
