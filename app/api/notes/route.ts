import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ensureSchema } from '../../../lib/schema';
import { getDb } from '../../../lib/db';
import { upsertDocument } from '../../../lib/rag';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  ensureSchema();
  const db = getDb();
  const contentType = req.headers.get('content-type') || '';
  // JSON for text notes
  if (contentType.includes('application/json')) {
    const { gameId, content } = await req.json();
    const stmt = db.prepare('INSERT INTO notes (game_id, content) VALUES (?, ?)');
    const info = stmt.run(gameId ?? null, content ?? '');
    await upsertDocument({ gameId: gameId ?? null, source: 'user-notes', text: content ?? '' });
    return NextResponse.json({ ok: true, id: Number(info.lastInsertRowid) });
  }
  // Multipart for audio upload -> transcribe
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const gameIdStr = form.get('gameId') as string | null;
    const audio = form.get('audio');
    const gameId = gameIdStr ? Number(gameIdStr) : null;
    if (!(audio instanceof File)) return NextResponse.json({ error: 'audio file missing' }, { status: 400 });
    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const fileName = `${Date.now()}-${audio.name}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    const audioUrl = `/uploads/${fileName}`;

    // Transcribe via Whisper
    let transcript = '';
    try {
      const key = process.env.OPENAI_API_KEY;
      if (!key) throw new Error('Missing key');
      const formTrans = new FormData();
      formTrans.append('file', new Blob([buffer], { type: audio.type || 'audio/mpeg' }), audio.name);
      formTrans.append('model', 'whisper-1');
      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: formTrans as any
      });
      const data = await res.json();
      transcript = data.text || '';
    } catch {
      transcript = '';
    }

    const stmt = db.prepare('INSERT INTO notes (game_id, content, content_audio_url) VALUES (?, ?, ?)');
    const info = stmt.run(gameId, transcript, audioUrl);
    if (transcript) await upsertDocument({ gameId, source: 'user-audio-transcript', text: transcript });
    return NextResponse.json({ ok: true, id: Number(info.lastInsertRowid), transcript, audioUrl });
  }
  return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
}

// PUT: simple text fallback to get an answer using gpt-4o with provided context
export async function PUT(req: NextRequest) {
  const { query, context } = await req.json();
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ answer: 'Missing OpenAI key' });
  const system = 'You are MidSet Coach, a Super Smash Bros. Melee coach. Use the provided context (game stats and notes) to give practical, concise coaching advice.';
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: `Context:\n${JSON.stringify(context)}\n\nUser: ${query}` }
  ];
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.2 })
  });
  const data = await res.json();
  const answer = data?.choices?.[0]?.message?.content ?? '';
  return NextResponse.json({ answer });
}

