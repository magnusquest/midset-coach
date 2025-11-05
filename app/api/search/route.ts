import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema } from '../../../lib/schema';
import { semanticSearch } from '../../../lib/rag';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  ensureSchema();
  const { query, k, gameId } = await req.json();
  const results = await semanticSearch({ query, k, gameId });
  return NextResponse.json({ results });
}

