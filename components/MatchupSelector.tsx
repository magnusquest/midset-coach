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
      background: 'linear-gradient(135deg, #f5f0ff 0%, #f0f9f0 100%)',
      borderRadius: 12,
      border: '2px solid #e8e0ff',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
    }}>
      <div>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#6b46c1' }}>
          Your Character
        </label>
        <select
          value={userCharacter || ''}
          onChange={(e) => onUserCharacterChange(e.target.value || null)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '2px solid #c5b8fa',
            fontSize: 14,
            background: 'white',
            color: '#4a5568',
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
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#6b46c1' }}>
          Opponent Character
        </label>
        <select
          value={opponentCharacter || ''}
          onChange={(e) => onOpponentCharacterChange(e.target.value || null)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '2px solid #c5b8fa',
            fontSize: 14,
            background: 'white',
            color: '#4a5568',
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
          background: 'white',
          borderRadius: 8,
          border: '2px solid #d4f2d4',
          textAlign: 'center',
        }}>
          <strong style={{ color: '#52b052', fontSize: 16 }}>
            {getCharacterName(userCharacter)} vs {getCharacterName(opponentCharacter)}
          </strong>
        </div>
      )}
    </div>
  );
}

