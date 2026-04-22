import { useState, useCallback } from 'react';
import { deleteNotesDB, insertNotes, updateNotesDB, fetchNotes, updateNotePinStatusDB } from '@/constants/database';

export type TaskItem = {
  id: string;
  text: string;
  isCompleted: boolean;
};

export type Note = {
  id: string;
  title: string;
  content: string | TaskItem[];
  isList: boolean;
  isPinned?: boolean;
};

export function useNoteHandles(isSecret: boolean) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTasks, setEditTasks] = useState<TaskItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchNotes(isSecret ? 1 : 0);
      setNotes(data as Note[]);
    } catch (e) {
      console.error("Failed to load notes", e);
    }
  }, [isSecret]);

  const toggleSelection = (id: string) => {
    setSelectedNoteIds(prev =>
      prev.includes(id) ? prev.filter(noteId => noteId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    await Promise.all(selectedNoteIds.map(id => deleteNotesDB(id)));
    setSelectedNoteIds([]);
    loadData();
  };

  const handlePinSelected = async () => {
    const allPinned = selectedNoteIds.every(id => notes.find(n => n.id === id)?.isPinned);
    const targetPinStatus = !allPinned; // If ANY are unpinned, pin them all. Only UNPIN if ALL are already pinned.
    await Promise.all(selectedNoteIds.map(id => updateNotePinStatusDB(id, targetPinStatus)));
    setSelectedNoteIds([]);
    loadData();
  };

  const handleOpenNote = (note: Note) => {
    if (selectedNoteIds.length > 0) {
      toggleSelection(note.id);
      return;
    }
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

  return {
    notes,
    setNotes,
    selectedNote,
    setSelectedNote,
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
  };
}
