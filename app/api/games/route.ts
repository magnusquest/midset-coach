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
  const orderBy = searchParams.get('orderBy') || 'date';
  const order = searchParams.get('order') || 'DESC';
  const character = searchParams.get('character');
  const opponent = searchParams.get('opponent');
  const stage = searchParams.get('stage');
  const winLoss = searchParams.get('win_loss');

  // Validate orderBy to prevent SQL injection
  const validOrderBy = ['id', 'date', 'created_at', 'duration', 'stocks_taken', 'openings_per_kill', 'character', 'opponent', 'stage', 'win_loss'].includes(orderBy)
    ? orderBy
    : 'date';
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
    win_loss,
    created_at
  FROM games WHERE 1=1`;

  const params: any[] = [];

  // Add filters
  if (character) {
    query += ' AND character = ?';
    params.push(character);
  }
  if (opponent) {
    query += ' AND opponent = ?';
    params.push(opponent);
  }
  if (stage) {
    query += ' AND stage = ?';
    params.push(stage);
  }
  if (winLoss) {
    query += ' AND win_loss = ?';
    params.push(winLoss);
  }

  query += ` ORDER BY ${validOrderBy} ${validOrder}`;

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
    win_loss: string | null;
    created_at: string;
  }>;

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) as count FROM games WHERE 1=1';
  const countParams: any[] = [];
  if (character) {
    countQuery += ' AND character = ?';
    countParams.push(character);
  }
  if (opponent) {
    countQuery += ' AND opponent = ?';
    countParams.push(opponent);
  }
  if (stage) {
    countQuery += ' AND stage = ?';
    countParams.push(stage);
  }
  if (winLoss) {
    countQuery += ' AND win_loss = ?';
    countParams.push(winLoss);
  }
  const totalCount = db.prepare(countQuery).get(...countParams) as { count: number };

  return NextResponse.json({
    games,
    total: totalCount.count,
    limit: limit ? parseInt(limit, 10) : null,
    offset: offset ? parseInt(offset, 10) : null,
  });
}

