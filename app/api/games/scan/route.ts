import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema } from '../../../../lib/schema';
import { scanDirectory } from '../../../../lib/file-watcher';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    ensureSchema();
    const { path: dirPath } = await req.json();
    
    if (!dirPath || typeof dirPath !== 'string') {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }
    
    const result = await scanDirectory(dirPath);
    
    return NextResponse.json({
      ok: true,
      processed: result.processed,
      skipped: result.skipped,
    });
  } catch (error: any) {
    console.error('Error scanning directory:', error);
    return NextResponse.json({ error: error.message || 'Failed to scan directory' }, { status: 500 });
  }
}

