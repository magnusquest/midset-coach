/**
 * TypeScript types and mappings for Super Smash Bros. Melee
 * Character and Stage IDs and their corresponding names
 */

/**
 * Character ID to Character Name mapping
 * Based on Slippi character IDs (0-25)
 */
export interface CharacterMap {
  [characterId: number]: string;
}

/**
 * Complete mapping of all 26 Melee characters
 * Character IDs match Slippi/slippi-js character IDs
 * Verified against @slippi/slippi-js characters.getCharacterName()
 */
export const CHARACTER_NAMES: CharacterMap = {
  0: 'Captain Falcon',
  1: 'Donkey Kong',
  2: 'Fox',
  3: 'Mr. Game & Watch',
  4: 'Kirby',
  5: 'Bowser',
  6: 'Link',
  7: 'Luigi',
  8: 'Mario',
  9: 'Marth',
  10: 'Mewtwo',
  11: 'Ness',
  12: 'Peach',
  13: 'Pikachu',
  14: 'Ice Climbers',
  15: 'Jigglypuff',
  16: 'Samus',
  17: 'Yoshi',
  18: 'Zelda',
  19: 'Sheik',
  20: 'Falco',
  21: 'Young Link',
  22: 'Dr. Mario',
  23: 'Roy',
  24: 'Pichu',
  25: 'Ganondorf',
};

/**
 * Character ID type - valid character IDs are 0-25
 */
export type CharacterId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25;

/**
 * Stage ID to Stage Name mapping
 */
export interface StageMap {
  [stageId: number]: string;
}

/**
 * Complete mapping of all Melee stage IDs to their names
 * Based on Slippi stage IDs
 * Verified against @slippi/slippi-js stages.getStageName()
 */
export const STAGE_NAMES: StageMap = {
  0: 'Unknown Stage',
  1: 'Unknown Stage',
  2: 'Fountain of Dreams',
  3: 'Pokémon Stadium',
  4: 'Princess Peach\'s Castle',
  5: 'Kongo Jungle',
  6: 'Brinstar',
  7: 'Corneria',
  8: 'Yoshi\'s Story',
  9: 'Onett',
  10: 'Mute City',
  11: 'Rainbow Cruise',
  12: 'Jungle Japes',
  13: 'Great Bay',
  14: 'Hyrule Temple',
  15: 'Brinstar Depths',
  16: 'Yoshi\'s Island',
  17: 'Green Greens',
  18: 'Fourside',
  19: 'Mushroom Kingdom I',
  20: 'Mushroom Kingdom II',
  21: 'Unknown Stage',
  22: 'Venom',
  23: 'Poké Floats',
  24: 'Big Blue',
  25: 'Icicle Mountain',
  26: 'Icetop',
  27: 'Flat Zone',
  28: 'Dream Land N64',
  29: 'Yoshi\'s Island N64',
  30: 'Kongo Jungle N64',
  31: 'Battlefield',
  32: 'Final Destination',
  33: 'Target Test (Mario)',
  34: 'Target Test (Captain Falcon)',
  35: 'Target Test (Young Link)',
};

/**
 * Stage ID type - valid stage IDs are 0-35
 */
export type StageId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35;

/**
 * Gets character name from character ID
 * @param characterId - Character ID (0-25)
 * @returns Character name or undefined if not found
 */
export function getCharacterNameById(characterId: number): string | undefined {
  return CHARACTER_NAMES[characterId];
}

/**
 * Gets stage name from stage ID
 * @param stageId - Stage ID
 * @returns Stage name or undefined if not found
 */
export function getStageNameById(stageId: number): string | undefined {
  return STAGE_NAMES[stageId];
}

/**
 * Type guard to check if a number is a valid CharacterId
 * @param id - Number to check
 * @returns True if id is a valid CharacterId (0-25)
 */
export function isValidCharacterId(id: number): id is CharacterId {
  return id >= 0 && id <= 25 && Number.isInteger(id);
}

/**
 * Type guard to check if a number is a valid StageId
 * @param id - Number to check
 * @returns True if id is a valid StageId (0-35)
 */
export function isValidStageId(id: number): id is StageId {
  return id >= 0 && id <= 35 && Number.isInteger(id);
}

