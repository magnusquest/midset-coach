"use client";
import React from 'react';
import { getCharacterName } from '../lib/slippi-utils';

type Props = {
  userCharacter: string | null;
  opponentCharacter: string | null;
  onUserCharacterChange: (character: string | null) => void;
  onOpponentCharacterChange: (character: string | null) => void;
};

// Common Melee characters
const CHARACTERS = [
  { id: '1', name: 'Fox' },
  { id: '19', name: 'Falco' },
  { id: '23', name: 'Marth' },
  { id: '7', name: 'Sheik' },
  { id: '2', name: 'Captain Falcon' },
  { id: '0', name: 'Mario' },
  { id: '9', name: 'Peach' },
  { id: '12', name: 'Pikachu' },
  { id: '14', name: 'Yoshi' },
  { id: '15', name: 'Jigglypuff' },
  { id: '20', name: 'Ganondorf' },
  { id: '21', name: 'Young Link' },
  { id: '22', name: 'Game & Watch' },
  { id: '24', name: 'Zelda' },
  { id: '25', name: 'Roy' },
];

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

