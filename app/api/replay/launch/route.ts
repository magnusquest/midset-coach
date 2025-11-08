import { NextRequest, NextResponse } from 'next/server';
import { launchReplay } from '../../../../lib/replay-launcher';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { filePath, gameId } = await req.json();
    
    if (!filePath) {
      return NextResponse.json({ error: 'filePath is required' }, { status: 400 });
    }
    
    // Get launch method from environment or default to 'both'
    const launchMethod = (process.env.REPLAY_LAUNCH_METHOD as 'protocol' | 'command' | 'both') || 'both';
    
    // Try to resolve the full file path
    // If filePath is just a filename, we might need to search for it
    let fullPath = filePath;
    
    // Check if it's an absolute path
    if (!path.isAbsolute(filePath)) {
      // Try common slippi directories
      const homeDir = process.env.HOME || process.env.USERPROFILE || '';
      const commonPaths = [
        path.join(homeDir, 'Slippi', filePath),
        path.join(homeDir, 'Documents', 'Slippi', filePath),
        path.join(homeDir, 'Downloads', filePath),
      ];
      
      for (const commonPath of commonPaths) {
        if (fs.existsSync(commonPath)) {
          fullPath = commonPath;
          break;
        }
      }
    }
    
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: `Replay file not found: ${filePath}` }, { status: 404 });
    }
    
    const success = await launchReplay(fullPath, launchMethod);
    
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

