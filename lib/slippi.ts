import { SlippiGame } from '@slippi/slippi-js';

/**
 * Represents parsed game data extracted from a Slippi replay file (.slp).
 * 
 * @see https://github.com/project-slippi/slippi-js
 */
export type ParsedGame = {
  /** ISO 8601 date string when the game started */
  date?: string;
  /** Character ID of the first player (you) as a string */
  character?: string;
  /** Character ID of the second player (opponent) as a string */
  opponent?: string;
  /** Stage ID where the game was played as a string */
  stage?: string;
  /** Game duration in frames (60 FPS, so 3600 frames = 60 seconds) */
  duration?: number;
  /** Number of stocks taken (kills) by the first player */
  stocks_taken?: number;
  /** Average openings required per kill - lower is better */
  openings_per_kill?: number;
  /** Win/loss result: 'win', 'loss', or undefined if cannot determine */
  win_loss?: string;
};

/**
 * Parses a Slippi replay file buffer and extracts key game statistics.
 * 
 * This function uses the @slippi/slippi-js library to parse .slp replay files
 * and extract essential game data including:
 * - Game settings (characters, stage, players)
 * - Computed statistics (openings per kill, kills, duration)
 * - Metadata (game start time)
 * 
 * @param fileBuffer - The raw buffer containing the Slippi replay file (.slp format)
 * @returns ParsedGame object with extracted statistics, or null if parsing fails
 * 
 * @example
 * ```typescript
 * const fileBuffer = fs.readFileSync('game.slp');
 * const parsed = parseSlippiBuffer(fileBuffer);
 * console.log(`Character: ${parsed.character}, OPK: ${parsed.openings_per_kill}`);
 * ```
 * 
 * @see https://github.com/project-slippi/slippi-js for SlippiGame API documentation
 */
