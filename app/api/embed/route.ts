import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { embedTexts, vssAvailable } from '../../../lib/embedding';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const db = getDb();
  if (!vssAvailable(db)) return NextResponse.json({ ok: false, message: 'sqlite-vss not available' }, { status: 400 });
  const { documentId } = await req.json();
  const rows = db.prepare('SELECT id, text FROM chunks WHERE document_id = ? ORDER BY chunk_index ASC').all(documentId) as { id: number; text: string }[];
  const embeddings = await embedTexts(rows.map(r => r.text));
  const embedStmt = db.prepare('INSERT INTO chunk_embeddings (rowid, chunk_id, embedding) VALUES (null, ?, ?)');
  const bind = (v: number[]) => Buffer.from(new Float32Array(v).buffer);
  rows.forEach((row, i) => embedStmt.run(row.id, bind(embeddings[i])));
  return NextResponse.json({ ok: true, count: rows.length });
}

