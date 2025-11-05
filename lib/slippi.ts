import { SlippiGame } from '@slippi/slippi-js';

export type ParsedGame = {
  date?: string;
  character?: string;
  opponent?: string;
  stage?: string;
  duration?: number;
  stocks_taken?: number;
  openings_per_kill?: number;
};

export function parseSlippiBuffer(fileBuffer: Buffer): ParsedGame | null {
  try {
    const game = new SlippiGame(fileBuffer);
    const settings = game.getSettings();
    const stats = game.getStats();
    const metadata = game.getMetadata();

    const duration = stats?.lastFrame|| 0;
    const openingsPerKill = stats?.overall?.[0]?.openingsPerKill || 0;
    const stocksTaken = stats?.overall?.[0]?.killCount || 0;

    const character = settings?.players?.[0]?.characterId?.toString();
    const opponent = settings?.players?.[1]?.characterId?.toString();
    const stage = settings?.stageId?.toString();

    return {
      date: metadata?.startAt || undefined,
      character,
      opponent,
      stage,
      duration,
      stocks_taken: stocksTaken,
      openings_per_kill: openingsPerKill as number,
    };
  } catch (e) {
    return null;
  }
}

