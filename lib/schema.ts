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

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Add new columns to games table if they don't exist
  try {
    db.exec(`
      ALTER TABLE games ADD COLUMN file_hash TEXT;
    `);
  } catch (e) {
    // Column already exists, ignore
  }

  try {
    db.exec(`
      ALTER TABLE games ADD COLUMN file_mtime INTEGER;
    `);
  } catch (e) {
    // Column already exists, ignore
  }

  try {
    db.exec(`
      ALTER TABLE games ADD COLUMN win_loss TEXT;
    `);
  } catch (e) {
    // Column already exists, ignore
  }

  // Add note_type to notes table
  try {
    db.exec(`
      ALTER TABLE notes ADD COLUMN note_type TEXT;
    `);
  } catch (e) {
    // Column already exists, ignore
  }

  // Create indexes
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_games_file_path ON games(file_path);
      CREATE INDEX IF NOT EXISTS idx_games_character ON games(character);
      CREATE INDEX IF NOT EXISTS idx_games_opponent ON games(opponent);
      CREATE INDEX IF NOT EXISTS idx_games_stage ON games(stage);
      CREATE INDEX IF NOT EXISTS idx_games_win_loss ON games(win_loss);
      CREATE INDEX IF NOT EXISTS idx_notes_game_id ON notes(game_id);
      CREATE INDEX IF NOT EXISTS idx_notes_note_type ON notes(note_type);
    `);
  } catch (e) {
    // Indexes may already exist, ignore
  }

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

