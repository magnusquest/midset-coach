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
        border: '2px solid #c5b8fa',
        borderRadius: 12,
        padding: 16,
        cursor: props.onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, #f5f0ff 0%, #f0f9f0 100%)',
        boxShadow: '0 2px 8px rgba(155, 135, 245, 0.1)',
      }}
      onMouseEnter={(e) => {
        if (props.onClick) {
          e.currentTarget.style.backgroundColor = '#e8e0ff';
          e.currentTarget.style.borderColor = '#9b87f5';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(155, 135, 245, 0.25)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (props.onClick) {
          e.currentTarget.style.backgroundColor = '';
          e.currentTarget.style.borderColor = '#c5b8fa';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(155, 135, 245, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{ fontWeight: 600, color: '#6b46c1', fontSize: 15, marginBottom: 8 }}>
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
                border: '2px solid #9b87f5',
                background: 'white',
                padding: 2,
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                border: '2px solid #9b87f5',
                background: 'linear-gradient(135deg, #9b87f5 0%, #7dd87d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {characterName.charAt(0).toUpperCase()}
            </div>
          )}
          <span style={{ color: '#9b87f5', fontWeight: 600, fontSize: 14 }}>{characterName}</span>
        </div>

        <span style={{ color: '#6b46c1', fontWeight: 500 }}>vs</span>

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
                border: '2px solid #7dd87d',
                background: 'white',
                padding: 2,
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                border: '2px solid #7dd87d',
                background: 'linear-gradient(135deg, #7dd87d 0%, #9b87f5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {opponentName.charAt(0).toUpperCase()}
            </div>
          )}
          <span style={{ color: '#7dd87d', fontWeight: 600, fontSize: 14 }}>{opponentName}</span>
        </div>

        <span style={{ color: '#95a5a6', fontSize: 12 }}>•</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#6b46c1', fontWeight: 500, fontSize: 13 }}>{stageName}</span>
          <span style={{ color: '#95e095', fontSize: 13 }}>({durationFormatted})</span>
        </div>
      </div>
    </div>
  );
}

