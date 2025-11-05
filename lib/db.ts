import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db: Database.Database | null = null;

export function getDb() {
  if (db) return db;
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, 'midset.db');
  db = new Database(dbPath);
  tryLoadSqliteVss(db);
  return db;
}

function tryLoadSqliteVss(database: Database.Database) {
  try {
    // Path to sqlite-vss extension can be provided via env var
    const extPath = process.env.SQLITE_VSS_EXTENSION;
    if (extPath && fs.existsSync(extPath)) {
      // @ts-ignore - type missing for loadExtension
      database.loadExtension(extPath);
    }
  } catch (err) {
    console.warn('sqlite-vss extension failed to load (continuing without VSS):', err);
  }
}

