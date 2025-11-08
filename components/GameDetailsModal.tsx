"use client";
import React, { useEffect, useState } from 'react';
import { formatDuration, getCharacterName, getStageName, getCharacterSpriteUrl } from '../lib/slippi-utils';

type GameDetails = {
  id: number;
  file_path: string;
  date?: string | null;
  character?: string | null;
  opponent?: string | null;
  stage?: string | null;
  duration?: number | null;
  stocks_taken?: number | null;
  openings_per_kill?: number | null;
  created_at?: string;
};

type Props = {
  game: GameDetails | null;
  onClose: () => void;
};

export default function GameDetailsModal({ game, onClose }: Props) {
  const [characterImgError, setCharacterImgError] = useState(false);
  const [opponentImgError, setOpponentImgError] = useState(false);

  useEffect(() => {
    if (!game) return;
    
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [game, onClose]);


  if (!game) return null;

  const characterName = getCharacterName(game.character);
  const opponentName = getCharacterName(game.opponent);
  const stageName = getStageName(game.stage);
  const durationFormatted = formatDuration(game.duration);
  const characterSpriteUrl = getCharacterSpriteUrl(game.character);
  const opponentSpriteUrl = getCharacterSpriteUrl(game.opponent);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#24283b',
          borderRadius: 16,
          padding: 28,
          maxWidth: 600,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          border: '1px solid #3b4261',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #3b4261' }}>
          <h2 style={{ margin: 0, color: '#c0caf5', fontSize: 24, fontWeight: 700 }}>Game #{game.id}</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => {
                window.location.href = `/review?gameId=${game.id}`;
              }}
              style={{
                background: '#9ece6a',
                border: 'none',
                fontSize: 14,
                cursor: 'pointer',
                padding: '8px 16px',
                color: '#1a1b26',
                borderRadius: 8,
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(158, 206, 106, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Review
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#565f89',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer',
                padding: '4px 12px',
                color: '#c0caf5',
                borderRadius: 8,
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#7aa2f7';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#565f89';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 24 }}>
          {/* Game Info Section */}
          <div style={{ background: '#1a1b26', padding: 16, borderRadius: 12, border: '1px solid #3b4261' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#c0caf5', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'linear-gradient(135deg, #7aa2f7 0%, #9ece6a 100%)', width: 4, height: 20, borderRadius: 2 }}></span>
              Game Information
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <strong style={{ color: '#7aa2f7', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>File Path</strong>
                <div style={{ fontSize: 14, wordBreak: 'break-all', color: '#c0caf5', padding: '8px 12px', background: '#24283b', borderRadius: 8, border: '1px solid #3b4261' }}>{game.file_path}</div>
              </div>

              {game.date && (
                <div>
                  <strong style={{ color: '#7aa2f7', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Game Date</strong>
                  <div style={{ fontSize: 14, color: '#c0caf5', padding: '8px 12px', background: '#24283b', borderRadius: 8, border: '1px solid #3b4261' }}>{new Date(game.date).toLocaleString()}</div>
                </div>
              )}

              {game.created_at && (
                <div>
                  <strong style={{ color: '#7aa2f7', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Uploaded At</strong>
                  <div style={{ fontSize: 14, color: '#c0caf5', padding: '8px 12px', background: '#24283b', borderRadius: 8, border: '1px solid #3b4261' }}>{new Date(game.created_at).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Matchup Section */}
          <div style={{ background: '#1a1b26', padding: 16, borderRadius: 12, border: '1px solid #3b4261' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#9ece6a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'linear-gradient(135deg, #9ece6a 0%, #7aa2f7 100%)', width: 4, height: 20, borderRadius: 2 }}></span>
              Matchup
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: '16px', background: '#24283b', borderRadius: 8, border: '1px solid #3b4261', textAlign: 'center' }}>
                  <strong style={{ color: '#7aa2f7', display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Character</strong>
                  {characterSpriteUrl && !characterImgError ? (
                    <img
                      src={characterSpriteUrl}
                      alt={characterName}
                      onError={() => setCharacterImgError(true)}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'contain',
                        borderRadius: 8,
                        border: '2px solid #7aa2f7',
                        background: '#24283b',
                        padding: 4,
                        marginBottom: 8,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 8,
                border: '2px solid #7aa2f7',
                background: 'linear-gradient(135deg, #7aa2f7 0%, #9ece6a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1a1b26',
                        fontSize: 24,
                        fontWeight: 700,
                        margin: '0 auto 8px auto',
                      }}
                    >
                      {characterName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#c0caf5' }}>{characterName}</div>
                  {game.character && game.character !== characterName && (
                    <div style={{ fontSize: 11, color: '#565f89', marginTop: 4 }}>ID: {game.character}</div>
                  )}
                </div>
                <div style={{ padding: '16px', background: '#24283b', borderRadius: 8, border: '1px solid #3b4261', textAlign: 'center' }}>
                  <strong style={{ color: '#9ece6a', display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Opponent</strong>
                  {opponentSpriteUrl && !opponentImgError ? (
                    <img
                      src={opponentSpriteUrl}
                      alt={opponentName}
                      onError={() => setOpponentImgError(true)}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'contain',
                        borderRadius: 8,
                        border: '2px solid #9ece6a',
                        background: '#24283b',
                        padding: 4,
                        marginBottom: 8,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 8,
                border: '2px solid #9ece6a',
                background: 'linear-gradient(135deg, #9ece6a 0%, #7aa2f7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1a1b26',
                        fontSize: 24,
                        fontWeight: 700,
                        margin: '0 auto 8px auto',
                      }}
                    >
                      {opponentName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#9ece6a' }}>{opponentName}</div>
                  {game.opponent && game.opponent !== opponentName && (
                    <div style={{ fontSize: 11, color: '#565f89', marginTop: 4 }}>ID: {game.opponent}</div>
                  )}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#24283b', borderRadius: 8, border: '1px solid #3b4261' }}>
                <strong style={{ color: '#7aa2f7', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stage</strong>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#c0caf5' }}>{stageName}</div>
                {game.stage && game.stage !== stageName && (
                  <div style={{ fontSize: 11, color: '#565f89', marginTop: 4 }}>ID: {game.stage}</div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Stats Section */}
          <div style={{ background: '#1a1b26', padding: 16, borderRadius: 12, border: '1px solid #3b4261' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#c0caf5', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'linear-gradient(135deg, #7aa2f7 0%, #9ece6a 100%)', width: 4, height: 20, borderRadius: 2 }}></span>
              Performance Statistics
            </h3>
            <div style={{ display: 'grid', gap: 14 }}>
              {game.duration !== null && game.duration !== undefined && (
                <div style={{ padding: '12px', background: '#24283b', borderRadius: 8, border: '1px solid #3b4261' }}>
                  <strong style={{ color: '#7aa2f7', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</strong>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#c0caf5' }}>{durationFormatted}</div>
                  <div style={{ fontSize: 12, color: '#9ece6a', marginTop: 4 }}>
                    {game.duration.toLocaleString()} frames ({Math.round(game.duration / 60)} seconds)
                  </div>
                </div>
              )}

              {game.stocks_taken !== null && game.stocks_taken !== undefined && (
                <div style={{ padding: '12px', background: '#24283b', borderRadius: 8, border: '1px solid #3b4261' }}>
                  <strong style={{ color: '#9ece6a', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stocks Taken</strong>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#9ece6a' }}>{game.stocks_taken}</div>
                  <div style={{ fontSize: 12, color: '#565f89', marginTop: 4 }}>
                    {game.stocks_taken === 1 ? '1 stock' : `${game.stocks_taken} stocks`}
                  </div>
                </div>
              )}

              {game.openings_per_kill !== null && game.openings_per_kill !== undefined && game.openings_per_kill > 0 && (
                <div style={{ padding: '12px', background: '#24283b', borderRadius: 8, border: '2px solid', borderColor: game.openings_per_kill < 1 ? '#9ece6a' : game.openings_per_kill < 2 ? '#7aa2f7' : game.openings_per_kill < 3 ? '#bb9af7' : '#f7768e' }}>
                  <strong style={{ color: '#c0caf5', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Openings Per Kill (OPK)</strong>
                  <div style={{ fontSize: 20, fontWeight: 700, color: game.openings_per_kill < 1 ? '#9ece6a' : game.openings_per_kill < 2 ? '#7aa2f7' : game.openings_per_kill < 3 ? '#bb9af7' : '#f7768e' }}>{game.openings_per_kill.toFixed(2)}</div>
                  <div style={{ fontSize: 12, color: game.openings_per_kill < 1 ? '#9ece6a' : game.openings_per_kill < 2 ? '#7aa2f7' : game.openings_per_kill < 3 ? '#bb9af7' : '#f7768e', marginTop: 4, fontWeight: 500 }}>
                    {game.openings_per_kill < 1 ? '⭐ Excellent conversion rate' : 
                     game.openings_per_kill < 2 ? '✓ Good conversion rate' : 
                     game.openings_per_kill < 3 ? '○ Average conversion rate' : 
                     '⚠ Needs improvement'}
                  </div>
                  <div style={{ fontSize: 11, color: '#565f89', marginTop: 6 }}>
                    Lower is better - measures how many openings you need on average to secure a kill
                  </div>
                </div>
              )}

              {game.openings_per_kill !== null && game.openings_per_kill !== undefined && game.openings_per_kill === 0 && (
                <div style={{ padding: '12px', background: '#24283b', borderRadius: 8, border: '1px solid #3b4261' }}>
                  <strong style={{ color: '#7aa2f7', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Openings Per Kill (OPK)</strong>
                  <div style={{ fontSize: 14, color: '#565f89' }}>No data available</div>
                  <div style={{ fontSize: 11, color: '#565f89', marginTop: 4 }}>
                    No kills or conversions recorded in this game
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

