import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema } from '../../../lib/schema';
import { getDb } from '../../../lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    ensureSchema();
    const db = getDb();
    
    // Disable foreign key checks temporarily
    db.exec(`PRAGMA foreign_keys = OFF`);
    
    // Clear all tables in order (children first, then parents)
    // Delete in reverse order of dependencies to avoid foreign key constraints
    db.exec(`
      DELETE FROM chunks;
      DELETE FROM notes;
      DELETE FROM documents;
      DELETE FROM games;
      
      -- Reset auto-increment counters
      DELETE FROM sqlite_sequence WHERE name IN ('games', 'notes', 'documents', 'chunks');
    `);
    
    // Re-enable foreign key checks
    db.exec(`PRAGMA foreign_keys = ON`);
    
    return NextResponse.json({ ok: true, message: 'Database cleared successfully' });
  } catch (error: any) {
    console.error('Error clearing database:', error);
    // Re-enable foreign keys even if there's an error
    try {
      const db = getDb();
      db.exec(`PRAGMA foreign_keys = ON`);
    } catch {}
    return NextResponse.json({ error: error.message || 'Failed to clear database' }, { status: 500 });
  }
}

