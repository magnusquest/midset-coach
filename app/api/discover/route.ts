import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ensureSchema } from '../../../lib/schema';
import { getDb } from '../../../lib/db';
import { parseSlippiBuffer } from '../../../lib/slippi';
import { upsertDocument } from '../../../lib/rag';
import { getCharacterName, getStageName, formatDuration } from '../../../lib/slippi-utils';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  ensureSchema();
  const db = getDb();
  const slippiDir = path.join(process.env.HOME || process.cwd(), 'Slippi');
  if (!fs.existsSync(slippiDir)) return NextResponse.json({ ok: true, imported: 0, results: [] });
  const files = fs.readdirSync(slippiDir).filter((f) => f.endsWith('.slp'));

  const insertGame = db.prepare(
    `INSERT INTO games (
      file_path,
      date,
      character,
      opponent,
      stage,
      duration,
      stocks_taken,
      openings_per_kill
    ) VALUES (
      @file_path,
      @date,
      @character,
      @opponent,
      @stage,
      @duration,
      @stocks_taken,
      @openings_per_kill
    )`
  );
  const results: any[] = [];
  for (const name of files) {
    try {
      const buffer = fs.readFileSync(path.join(slippiDir, name));
      const parsed = parseSlippiBuffer(buffer);
      if (!parsed) continue;
      const info = insertGame.run({
        file_path: name,
        date: parsed.date ?? null,
        character: parsed.character ?? null,
        opponent: parsed.opponent ?? null,
        stage: parsed.stage ?? null,
        duration: parsed.duration ?? null,
        stocks_taken: parsed.stocks_taken ?? null,
        openings_per_kill: parsed.openings_per_kill ?? null,
      });
      const gameId = Number(info.lastInsertRowid);
      
      // Create a detailed document with game stats for RAG using readable names
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

This game shows ${parsed.openings_per_kill && parsed.openings_per_kill < 2 ? 'good' : parsed.openings_per_kill && parsed.openings_per_kill < 3 ? 'average' : 'needs improvement'} conversion rate. ${parsed.stocks_taken ? `You took ${parsed.stocks_taken} stock${parsed.stocks_taken > 1 ? 's' : ''}.` : ''}`;
      
      await upsertDocument({ gameId, source: 'slippi-stats', text: gameStatsText });
      results.push({ gameId, file: name });
    } catch {
      // skip
    }
  }
  return NextResponse.json({ ok: true, imported: results.length, results });
}

