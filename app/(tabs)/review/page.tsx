"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatDuration, getCharacterName, getStageName, getCharacterSpriteUrl } from '../../../lib/slippi-utils';
import { CharacterId, StageId } from '../../../lib/types';
import ReplayLauncher from '../../../components/ReplayLauncher';

type Game = {
  id: number;
  file_path: string;
  date?: string | null;
  character?: CharacterId | null;
  opponent?: CharacterId | null;
  stage?: StageId | null;
  duration?: number | null;
  stocks_taken?: number | null;
  openings_per_kill?: number | null;
  win_loss?: string | null;
  created_at?: string;
};

type Note = {
  id: number;
  game_id: number;
  content: string | null;
  note_type: string | null;
  created_at: string;
};

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameIdParam = searchParams.get('gameId');
  
  const [game, setGame] = useState<Game | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (gameIdParam) {
      fetchGame(parseInt(gameIdParam, 10));
    } else if (games.length > 0) {
      // Default to most recent game
      fetchGame(games[0].id);
    }
  }, [gameIdParam, games]);

  useEffect(() => {
    if (game) {
      fetchNotes(game.id);
    }
  }, [game]);

  async function fetchGames() {
    try {
      const res = await fetch('/api/games?limit=100&orderBy=date&order=DESC');
      const data = await res.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchGame(id: number) {
    try {
      const res = await fetch(`/api/games`);
      const data = await res.json();
      const foundGame = data.games.find((g: Game) => g.id === id);
      if (foundGame) {
        setGame(foundGame);
        router.replace(`/review?gameId=${id}`, { scroll: false });
      }
    } catch (error) {
      console.error('Failed to fetch game:', error);
    }
  }

  async function fetchNotes(gameId: number) {
    try {
      const res = await fetch(`/api/notes?gameId=${gameId}`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  }

  async function saveNote() {
    if (!game || !noteContent.trim()) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          content: noteContent.trim(),
          noteType: null, // Freeform note
        }),
      });
      
      const data = await res.json();
      
      if (data.ok) {
        // Clear the note content
        setNoteContent('');
        // Reload notes
        await fetchNotes(game.id);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '24px', 
        textAlign: 'center', 
        color: '#c0caf5', 
        fontSize: 16, 
        fontWeight: 500,
        background: '#24283b',
        borderRadius: 12,
        border: '1px solid #3b4261',
      }}>
        Loading...
      </div>
    );
  }

  if (!game) {
    return (
      <div style={{ 
        display: 'grid', 
        gap: 24, 
        padding: '24px',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: 32, 
          fontWeight: 800, 
          background: 'linear-gradient(135deg, #7aa2f7 0%, #9ece6a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Review
        </h2>
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#c0caf5', 
          fontSize: 16, 
          background: '#24283b',
          borderRadius: 12,
          border: '2px dashed #3b4261',
        }}>
          No game selected. Select a game from the Games tab.
        </div>
      </div>
    );
  }

  const characterName = getCharacterName(game.character);
  const opponentName = getCharacterName(game.opponent);
  const stageName = getStageName(game.stage);
  const durationFormatted = formatDuration(game.duration);

  return (
    <div style={{ 
      display: 'grid', 
      gap: 24, 
      padding: '24px',
      maxWidth: 1200,
      margin: '0 auto',
      width: '100%',
    }}>
      <h2 style={{ 
        margin: 0, 
        fontSize: 32, 
        fontWeight: 800, 
        background: 'linear-gradient(135deg, #7aa2f7 0%, #9ece6a 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        Review
      </h2>

      {/* Game Selector */}
      <div style={{
        padding: 16,
        background: '#24283b',
        borderRadius: 12,
        border: '1px solid #3b4261',
      }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#6b46c1' }}>
          Select Game
        </label>
        <select
          value={game.id}
          onChange={(e) => {
            const selectedId = parseInt(e.target.value, 10);
            fetchGame(selectedId);
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #3b4261',
            fontSize: 14,
            background: '#24283b',
            color: '#c0caf5',
          }}
        >
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              Game #{g.id} - {getCharacterName(g.character)} vs {getCharacterName(g.opponent)} - {g.date ? new Date(g.date).toLocaleDateString() : 'No date'}
            </option>
          ))}
        </select>
      </div>

      {/* Game Info */}
      <div style={{
        padding: 20,
        background: '#1a1b26',
        borderRadius: 12,
        border: '1px solid #3b4261',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#6b46c1' }}>
            Game #{game.id}
          </h3>
          <ReplayLauncher filePath={game.file_path} gameId={game.id} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <strong style={{ color: '#9b87f5', fontSize: 12, fontWeight: 600 }}>Matchup</strong>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#6b46c1' }}>
              {characterName} vs {opponentName}
            </div>
          </div>
          <div>
            <strong style={{ color: '#9b87f5', fontSize: 12, fontWeight: 600 }}>Stage</strong>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#6b46c1' }}>{stageName}</div>
          </div>
          <div>
            <strong style={{ color: '#9b87f5', fontSize: 12, fontWeight: 600 }}>Duration</strong>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#6b46c1' }}>{durationFormatted}</div>
          </div>
          {game.win_loss && (
            <div>
              <strong style={{ color: '#9b87f5', fontSize: 12, fontWeight: 600 }}>Result</strong>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                color: game.win_loss === 'win' ? '#52b052' : '#ef4444' 
              }}>
                {game.win_loss === 'win' ? 'Win' : 'Loss'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Notes */}
      <div style={{
        padding: 20,
        background: '#24283b',
        borderRadius: 12,
        border: '1px solid #3b4261',
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#6b46c1' }}>
          Review Notes
        </h3>
        
        {/* Existing Notes */}
        {notes.length > 0 && (
          <div style={{ marginBottom: 16, display: 'grid', gap: 8 }}>
            {notes.map((note) => (
              <div
                key={note.id}
                style={{
                  padding: 12,
                  background: '#1a1b26',
                  borderRadius: 8,
                  border: '1px solid #3b4261',
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
        )}

        {/* Note Input */}
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Add your review notes for this game..."
          rows={6}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            border: '1px solid #3b4261',
            fontSize: 14,
            fontFamily: 'inherit',
            resize: 'vertical',
            background: '#24283b',
            color: '#c0caf5',
            marginBottom: 12,
          }}
        />
        
        <button
          onClick={saveNote}
          disabled={!noteContent.trim() || saving}
          style={{
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            background: noteContent.trim() && !saving
              ? '#7aa2f7'
              : '#565f89',
            color: noteContent.trim() && !saving ? '#1a1b26' : '#565f89',
            border: 'none',
            borderRadius: 8,
            cursor: noteContent.trim() && !saving ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        padding: '24px', 
        textAlign: 'center', 
        color: '#c0caf5', 
        fontSize: 16, 
        fontWeight: 500,
        background: '#24283b',
        borderRadius: 12,
        border: '1px solid #3b4261',
      }}>
        Loading...
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}
