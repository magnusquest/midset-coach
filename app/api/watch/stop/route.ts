import { NextRequest, NextResponse } from 'next/server';
import { stopWatching } from '../../../../lib/file-watcher';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  try {
    stopWatching();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error stopping watch:', error);
    return NextResponse.json({ error: error.message || 'Failed to stop watching' }, { status: 500 });
  }
}

