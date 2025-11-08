import { NextRequest, NextResponse } from 'next/server';
import { launchReplay } from '../../../../lib/replay-launcher';
import { getDb } from '../../../../lib/db';
import { ensureSchema } from '../../../../lib/schema';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Replay launch request body:', body);
    
    const { filePath: gameFilename, gameId } = body;
    
    if (!gameFilename || typeof gameFilename !== 'string' || gameFilename.trim() === '') {
      console.error('Invalid gameFilename:', gameFilename);
      return NextResponse.json({ error: `gameFilename is required and must be a non-empty string. Received: ${JSON.stringify(gameFilename)}` }, { status: 400 });
    }
    
    // Get launch method from environment or default to 'both'
    const launchMethod = (process.env.REPLAY_LAUNCH_METHOD as 'protocol' | 'command' | 'both') || 'both';
    
    // Get the slippi folder path from settings
    ensureSchema();
    const db = getDb();
    const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
    const setting = getSetting.get('slippi_folder_path') as { value: string } | undefined;
    let slippiFolderPath = setting?.value;
    
    let fullReplayPath: string | null = null;
    
    // If slippi folder path is configured, use it
    if (slippiFolderPath && typeof slippiFolderPath === 'string' && slippiFolderPath.trim() !== '') {
      fullReplayPath = path.join(slippiFolderPath, gameFilename);
      if (fs.existsSync(fullReplayPath)) {
        console.log('Found replay file at configured path:', fullReplayPath);
      } else {
        console.log('File not found at configured path, trying fallback locations');
        fullReplayPath = null;
      }
    }
    
    // If not found or not configured, try common Slippi locations
    if (!fullReplayPath) {
      const homeDir = process.env.HOME || process.env.USERPROFILE || '';
      const commonPaths = [
        path.join(homeDir, 'Slippi'),
        path.join(homeDir, 'Documents', 'Slippi'),
        path.join(homeDir, 'Downloads'),
        path.join(homeDir, 'Desktop'),
      ];
      
      for (const basePath of commonPaths) {
        if (!fs.existsSync(basePath)) continue;
        
        // Try direct file in this directory
        const testPath = path.join(basePath, gameFilename);
        if (fs.existsSync(testPath)) {
          fullReplayPath = testPath;
          console.log('Found replay file in fallback location:', fullReplayPath);
          
          // Auto-save this path for future use
          if (!slippiFolderPath) {
            const setSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))');
            setSetting.run('slippi_folder_path', basePath);
            console.log('Auto-saved slippi folder path:', basePath);
          }
          break;
        }
        
        // Try recursive search in subdirectories (limit depth to avoid performance issues)
        try {
          const files = fs.readdirSync(basePath, { withFileTypes: true });
          for (const file of files) {
            // file here is a Dirent, so use .isDirectory() and .name
            if (file.isDirectory()) {
              const filePath = path.join(basePath, file.name);
              const testPath = path.join(filePath, gameFilename);
              if (fs.existsSync(testPath)) {
                fullReplayPath = testPath;
                console.log('Found replay file in subdirectory:', fullReplayPath);
                
                // Auto-save the parent directory path
                if (!slippiFolderPath) {
                  const setSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))');
                  setSetting.run('slippi_folder_path', filePath);
                  console.log('Auto-saved slippi folder path:', filePath);
                }
                break;
              }
            }
          }
          if (fullReplayPath) break;
        } catch (err) {
          // Skip directories we can't read
          continue;
        }
      }
    }
    
    if (!fullReplayPath || !fs.existsSync(fullReplayPath)) {
      console.error('Replay file not found:', gameFilename);
      return NextResponse.json({ 
        error: `Replay file not found: ${gameFilename}. Please ensure your Slippi folder is configured or the file exists in a common location.` 
      }, { status: 404 });
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

