"use client";
import React from 'react';
import { getCharacterName } from '../lib/slippi-utils';
import { CHARACTER_NAMES, CharacterId } from '../lib/types';

type Props = {
  userCharacter: string | null;
  opponentCharacter: string | null;
  onUserCharacterChange: (character: string | null) => void;
  onOpponentCharacterChange: (character: string | null) => void;
};

// Common Melee characters - using CharacterId type and CHARACTER_NAMES mapping
const CHARACTERS = Object.entries(CHARACTER_NAMES)
  .map(([id, name]) => ({ id, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function MatchupSelector({
  userCharacter,
  opponentCharacter,
  onUserCharacterChange,
  onOpponentCharacterChange,
}: Props) {
  return (
    <div style={{
      padding: 20,
      background: '#24283b',
      borderRadius: 12,
      border: '1px solid #3b4261',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
    }}>
      <div>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#c0caf5' }}>
          Your Character
        </label>
        <select
          value={userCharacter || ''}
          onChange={(e) => onUserCharacterChange(e.target.value || null)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #3b4261',
            fontSize: 14,
            background: '#1a1b26',
            color: '#c0caf5',
          }}
        >
          <option value="">Select character...</option>
          {CHARACTERS.map((char) => (
            <option key={char.id} value={char.id}>
              {char.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#c0caf5' }}>
          Opponent Character
        </label>
        <select
          value={opponentCharacter || ''}
          onChange={(e) => onOpponentCharacterChange(e.target.value || null)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #3b4261',
            fontSize: 14,
            background: '#1a1b26',
            color: '#c0caf5',
          }}
        >
          <option value="">Select character...</option>
          {CHARACTERS.map((char) => (
            <option key={char.id} value={char.id}>
              {char.name}
            </option>
          ))}
        </select>
      </div>
      {userCharacter && opponentCharacter && (
        <div style={{
          gridColumn: '1 / -1',
          padding: 12,
          background: '#1a1b26',
          borderRadius: 8,
          border: '1px solid #3b4261',
          textAlign: 'center',
        }}>
          <strong style={{ color: '#9ece6a', fontSize: 16 }}>
            {getCharacterName(userCharacter)} vs {getCharacterName(opponentCharacter)}
          </strong>
        </div>
      )}
    </div>
  );
}

