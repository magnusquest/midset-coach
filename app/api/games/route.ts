import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema } from '../../../lib/schema';
import { getDb } from '../../../lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  ensureSchema();
  const db = getDb();

  const searchParams = req.nextUrl.searchParams;
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');
  const orderBy = searchParams.get('orderBy') || 'id';
  const order = searchParams.get('order') || 'DESC';

  // Validate orderBy to prevent SQL injection
  const validOrderBy = ['id', 'date', 'created_at', 'duration', 'stocks_taken', 'openings_per_kill'].includes(orderBy)
    ? orderBy
    : 'id';
  const validOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  let query = `SELECT 
    id,
    file_path,
    date,
    character,
    opponent,
    stage,
    duration,
    stocks_taken,
    openings_per_kill,
    created_at
  FROM games 
  ORDER BY ${validOrderBy} ${validOrder}`;

  const params: any[] = [];

  if (limit) {
    const limitNum = parseInt(limit, 10);
    if (!isNaN(limitNum) && limitNum > 0) {
      query += ' LIMIT ?';
      params.push(limitNum);
      
      if (offset) {
        const offsetNum = parseInt(offset, 10);
        if (!isNaN(offsetNum) && offsetNum >= 0) {
          query += ' OFFSET ?';
          params.push(offsetNum);
        }
      }
    }
  }

  const games = db.prepare(query).all(...params) as Array<{
    id: number;
    file_path: string;
    date: string | null;
    character: string | null;
    opponent: string | null;
    stage: string | null;
    duration: number | null;
    stocks_taken: number | null;
    openings_per_kill: number | null;
    created_at: string;
  }>;

  // Get total count for pagination
  const totalCount = db.prepare('SELECT COUNT(*) as count FROM games').get() as { count: number };

  return NextResponse.json({
    games,
    total: totalCount.count,
    limit: limit ? parseInt(limit, 10) : null,
    offset: offset ? parseInt(offset, 10) : null,
  });
}

