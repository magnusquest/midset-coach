import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema } from '../../../lib/schema';
import { semanticSearch } from '../../../lib/rag';
import { getDb } from '../../../lib/db';
import { getCharacterName, getStageName, formatDuration } from '../../../lib/slippi-utils';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  ensureSchema();
  const { query, k, gameId } = await req.json();
  const db = getDb();
  
  // Get semantic search results
  const searchResults = await semanticSearch({ query, k: k || 10, gameId });
  
  // Enrich results with game data and document source info
  const enrichedResults = searchResults.map((result) => {
    // Get document info for this chunk
    const docInfo = db.prepare(`
      SELECT documents.id, documents.game_id, documents.source, games.*
      FROM chunks
      JOIN documents ON chunks.document_id = documents.id
      LEFT JOIN games ON documents.game_id = games.id
      WHERE chunks.id = ?
    `).get(result.id) as any;
    
    if (!docInfo) {
      return {
        ...result,
        text: result.text,
        gameId: null,
        source: 'unknown',
        gameInfo: null,
      };
    }
    
    // Format game info if available
    let contextText = result.text;
    let gameInfo = null;
    
    if (docInfo.game_id) {
      const characterName = getCharacterName(docInfo.character);
      const opponentName = getCharacterName(docInfo.opponent);
      const stageName = getStageName(docInfo.stage);
      const durationFormatted = formatDuration(docInfo.duration);
      
      const gameInfoText = `[Game #${docInfo.game_id}: ${characterName} vs ${opponentName} on ${stageName}, ${durationFormatted}, OPK: ${docInfo.openings_per_kill ? docInfo.openings_per_kill.toFixed(2) : 'N/A'}, Stocks: ${docInfo.stocks_taken || 0}]`;
      
      contextText = `${gameInfoText}\n${result.text}`;
      
      gameInfo = {
        id: docInfo.game_id,
        character: characterName || 'Unknown',
        opponent: opponentName || 'Unknown',
        stage: stageName || 'Unknown',
        duration: durationFormatted || '0s',
        openings_per_kill: docInfo.openings_per_kill ?? null,
        stocks_taken: docInfo.stocks_taken ?? null,
      };
    }
    
    return {
      ...result,
      text: contextText,
      gameId: docInfo.game_id || null,
      source: docInfo.source || 'unknown',
      gameInfo: gameInfo,
    };
  });
  
  return NextResponse.json({ results: enrichedResults });
}

