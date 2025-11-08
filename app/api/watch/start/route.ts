import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema } from '../../../../lib/schema';
import { getDb } from '../../../../lib/db';
import { startWatching } from '../../../../lib/file-watcher';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    ensureSchema();
    const { path: dirPath } = await req.json();
    
    if (!dirPath || typeof dirPath !== 'string') {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }
    
    // Store path in settings
    const db = getDb();
    const setSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))');
    setSetting.run('slippi_folder_path', dirPath);
    
    // Start watching
    startWatching(dirPath);
    
    return NextResponse.json({ ok: true, path: dirPath });
  } catch (error: any) {
    console.error('Error starting watch:', error);
    return NextResponse.json({ error: error.message || 'Failed to start watching' }, { status: 500 });
  }
}

