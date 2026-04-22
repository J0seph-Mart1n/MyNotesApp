import * as SQLite from 'expo-sqlite';

// Open (or create) the database file
const db = SQLite.openDatabaseSync('notes.db');

// 1. Initialize the Table
export const initDB = async () => {
  try {
    // execAsync is for running multiple queries or schema setups
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT,
        body TEXT,
        is_list INTEGER DEFAULT 0,
        is_pinned INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        is_secret INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS diary_entries (
        id INTEGER PRIMARY KEY NOT NULL,
        entry_date TEXT NOT NULL,
        title TEXT,
        body TEXT,
        is_list INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to init DB:", error);
  }
};

// ========================
//    NOTES CRUD
// ========================

// 2. Insert Data
export const insertNotes = async (title, body, isSecret = 0, isList = 0) => {
  try {
    const date = new Date().toISOString();
    // runAsync is for INSERT/UPDATE/DELETE (writes)
    const result = await db.runAsync(
      'INSERT INTO notes (title, body, created_at, is_secret, is_list) VALUES (?, ?, ?, ?, ?)',
      [title, body, date, isSecret ? 1 : 0, isList ? 1 : 0]
    );
    return result;
  } catch (error) {
    console.error("Error inserting notes:", error);
  }
};

// 3. Fetch All Data
export const fetchNotes = async (isSecret = 0) => {
  try {
    const allRows = await db.getAllAsync(
      'SELECT * FROM notes WHERE is_secret = ? ORDER BY is_pinned DESC, created_at DESC',
      [isSecret ? 1 : 0]
    );
    // Map the SQLite 'body' column to the 'content' expected by the UI, and ensure ID is a string
    return allRows.map(row => {
      let parsedContent = row.body;
      if (row.is_list && typeof row.body === 'string') {
        try { parsedContent = JSON.parse(row.body); } catch (e) { }
      }
      return {
        id: row.id.toString(),
        title: row.title,
        content: parsedContent,
        isList: Boolean(row.is_list),
        isPinned: Boolean(row.is_pinned)
      };
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
};

// 4. Update Data
export const updateNotesDB = async (id, title, body, isList = 0) => {
  try {
    await db.runAsync(
      'UPDATE notes SET title = ?, body = ?, is_list = ? WHERE id = ?',
      [title, body, isList ? 1 : 0, id]
    );
  } catch (error) {
    console.error("Error updating notes:", error);
  }
};

// 5. Delete Data
export const deleteNotesDB = async (id) => {
  try {
    await db.runAsync(
      'DELETE FROM notes WHERE id = ?',
      [id]
    );
    // Return updated list so UI can refresh easily
    return await fetchNotes();
  } catch (error) {
    console.error("Error deleting notes:", error);
    return [];
  }
};

// 6. Update Pin Status
export const updateNotePinStatusDB = async (id, isPinned) => {
  try {
    await db.runAsync(
      'UPDATE notes SET is_pinned = ? WHERE id = ?',
      [isPinned ? 1 : 0, id]
    );
  } catch (error) {
    console.error("Error updating pin notes:", error);
  }
};

// ========================
//    DIARY CRUD
// ========================

// Helper: convert a Date object to 'YYYY-MM-DD' string
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Insert a diary entry for a specific date
export const insertDiaryEntry = async (date, title, body, isList = 0) => {
  try {
    const entryDate = toDateKey(date);
    const createdAt = new Date().toISOString();
    const result = await db.runAsync(
      'INSERT INTO diary_entries (entry_date, title, body, is_list, created_at) VALUES (?, ?, ?, ?, ?)',
      [entryDate, title, body, isList ? 1 : 0, createdAt]
    );
    return result;
  } catch (error) {
    console.error("Error inserting diary entry:", error);
  }
};

// Fetch all diary entries for a specific date
export const fetchDiaryEntries = async (date) => {
  try {
    const entryDate = toDateKey(date);
    const rows = await db.getAllAsync(
      'SELECT * FROM diary_entries WHERE entry_date = ? ORDER BY created_at DESC',
      [entryDate]
    );
    return rows.map(row => {
      let parsedContent = row.body;
      if (row.is_list && typeof row.body === 'string') {
        try { parsedContent = JSON.parse(row.body); } catch (e) { }
      }
      return {
        id: row.id.toString(),
        entryDate: row.entry_date,
        title: row.title,
        content: parsedContent,
        isList: Boolean(row.is_list),
        createdAt: row.created_at,
      };
    });
  } catch (error) {
    console.error("Error fetching diary entries:", error);
    return [];
  }
};

// Update a diary entry
export const updateDiaryEntry = async (id, title, body, isList = 0) => {
  try {
    await db.runAsync(
      'UPDATE diary_entries SET title = ?, body = ?, is_list = ? WHERE id = ?',
      [title, body, isList ? 1 : 0, id]
    );
  } catch (error) {
    console.error("Error updating diary entry:", error);
  }
};

// Delete a diary entry
export const deleteDiaryEntry = async (id) => {
  try {
    await db.runAsync(
      'DELETE FROM diary_entries WHERE id = ?',
      [id]
    );
  } catch (error) {
    console.error("Error deleting diary entry:", error);
  }
};