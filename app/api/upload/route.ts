import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema } from '../../../lib/schema';
import { getDb } from '../../../lib/db';
import { parseSlippiBuffer } from '../../../lib/slippi';
import { upsertDocument } from '../../../lib/rag';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  ensureSchema();
  const db = getDb();

  const formData = await req.formData();
  const files = formData.getAll('file');
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
  for (const f of files) {
    if (!(f instanceof File)) continue;
    const arrayBuffer = await f.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsed = parseSlippiBuffer(buffer);
    if (!parsed) continue;
    const info = insertGame.run({
      file_path: f.name,
      date: parsed.date ?? null,
      character: parsed.character ?? null,
      opponent: parsed.opponent ?? null,
      stage: parsed.stage ?? null,
      duration: parsed.duration ?? null,
      stocks_taken: parsed.stocks_taken ?? null,
      openings_per_kill: parsed.openings_per_kill ?? null,
    });
    const gameId = Number(info.lastInsertRowid);
    // Create a base document with simple stats for RAG
    const baseText = `Game Stats:\nStage: ${parsed.stage}\nYou: ${parsed.character} vs ${parsed.opponent}\nDuration: ${parsed.duration}s\nOPK: ${parsed.openings_per_kill}\nStocks Taken: ${parsed.stocks_taken}`;
    await upsertDocument({ gameId, source: 'slippi-stats', text: baseText });
    results.push({ gameId, file: f.name });
  }

  return NextResponse.json({ ok: true, results });
}

