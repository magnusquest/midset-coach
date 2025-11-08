import { NextRequest, NextResponse } from 'next/server';
import { launchReplay } from '../../../../lib/replay-launcher';
import { getDb } from '../../../../lib/db';
import { ensureSchema } from '../../../../lib/schema';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { filePath: gameFilename, gameId } = await req.json();
    
    if (!gameFilename) {
      return NextResponse.json({ error: 'gameFilename is required' }, { status: 400 });
    }
    
    // Get launch method from environment or default to 'both'
    const launchMethod = (process.env.REPLAY_LAUNCH_METHOD as 'protocol' | 'command' | 'both') || 'both';
    
    // Get the slippi folder path from settings
    ensureSchema();
    const db = getDb();
    const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
    const setting = getSetting.get('slippi_folder_path') as { value: string } | undefined;
    const slippiFolderPath = setting?.value;
    
    if (!slippiFolderPath) {
      return NextResponse.json({ error: 'Slippi folder path not configured. Please select a Slippi folder first.' }, { status: 400 });
    }
    
    // Construct the full file path by prepending the slippi folder path to the game filename
    const fullReplayPath = path.join(slippiFolderPath, gameFilename);
    
    if (!fs.existsSync(fullReplayPath)) {
      return NextResponse.json({ error: `Replay file not found: ${fullReplayPath}` }, { status: 404 });
    }
    
    const success = await launchReplay(fullReplayPath, launchMethod);
    
    if (success) {
      return NextResponse.json({ ok: true, method: launchMethod });
    } else {
      return NextResponse.json({ error: 'Failed to launch replay' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error launching replay:', error);
    return NextResponse.json({ error: error.message || 'Failed to launch replay' }, { status: 500 });
  }
}