export function parseSlippiBuffer(fileBuffer: Buffer): ParsedGame | null {
  try {
    // Initialize SlippiGame parser with the file buffer
    // SlippiGame can accept a file path (string) or buffer (Buffer)
    const game = new SlippiGame(fileBuffer);
    
    // Get game settings: stage, character selection, player ports, etc.
    // Returns: { stageId, players: [{ characterId, port, nametag, ... }], ... }
    const settings = game.getSettings();
    
    // Get computed statistics: openings per kill, conversions, damage, etc.
    // Returns: { overall: [{ openingsPerKill, killCount, totalDamage, ... }], lastFrame, ... }
    const stats = game.getStats();
    
    // Get metadata: game start time, console info, platform, etc.
    // Returns: { startAt, consoleNick, lastFrame, ... }
    const metadata = game.getMetadata();

    // Extract game duration from stats.lastFrame
    // lastFrame is the final frame number (game runs at 60 FPS)
    // Convert to number and round to nearest integer
    const rawDuration = Number((stats as any)?.lastFrame ?? 0);
    const duration = Number.isFinite(rawDuration) ? Math.round(rawDuration) : 0;
    
    // Extract openings per kill (OPK) from first player's overall stats
    // OPK measures how many openings a player needs on average to get a kill
    // Lower values indicate better conversion ability
    // stats.overall is an array of per-player statistics
    // openingsPerKill might be a direct number or a ratio object with .ratio property
    const playerStats = (stats as any)?.overall?.[0];
    let openingsPerKill = 0;
    
    if (playerStats) {
      // Try direct property first (check if it exists and is not null/undefined)
      if (playerStats.openingsPerKill !== undefined && playerStats.openingsPerKill !== null) {
        const rawOPK = typeof playerStats.openingsPerKill === 'object' && playerStats.openingsPerKill !== null && playerStats.openingsPerKill.ratio !== undefined
          ? playerStats.openingsPerKill.ratio
          : playerStats.openingsPerKill;
        const parsed = Number(rawOPK);
        if (Number.isFinite(parsed) && parsed > 0) {
          openingsPerKill = parsed;
        }
      }
      
      // If still 0, try to calculate from conversions array and kill count
      // OPK = number of conversions by player / number of kills
      if (openingsPerKill === 0 && playerStats.killCount && playerStats.killCount > 0) {
        // Count conversions for this player (playerIndex 0)
        const conversions = (stats as any)?.conversions || [];
        const playerConversions = conversions.filter((conv: any) => conv.playerIndex === 0);
        
        if (playerConversions.length > 0) {
          openingsPerKill = playerConversions.length / playerStats.killCount;
        } else {
          // Fallback: try conversionCount property if it exists
          const conversionCount = playerStats.conversionCount || 0;
          if (conversionCount > 0) {
            openingsPerKill = conversionCount / playerStats.killCount;
          }
        }
      }
    }
    
    // Extract kill count (stocks taken) from first player's overall stats
    // killCount represents the number of stocks the player eliminated
    const rawKills = Number((stats as any)?.overall?.[0]?.killCount ?? 0);
    const stocksTaken = Number.isFinite(rawKills) ? rawKills : 0;

    // Extract character IDs from settings
    // players[0] is the first player, players[1] is the second player
    // characterId is a number representing the character (e.g., 0 = Mario, 1 = Fox)
    // Convert to string for storage in database
    const character = settings?.players?.[0]?.characterId?.toString();
    const opponent = settings?.players?.[1]?.characterId?.toString();
    
    // Extract stage ID from settings
    // stageId is a number representing the stage (e.g., 8 = Battlefield, 31 = Final Destination)
    const stage = settings?.stageId?.toString();

    // Extract and parse game start date from metadata
    // metadata.startAt is a timestamp string or Date object
    // Convert to ISO 8601 format for consistent date storage
    let dateStr: string | undefined = undefined;
    const startAtRaw = (metadata as any)?.startAt;
    if (startAtRaw) {
      try {
        const d = new Date(startAtRaw);
        dateStr = isNaN(d.getTime()) ? undefined : d.toISOString();
      } catch {
        dateStr = undefined;
      }
    }

    // Determine win/loss by checking stocks remaining at game end
    // Get final frame data to check stocks remaining
    let winLoss: string | undefined = undefined;
    try {
      const finalFrame = (stats as any)?.lastFrame;
      if (finalFrame && finalFrame > 0) {
        // Get frame data for the last frame
        const frames = game.getFrames();
        if (frames && finalFrame in frames) {
          const lastFrame = frames[finalFrame];
          if (lastFrame && lastFrame.players) {
            // Check stocks remaining for each player
            const player0Stocks = lastFrame.players[0]?.post?.stocksRemaining ?? null;
            const player1Stocks = lastFrame.players[1]?.post?.stocksRemaining ?? null;
            
            if (player0Stocks !== null && player1Stocks !== null) {
              // Player with more stocks remaining wins
              if (player0Stocks > player1Stocks) {
                winLoss = 'win';
              } else if (player1Stocks > player0Stocks) {
                winLoss = 'loss';
              }
              // If equal, we can't determine (could be timeout or other end condition)
            }
          }
        }
      }
      
      // Fallback: use kill count comparison if frame data not available
      if (!winLoss && stats && (stats as any).overall) {
        const player0Kills = (stats as any).overall[0]?.killCount ?? 0;
        const player1Kills = (stats as any).overall[1]?.killCount ?? 0;
        
        // In Melee, typically 4 stocks, so if one player has 4 kills, they won
        // This is a heuristic and may not always be accurate
        if (player0Kills >= 4 && player1Kills < 4) {
          winLoss = 'win';
        } else if (player1Kills >= 4 && player0Kills < 4) {
          winLoss = 'loss';
        }
      }
    } catch (e) {
      // If win/loss detection fails, leave it undefined
      winLoss = undefined;
    }

    return {
      date: dateStr,
      character,
      opponent,
      stage,
      duration,
      stocks_taken: stocksTaken,
      openings_per_kill: openingsPerKill as number,
      win_loss: winLoss,
    };
  } catch (e) {
    // If parsing fails (invalid file, corrupted data, etc.), return null
    // This allows the caller to handle errors gracefully
    return null;
  }
}

