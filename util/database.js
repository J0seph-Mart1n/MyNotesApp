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
        created_at TEXT NOT NULL,
        is_secret INTEGER DEFAULT 0
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to init DB:", error);
  }
};

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
      'SELECT * FROM notes WHERE is_secret = ? ORDER BY created_at DESC',
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
        isList: Boolean(row.is_list)
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