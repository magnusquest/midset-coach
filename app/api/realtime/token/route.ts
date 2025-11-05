import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 400 });
  // For MVP: return server key directly (NOT for production). In production create ephemeral tokens.
  return NextResponse.json({ token: key });
}

