import { getDb } from './db';
import { embedTexts, vssAvailable, cosineSimilarity } from './embedding';

export function chunkText(text: string, chunkSize = 1200, overlap = 200) {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

export async function upsertDocument({ gameId, source, text }: { gameId: number | null; source: string; text: string; }) {
  const db = getDb();
  const docStmt = db.prepare('INSERT INTO documents (game_id, source, text) VALUES (?, ?, ?)');
  const info = docStmt.run(gameId, source, text);
  const documentId = Number(info.lastInsertRowid);
  const chunks = chunkText(text);
  const insertChunk = db.prepare('INSERT INTO chunks (document_id, chunk_index, text) VALUES (?, ?, ?)');
  chunks.forEach((c, idx) => insertChunk.run(documentId, idx, c));

  if (vssAvailable(db)) {
    const embeddings = await embedTexts(chunks);
    const embedStmt = db.prepare('INSERT INTO chunk_embeddings (rowid, chunk_id, embedding) VALUES (null, ?, ?)');
    const bind = (v: number[]) => Buffer.from(new Float32Array(v).buffer);
    const getRowId = db.prepare('SELECT last_insert_rowid() as id');
    // Map chunk rowids by querying chunks for this document
    const rows = db.prepare('SELECT id FROM chunks WHERE document_id = ? ORDER BY chunk_index ASC').all(documentId) as { id: number }[];
    rows.forEach((row, i) => embedStmt.run(row.id, bind(embeddings[i])));
  }

  return { documentId };
}

export async function semanticSearch({ query, k = 5, gameId }: { query: string; k?: number; gameId?: number; }) {
  const db = getDb();
  if (vssAvailable(db)) {
    const [qEmbed] = await embedTexts([query]);
    const qVec = Buffer.from(new Float32Array(qEmbed).buffer);
    let sql = 'SELECT chunks.id, chunks.text, chunks.document_id FROM chunk_embeddings JOIN chunks ON chunk_embeddings.chunk_id = chunks.id ORDER BY vss0_distance(embedding, ?) ASC LIMIT ?';
    if (gameId) {
      sql = 'SELECT chunks.id, chunks.text, chunks.document_id FROM chunk_embeddings JOIN chunks ON chunk_embeddings.chunk_id = chunks.id JOIN documents ON chunks.document_id = documents.id WHERE documents.game_id = ? ORDER BY vss0_distance(embedding, ?) ASC LIMIT ?';
      const rows = db.prepare(sql).all(gameId, qVec, k) as any[];
      return rows.map(r => ({ id: r.id, text: r.text, score: 0 }));
    } else {
      const rows = db.prepare(sql).all(qVec, k) as any[];
      return rows.map(r => ({ id: r.id, text: r.text, score: 0 }));
    }
  }
  // Fallback: simple LIKE search and naive cosine on client-embedded chunks
  const chunks = gameId
    ? (db.prepare('SELECT chunks.id, chunks.text FROM chunks JOIN documents ON chunks.document_id = documents.id WHERE documents.game_id = ?').all(gameId) as any[])
    : (db.prepare('SELECT id, text FROM chunks').all() as any[]);
  const q = query.toLowerCase();
  const scored = chunks.map((c) => ({ id: c.id, text: c.text, score: c.text.toLowerCase().includes(q) ? 1 : 0 }));
  return scored.sort((a, b) => b.score - a.score).slice(0, k);
}

