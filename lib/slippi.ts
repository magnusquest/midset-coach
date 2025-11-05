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

    const rawDuration = Number((stats as any)?.lastFrame ?? 0);
    const duration = Number.isFinite(rawDuration) ? Math.round(rawDuration) : 0;
    const rawOPK = Number((stats as any)?.overall?.[0]?.openingsPerKill ?? 0);
    const openingsPerKill = Number.isFinite(rawOPK) ? rawOPK : 0;
    const rawKills = Number((stats as any)?.overall?.[0]?.killCount ?? 0);
    const stocksTaken = Number.isFinite(rawKills) ? rawKills : 0;

    const character = settings?.players?.[0]?.characterId?.toString();
    const opponent = settings?.players?.[1]?.characterId?.toString();
    const stage = settings?.stageId?.toString();

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

    return {
      date: dateStr,
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

