/**
 * Utility functions for formatting Slippi game data for display.
 */

import { characters, stages } from '@slippi/slippi-js';

/**
 * Converts duration from frames (60 FPS) to a human-readable string.
 * 
 * @param frames - Duration in frames (60 FPS)
 * @returns Formatted string like "2m 30s" or "45s" or "0s" if invalid
 */
export function formatDuration(frames: number | null | undefined): string {
  if (frames === null || frames === undefined || !Number.isFinite(frames) || frames < 0) {
    return '0s';
  }
  
  const seconds = Math.round(frames / 60);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Gets character name from character ID.
 * 
 * @param characterId - Character ID as string or number
 * @returns Character name or the ID if name lookup fails
 */
export function getCharacterName(characterId: string | number | null | undefined): string {
  if (!characterId) return '-';
  
  try {
    const id = typeof characterId === 'string' ? parseInt(characterId, 10) : characterId;
    if (isNaN(id)) return String(characterId);
    
    const name = characters.getCharacterName(id);
    return name || String(characterId);
  } catch {
    // Fallback to ID if lookup fails
    return String(characterId);
  }
}

/**
 * Gets stage name from stage ID.
 * 
 * @param stageId - Stage ID as string or number
 * @returns Stage name or the ID if name lookup fails
 */
export function getStageName(stageId: string | number | null | undefined): string {
  if (!stageId) return '-';
  
  try {
    const id = typeof stageId === 'string' ? parseInt(stageId, 10) : stageId;
    if (isNaN(id)) return String(stageId);
    
    const name = stages.getStageName(id);
    return name || String(stageId);
  } catch {
    // Fallback to ID if lookup fails
    return String(stageId);
  }
}

/**
 * Character sprite mapping for Super Smash Bros. Melee
 * Maps character IDs to their sprite filenames
 */
const CHARACTER_SPRITES: Record<number, string> = {
  0: 'mario',
  1: 'fox',
  2: 'captain_falcon',
  3: 'donkey_kong',
  4: 'kirby',
  5: 'bowser',
  6: 'link',
  7: 'sheik',
  8: 'ness',
  9: 'peach',
  10: 'popo',
  11: 'nana',
  12: 'pikachu',
  13: 'samus',
  14: 'yoshi',
  15: 'jigglypuff',
  16: 'mewtwo',
  17: 'luigi',
  18: 'dr_mario',
  19: 'falco',
  20: 'ganondorf',
  21: 'young_link',
  22: 'game_and_watch',
  23: 'marth',
  24: 'zelda',
  25: 'roy',
};

/**
 * Gets character sprite URL from character ID.
 * Uses a CDN that hosts Melee character sprites.
 * 
 * @param characterId - Character ID as string or number
 * @returns URL to character sprite image, or null if not found
 */
export function getCharacterSpriteUrl(characterId: string | number | null | undefined): string | null {
  if (!characterId) return null;
  
  try {
    const id = typeof characterId === 'string' ? parseInt(characterId, 10) : characterId;
    if (isNaN(id)) return null;
    
    const spriteName = CHARACTER_SPRITES[id];
    if (!spriteName) return null;
    
    // Using assets.melee.tv for Melee character sprites
    // If sprites don't load, you can host them locally in public/images/characters/
    // Format: assets.melee.tv/characters/{characterName}.png
    return `https://assets.melee.tv/characters/${spriteName}.png`;
  } catch {
    return null;
  }
}

/**
 * Gets character sprite URL with fallback to a default image.
 * 
 * @param characterId - Character ID as string or number
 * @returns URL to character sprite image
 */
export function getCharacterSpriteUrlWithFallback(characterId: string | number | null | undefined): string {
  const url = getCharacterSpriteUrl(characterId);
  if (url) return url;
  
  // Fallback to a generic character icon or placeholder
  return '/images/characters/default.png';
}

