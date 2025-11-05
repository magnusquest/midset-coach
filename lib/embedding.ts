import type Database from 'better-sqlite3';

export async function embedTexts(texts: string[], apiKey?: string): Promise<number[][]> {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');
  const body = {
    model: 'text-embedding-3-small',
    input: texts
  };
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return data.data.map((d: any) => d.embedding);
}

export function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
  return dot / denom;
}

export function vssAvailable(db: Database.Database) {
  try {
    db.prepare('select 1 from chunk_embeddings limit 1').get();
    return true;
  } catch {
    return false;
  }
}

