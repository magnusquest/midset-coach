import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema } from '../../../lib/schema';
import { getDb } from '../../../lib/db';
import { CharacterId, isValidCharacterId, StageId, isValidStageId } from '../../../lib/types';

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
    // Convert character to number and validate using CharacterId type
    const characterNum = parseInt(character, 10);
    if (!isNaN(characterNum) && isValidCharacterId(characterNum)) {
      query += ' AND character = ?';
      params.push(characterNum as CharacterId);
    }
  }
  if (opponent) {
    // Convert opponent to number and validate using CharacterId type
    const opponentNum = parseInt(opponent, 10);
    if (!isNaN(opponentNum) && isValidCharacterId(opponentNum)) {
      query += ' AND opponent = ?';
      params.push(opponentNum as CharacterId);
    }
  }
  if (stage) {
    // Convert stage to number and validate using StageId type
    const stageNum = parseInt(stage, 10);
    if (!isNaN(stageNum) && isValidStageId(stageNum)) {
      query += ' AND stage = ?';
      params.push(stageNum as StageId);
    }
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
    character: CharacterId | null;
    opponent: CharacterId | null;
    stage: StageId | null;
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
    // Convert character to number and validate using CharacterId type
    const characterNum = parseInt(character, 10);
    if (!isNaN(characterNum) && isValidCharacterId(characterNum)) {
      countQuery += ' AND character = ?';
      countParams.push(characterNum as CharacterId);
    }
  }
  if (opponent) {
    // Convert opponent to number and validate using CharacterId type
    const opponentNum = parseInt(opponent, 10);
    if (!isNaN(opponentNum) && isValidCharacterId(opponentNum)) {
      countQuery += ' AND opponent = ?';
      countParams.push(opponentNum as CharacterId);
    }
  }
  if (stage) {
    // Convert stage to number and validate using StageId type
    const stageNum = parseInt(stage, 10);
    if (!isNaN(stageNum) && isValidStageId(stageNum)) {
      countQuery += ' AND stage = ?';
      countParams.push(stageNum as StageId);
    }
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

