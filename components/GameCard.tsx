"use client";
import React, { useState } from 'react';
import { formatDuration, getCharacterName, getStageName, getCharacterSpriteUrl } from '../lib/slippi-utils';

type Props = {
  id: number;
  file_path: string;
  character?: string | null;
  opponent?: string | null;
  stage?: string | null;
  duration?: number | null;
  onClick?: () => void;
};

export default function GameCard(props: Props) {
  const [characterImgError, setCharacterImgError] = useState(false);
  const [opponentImgError, setOpponentImgError] = useState(false);
  
  const characterName = getCharacterName(props.character);
  const opponentName = getCharacterName(props.opponent);
  const stageName = getStageName(props.stage);
  const durationFormatted = formatDuration(props.duration);
  const characterSpriteUrl = getCharacterSpriteUrl(props.character);
  const opponentSpriteUrl = getCharacterSpriteUrl(props.opponent);

  return (
    <div
      onClick={props.onClick}
      style={{
        border: '1px solid #3b4261',
        borderRadius: 12,
        padding: 16,
        cursor: props.onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        background: '#24283b',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}
      onMouseEnter={(e) => {
        if (props.onClick) {
          e.currentTarget.style.backgroundColor = '#2f3549';
          e.currentTarget.style.borderColor = '#7aa2f7';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(122, 162, 247, 0.3)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (props.onClick) {
          e.currentTarget.style.backgroundColor = '#24283b';
          e.currentTarget.style.borderColor = '#3b4261';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{ fontWeight: 600, color: '#c0caf5', fontSize: 15, marginBottom: 8 }}>
        Game #{props.id} — {props.file_path}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* Your Character */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {characterSpriteUrl && !characterImgError ? (
            <img
              src={characterSpriteUrl}
              alt={characterName}
              onError={() => setCharacterImgError(true)}
              style={{
                width: 40,
                height: 40,
                objectFit: 'contain',
                borderRadius: 6,
                border: '2px solid #7aa2f7',
                background: '#24283b',
                padding: 2,
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                border: '2px solid #7aa2f7',
                background: 'linear-gradient(135deg, #7aa2f7 0%, #9ece6a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1a1b26',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {characterName.charAt(0).toUpperCase()}
            </div>
          )}
          <span style={{ color: '#7aa2f7', fontWeight: 600, fontSize: 14 }}>{characterName}</span>
        </div>

        <span style={{ color: '#565f89', fontWeight: 500 }}>vs</span>

        {/* Opponent Character */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {opponentSpriteUrl && !opponentImgError ? (
            <img
              src={opponentSpriteUrl}
              alt={opponentName}
              onError={() => setOpponentImgError(true)}
              style={{
                width: 40,
                height: 40,
                objectFit: 'contain',
                borderRadius: 6,
                border: '2px solid #9ece6a',
                background: '#24283b',
                padding: 2,
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                border: '2px solid #9ece6a',
                background: 'linear-gradient(135deg, #9ece6a 0%, #7aa2f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1a1b26',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {opponentName.charAt(0).toUpperCase()}
            </div>
          )}
          <span style={{ color: '#9ece6a', fontWeight: 600, fontSize: 14 }}>{opponentName}</span>
        </div>

        <span style={{ color: '#565f89', fontSize: 12 }}>•</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#a9b1d6', fontWeight: 500, fontSize: 13 }}>{stageName}</span>
          <span style={{ color: '#9ece6a', fontSize: 13 }}>({durationFormatted})</span>
        </div>
      </div>
    </div>
  );
}

