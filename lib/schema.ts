import { getDb } from './db';

export function ensureSchema() {
  const db = getDb();
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT NOT NULL,
      date TEXT,
      character TEXT,
      opponent TEXT,
      stage TEXT,
      duration INTEGER,
      stocks_taken INTEGER,
      openings_per_kill REAL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER,
      content TEXT,
      content_audio_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (game_id) REFERENCES games(id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER,
      source TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (game_id) REFERENCES games(id)
    );

    -- Chunks table; embedding will be stored by sqlite-vss extension when available
    CREATE TABLE IF NOT EXISTS chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      chunk_index INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (document_id) REFERENCES documents(id)
    );
  `);

  // Attempt to create sqlite-vss virtual table/index; ignore errors if extension not loaded
  try {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS chunk_embeddings USING vss0(
        chunk_id INTEGER,
        embedding(1536)
      );
      CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
    `);
  } catch (e) {
    // Extension not loaded; continue without VSS
  }
}

