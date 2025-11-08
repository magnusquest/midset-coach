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
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [existingNotes, setExistingNotes] = useState<Array<{ id: number; content: string | null; created_at: string }>>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

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

  // Load existing notes when game changes
  useEffect(() => {
    if (!game) {
      setNotes('');
      setExistingNotes([]);
      return;
    }

    async function loadNotes() {
      setLoadingNotes(true);
      try {
        const res = await fetch(`/api/notes?gameId=${game.id}`);
        const data = await res.json();
        setExistingNotes(data.notes || []);
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setLoadingNotes(false);
      }
    }

    loadNotes();
  }, [game]);

  async function saveNotes() {
    if (!game || !notes.trim()) return;
    
    setSaving(true);
    setSavedMessage(null);
    
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, content: notes.trim() })
      });
      
      const data = await res.json();
      
      if (data.ok) {
        setNotes('');
        setSavedMessage('Notes saved successfully!');
        // Reload notes
        const notesRes = await fetch(`/api/notes?gameId=${game.id}`);
        const notesData = await notesRes.json();
        setExistingNotes(notesData.notes || []);
        
        setTimeout(() => setSavedMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
      setSavedMessage('Failed to save notes');
      setTimeout(() => setSavedMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  }

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
        backgroundColor: 'rgba(107, 70, 193, 0.4)',
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
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f0ff 100%)',
          borderRadius: 16,
          padding: 28,
          maxWidth: 600,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(155, 135, 245, 0.3)',
          border: '2px solid #c5b8fa',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #e8e0ff' }}>
          <h2 style={{ margin: 0, color: '#6b46c1', fontSize: 24, fontWeight: 700 }}>Game #{game.id}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #9b87f5 0%, #7dd87d 100%)',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              padding: '4px 12px',
              color: 'white',
              borderRadius: 8,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(155, 135, 245, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gap: 24 }}>
          {/* Game Info Section */}
          <div style={{ background: 'linear-gradient(135deg, #f5f0ff 0%, #f0f9f0 100%)', padding: 16, borderRadius: 12, border: '1px solid #e8e0ff' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#6b46c1', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'linear-gradient(135deg, #9b87f5 0%, #7dd87d 100%)', width: 4, height: 20, borderRadius: 2 }}></span>
              Game Information
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <strong style={{ color: '#9b87f5', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>File Path</strong>
                <div style={{ fontSize: 14, wordBreak: 'break-all', color: '#4a5568', padding: '8px 12px', background: 'white', borderRadius: 8, border: '1px solid #e8e0ff' }}>{game.file_path}</div>
              </div>

              {game.date && (
                <div>
                  <strong style={{ color: '#9b87f5', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Game Date</strong>
                  <div style={{ fontSize: 14, color: '#4a5568', padding: '8px 12px', background: 'white', borderRadius: 8, border: '1px solid #e8e0ff' }}>{new Date(game.date).toLocaleString()}</div>
                </div>
              )}

              {game.created_at && (
                <div>
                  <strong style={{ color: '#9b87f5', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Uploaded At</strong>
                  <div style={{ fontSize: 14, color: '#4a5568', padding: '8px 12px', background: 'white', borderRadius: 8, border: '1px solid #e8e0ff' }}>{new Date(game.created_at).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Matchup Section */}
          <div style={{ background: 'linear-gradient(135deg, #f0f9f0 0%, #f5f0ff 100%)', padding: 16, borderRadius: 12, border: '1px solid #d4f2d4' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#7dd87d', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'linear-gradient(135deg, #7dd87d 0%, #9b87f5 100%)', width: 4, height: 20, borderRadius: 2 }}></span>
              Matchup
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: '16px', background: 'white', borderRadius: 8, border: '1px solid #e8e0ff', textAlign: 'center' }}>
                  <strong style={{ color: '#9b87f5', display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Character</strong>
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
                        border: '2px solid #9b87f5',
                        background: 'white',
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
                        border: '2px solid #9b87f5',
                        background: 'linear-gradient(135deg, #9b87f5 0%, #7dd87d 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 24,
                        fontWeight: 700,
                        margin: '0 auto 8px auto',
                      }}
                    >
                      {characterName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#6b46c1' }}>{characterName}</div>
                  {game.character && game.character !== characterName && (
                    <div style={{ fontSize: 11, color: '#95a5a6', marginTop: 4 }}>ID: {game.character}</div>
                  )}
                </div>
                <div style={{ padding: '16px', background: 'white', borderRadius: 8, border: '1px solid #d4f2d4', textAlign: 'center' }}>
                  <strong style={{ color: '#7dd87d', display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Opponent</strong>
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
                        border: '2px solid #7dd87d',
                        background: 'white',
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
                        border: '2px solid #7dd87d',
                        background: 'linear-gradient(135deg, #7dd87d 0%, #9b87f5 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 24,
                        fontWeight: 700,
                        margin: '0 auto 8px auto',
                      }}
                    >
                      {opponentName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#52b052' }}>{opponentName}</div>
                  {game.opponent && game.opponent !== opponentName && (
                    <div style={{ fontSize: 11, color: '#95a5a6', marginTop: 4 }}>ID: {game.opponent}</div>
                  )}
                </div>
              </div>

              <div style={{ padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #c5b8fa' }}>
                <strong style={{ color: '#6b46c1', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stage</strong>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#6b46c1' }}>{stageName}</div>
                {game.stage && game.stage !== stageName && (
                  <div style={{ fontSize: 11, color: '#95a5a6', marginTop: 4 }}>ID: {game.stage}</div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Stats Section */}
          <div style={{ background: 'linear-gradient(135deg, #f5f0ff 0%, #f0f9f0 100%)', padding: 16, borderRadius: 12, border: '1px solid #e8e0ff' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#6b46c1', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'linear-gradient(135deg, #9b87f5 0%, #7dd87d 100%)', width: 4, height: 20, borderRadius: 2 }}></span>
              Performance Statistics
            </h3>
            <div style={{ display: 'grid', gap: 14 }}>
              {game.duration !== null && game.duration !== undefined && (
                <div style={{ padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #e8e0ff' }}>
                  <strong style={{ color: '#9b87f5', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</strong>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#6b46c1' }}>{durationFormatted}</div>
                  <div style={{ fontSize: 12, color: '#95e095', marginTop: 4 }}>
                    {game.duration.toLocaleString()} frames ({Math.round(game.duration / 60)} seconds)
                  </div>
                </div>
              )}

              {game.stocks_taken !== null && game.stocks_taken !== undefined && (
                <div style={{ padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #d4f2d4' }}>
                  <strong style={{ color: '#7dd87d', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stocks Taken</strong>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#52b052' }}>{game.stocks_taken}</div>
                  <div style={{ fontSize: 12, color: '#95a5a6', marginTop: 4 }}>
                    {game.stocks_taken === 1 ? '1 stock' : `${game.stocks_taken} stocks`}
                  </div>
                </div>
              )}

              {game.openings_per_kill !== null && game.openings_per_kill !== undefined && game.openings_per_kill > 0 && (
                <div style={{ padding: '12px', background: 'white', borderRadius: 8, border: '2px solid', borderColor: game.openings_per_kill < 1 ? '#7dd87d' : game.openings_per_kill < 2 ? '#95e095' : game.openings_per_kill < 3 ? '#c5b8fa' : '#f59e0b' }}>
                  <strong style={{ color: '#6b46c1', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Openings Per Kill (OPK)</strong>
                  <div style={{ fontSize: 20, fontWeight: 700, color: game.openings_per_kill < 1 ? '#52b052' : game.openings_per_kill < 2 ? '#7dd87d' : game.openings_per_kill < 3 ? '#9b87f5' : '#f59e0b' }}>{game.openings_per_kill.toFixed(2)}</div>
                  <div style={{ fontSize: 12, color: game.openings_per_kill < 1 ? '#7dd87d' : game.openings_per_kill < 2 ? '#95e095' : game.openings_per_kill < 3 ? '#9b87f5' : '#f59e0b', marginTop: 4, fontWeight: 500 }}>
                    {game.openings_per_kill < 1 ? '⭐ Excellent conversion rate' : 
                     game.openings_per_kill < 2 ? '✓ Good conversion rate' : 
                     game.openings_per_kill < 3 ? '○ Average conversion rate' : 
                     '⚠ Needs improvement'}
                  </div>
                  <div style={{ fontSize: 11, color: '#95a5a6', marginTop: 6 }}>
                    Lower is better - measures how many openings you need on average to secure a kill
                  </div>
                </div>
              )}

              {game.openings_per_kill !== null && game.openings_per_kill !== undefined && game.openings_per_kill === 0 && (
                <div style={{ padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #e8e0ff' }}>
                  <strong style={{ color: '#9b87f5', display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Openings Per Kill (OPK)</strong>
                  <div style={{ fontSize: 14, color: '#95a5a6' }}>No data available</div>
                  <div style={{ fontSize: 11, color: '#95a5a6', marginTop: 4 }}>
                    No kills or conversions recorded in this game
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Review Notes Section */}
          <div style={{ background: 'linear-gradient(135deg, #f5f0ff 0%, #f0f9f0 100%)', padding: 16, borderRadius: 12, border: '1px solid #e8e0ff' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#6b46c1', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'linear-gradient(135deg, #9b87f5 0%, #7dd87d 100%)', width: 4, height: 20, borderRadius: 2 }}></span>
              Review Notes
            </h3>
            
            {/* Existing Notes */}
            {loadingNotes ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#9b87f5', fontSize: 14 }}>
                Loading notes...
              </div>
            ) : existingNotes.length > 0 ? (
              <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                {existingNotes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      padding: '12px',
                      background: 'white',
                      borderRadius: 8,
                      border: '1px solid #e8e0ff',
                    }}
                  >
                    <div style={{ fontSize: 14, color: '#4a5568', whiteSpace: 'pre-wrap', marginBottom: 6 }}>
                      {note.content}
                    </div>
                    <div style={{ fontSize: 11, color: '#95a5a6' }}>
                      {new Date(note.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Add New Note */}
            <div style={{ display: 'grid', gap: 12 }}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your review notes for this game..."
                rows={4}
                style={{
                  padding: '12px',
                  borderRadius: 8,
                  border: '2px solid #c5b8fa',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  background: 'white',
                  color: '#4a5568',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#9b87f5';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#c5b8fa';
                }}
              />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={saveNotes}
                  disabled={!notes.trim() || saving}
                  style={{
                    padding: '10px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    background: notes.trim() && !saving
                      ? 'linear-gradient(135deg, #9b87f5 0%, #7dd87d 100%)'
                      : 'linear-gradient(135deg, #c5b8fa 0%, #aee8ae 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: notes.trim() && !saving ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    boxShadow: notes.trim() && !saving ? '0 2px 8px rgba(155, 135, 245, 0.3)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (notes.trim() && !saving) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(155, 135, 245, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (notes.trim() && !saving) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(155, 135, 245, 0.3)';
                    }
                  }}
                >
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
                
                {savedMessage && (
                  <span style={{ 
                    fontSize: 13, 
                    color: savedMessage.includes('Failed') ? '#f59e0b' : '#7dd87d',
                    fontWeight: 500,
                  }}>
                    {savedMessage}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

