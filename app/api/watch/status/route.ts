import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema } from '../../../../lib/schema';
import { getDb } from '../../../../lib/db';
import { getWatchStatus } from '../../../../lib/file-watcher';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  try {
    ensureSchema();
    const status = getWatchStatus();
    
    // Get stored path from settings
    const db = getDb();
    const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
    const setting = getSetting.get('slippi_folder_path') as { value: string } | undefined;
    const storedPath = setting?.value || null;
    
    return NextResponse.json({
      watching: status.watching,
      path: status.path || storedPath,
    });
  } catch (error: any) {
    console.error('Error getting watch status:', error);
    return NextResponse.json({ error: error.message || 'Failed to get watch status' }, { status: 500 });
  }
}

