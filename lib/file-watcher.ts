import fs from 'fs';
import path from 'path';
import { getDb } from './db';
import { ensureSchema } from './schema';
import { parseSlippiBuffer } from './slippi';
import { upsertDocument } from './rag';
import { getCharacterName, getStageName, formatDuration } from './slippi-utils';
import crypto from 'crypto';

let watcher: fs.FSWatcher | null = null;
let watchedPath: string | null = null;

/**
 * Recursively finds all .slp files in a directory
 */
function findSlpFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively search subdirectories
        files.push(...findSlpFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.slp')) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
  }
  
  return files;
}

/**
 * Processes a single slippi file and adds it to the database if new
 */
async function processSlippiFile(filePath: string): Promise<boolean> {
  try {
    const db = getDb();
    const stats = fs.statSync(filePath);
    const fileMtime = Math.floor(stats.mtimeMs / 1000);
    const fileName = path.basename(filePath);
    
    // Check if file already exists in database
    const checkGame = db.prepare('SELECT id FROM games WHERE file_path = ? AND file_mtime = ?');
    const existing = checkGame.get(fileName, fileMtime) as { id: number } | undefined;
    
    if (existing) {
      return false; // Already processed
    }
    
    // Read and parse file
    const buffer = fs.readFileSync(filePath);
    const fileHash = crypto.createHash('md5').update(buffer).digest('hex');
    const parsed = parseSlippiBuffer(buffer);
    
    if (!parsed) {
      return false; // Failed to parse
    }
    
    // Insert game
    const insertGame = db.prepare(
      `INSERT INTO games (
        file_path,
        date,
        character,
        opponent,
        stage,
        duration,
        stocks_taken,
        openings_per_kill,
        win_loss,
        file_hash,
        file_mtime
      ) VALUES (
        @file_path,
        @date,
        @character,
        @opponent,
        @stage,
        @duration,
        @stocks_taken,
        @openings_per_kill,
        @win_loss,
        @file_hash,
        @file_mtime
      )`
    );
    
    const info = insertGame.run({
      file_path: fileName,
      date: parsed.date ?? null,
      character: parsed.character ?? null,
      opponent: parsed.opponent ?? null,
      stage: parsed.stage ?? null,
      duration: parsed.duration ?? null,
      stocks_taken: parsed.stocks_taken ?? null,
      openings_per_kill: parsed.openings_per_kill ?? null,
      win_loss: parsed.win_loss ?? null,
      file_hash: fileHash,
      file_mtime: fileMtime,
    });
    
    const gameId = Number(info.lastInsertRowid);
    
    // Create RAG document
    const characterName = getCharacterName(parsed.character);
    const opponentName = getCharacterName(parsed.opponent);
    const stageName = getStageName(parsed.stage);
    const durationFormatted = formatDuration(parsed.duration);
    
    const gameStatsText = `Game #${gameId} Statistics:
Matchup: ${characterName || 'Unknown'} vs ${opponentName || 'Unknown'}
Stage: ${stageName || 'Unknown'}
Duration: ${durationFormatted} (${parsed.duration} frames)
Stocks Taken: ${parsed.stocks_taken || 0}
Openings Per Kill (OPK): ${parsed.openings_per_kill ? parsed.openings_per_kill.toFixed(2) : 'N/A'}
${parsed.date ? `Date: ${new Date(parsed.date).toLocaleString()}` : ''}
${parsed.win_loss ? `Result: ${parsed.win_loss}` : ''}

This game shows ${parsed.openings_per_kill && parsed.openings_per_kill < 2 ? 'good' : parsed.openings_per_kill && parsed.openings_per_kill < 3 ? 'average' : 'needs improvement'} conversion rate. ${parsed.stocks_taken ? `You took ${parsed.stocks_taken} stock${parsed.stocks_taken > 1 ? 's' : ''}.` : ''}`;
    
    await upsertDocument({ gameId, source: 'slippi-stats', text: gameStatsText });
    
    return true; // Successfully processed
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err);
    return false;
  }
}

/**
 * Scans a directory for new slippi files and processes them
 */
export async function scanDirectory(dirPath: string): Promise<{ processed: number; skipped: number }> {
  ensureSchema();
  
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory does not exist: ${dirPath}`);
  }
  
  const files = findSlpFiles(dirPath);
  let processed = 0;
  let skipped = 0;
  
  for (const filePath of files) {
    const wasNew = await processSlippiFile(filePath);
    if (wasNew) {
      processed++;
    } else {
      skipped++;
    }
  }
  
  return { processed, skipped };
}

/**
 * Starts watching a directory for new slippi files
 */
export function startWatching(dirPath: string): void {
  if (watcher) {
    stopWatching();
  }
  
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory does not exist: ${dirPath}`);
  }
  
  watchedPath = dirPath;
  
  // Initial scan
  scanDirectory(dirPath).catch(err => {
    console.error('Error during initial scan:', err);
  });
  
  // Watch for file changes
  watcher = fs.watch(dirPath, { recursive: true }, async (eventType, filename) => {
    if (!filename || !filename.endsWith('.slp')) {
      return;
    }
    
    const filePath = path.join(dirPath, filename);
    
    // Wait a bit for file to be fully written
    setTimeout(async () => {
      try {
        if (fs.existsSync(filePath)) {
          await processSlippiFile(filePath);
        }
      } catch (err) {
        console.error(`Error processing new file ${filePath}:`, err);
      }
    }, 1000);
  });
  
  console.log(`Started watching directory: ${dirPath}`);
}

/**
 * Stops watching the directory
 */
export function stopWatching(): void {
  if (watcher) {
    watcher.close();
    watcher = null;
    watchedPath = null;
    console.log('Stopped watching directory');
  }
}

/**
 * Gets the current watch status
 */
export function getWatchStatus(): { watching: boolean; path: string | null } {
  return {
    watching: watcher !== null,
    path: watchedPath,
  };
}

