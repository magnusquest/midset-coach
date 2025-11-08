"use client";
import React, { useState, useEffect } from 'react';
import FileDropzone from '../../../components/FileDropzone';
import GameCard from '../../../components/GameCard';
import GameDetailsModal from '../../../components/GameDetailsModal';

type Game = {
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

export default function ReviewPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const res = await fetch('/api/games?limit=20');
      const data = await res.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleGameClick(game: Game) {
    setSelectedGame(game);
  }

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
        background: 'linear-gradient(135deg, #9b87f5 0%, #7dd87d 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        Review
      </h2>
      <FileDropzone />
      {loading ? (
        <div style={{ 
          padding: '24px', 
          textAlign: 'center', 
          color: '#6b46c1', 
          fontSize: 16, 
          fontWeight: 500,
          background: 'white',
          borderRadius: 12,
          border: '2px solid #e8e0ff',
        }}>
          Loading games...
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {games.length === 0 ? (
            <div style={{ 
              padding: '32px', 
              textAlign: 'center', 
              color: '#6b46c1', 
              fontSize: 16, 
              background: 'white',
              borderRadius: 12,
              border: '2px dashed #c5b8fa',
            }}>
              No games found. Import some Slippi files to get started!
            </div>
          ) : (
            games.map((g) => (
              <GameCard
                key={g.id}
                id={g.id}
                file_path={g.file_path}
                character={g.character}
                opponent={g.opponent}
                stage={g.stage}
                duration={g.duration}
                onClick={() => handleGameClick(g)}
              />
            ))
          )}
        </div>
      )}
      <GameDetailsModal game={selectedGame} onClose={() => setSelectedGame(null)} />
    </div>
  );
}

