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
  win_loss?: string | null;
  created_at?: string;
};

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    character: '',
    opponent: '',
    stage: '',
    win_loss: '',
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  useEffect(() => {
    fetchGames();
  }, [filters, sortBy, sortOrder]);

  async function fetchGames() {
    try {
      const params = new URLSearchParams();
      if (filters.character) params.append('character', filters.character);
      if (filters.opponent) params.append('opponent', filters.opponent);
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.win_loss) params.append('win_loss', filters.win_loss);
      params.append('orderBy', sortBy);
      params.append('order', sortOrder);
      params.append('limit', '50');

      const res = await fetch(`/api/games?${params.toString()}`);
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
        Games
      </h2>
      
      {/* Filters and Sort */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        padding: 16,
        background: 'white',
        borderRadius: 12,
        border: '2px solid #e8e0ff',
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600, color: '#6b46c1' }}>
            Character
          </label>
          <select
            value={filters.character}
            onChange={(e) => setFilters({ ...filters, character: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '2px solid #c5b8fa',
              fontSize: 14,
              background: 'white',
              color: '#4a5568',
            }}
          >
            <option value="">All</option>
            <option value="1">Fox</option>
            <option value="19">Falco</option>
            <option value="23">Marth</option>
            <option value="7">Sheik</option>
            <option value="2">Captain Falcon</option>
            <option value="0">Mario</option>
            <option value="9">Peach</option>
            <option value="12">Pikachu</option>
            <option value="14">Yoshi</option>
            <option value="15">Jigglypuff</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600, color: '#6b46c1' }}>
            Opponent
          </label>
          <select
            value={filters.opponent}
            onChange={(e) => setFilters({ ...filters, opponent: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '2px solid #c5b8fa',
              fontSize: 14,
              background: 'white',
              color: '#4a5568',
            }}
          >
            <option value="">All</option>
            <option value="1">Fox</option>
            <option value="19">Falco</option>
            <option value="23">Marth</option>
            <option value="7">Sheik</option>
            <option value="2">Captain Falcon</option>
            <option value="0">Mario</option>
            <option value="9">Peach</option>
            <option value="12">Pikachu</option>
            <option value="14">Yoshi</option>
            <option value="15">Jigglypuff</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600, color: '#6b46c1' }}>
            Stage
          </label>
          <select
            value={filters.stage}
            onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '2px solid #c5b8fa',
              fontSize: 14,
              background: 'white',
              color: '#4a5568',
            }}
          >
            <option value="">All</option>
            <option value="8">Battlefield</option>
            <option value="31">Final Destination</option>
            <option value="28">Dream Land</option>
            <option value="2">Yoshi's Story</option>
            <option value="3">Fountain of Dreams</option>
            <option value="4">Pokemon Stadium</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600, color: '#6b46c1' }}>
            Win/Loss
          </label>
          <select
            value={filters.win_loss}
            onChange={(e) => setFilters({ ...filters, win_loss: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '2px solid #c5b8fa',
              fontSize: 14,
              background: 'white',
              color: '#4a5568',
            }}
          >
            <option value="">All</option>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600, color: '#6b46c1' }}>
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '2px solid #c5b8fa',
              fontSize: 14,
              background: 'white',
              color: '#4a5568',
            }}
          >
            <option value="date">Date</option>
            <option value="created_at">Created At</option>
            <option value="character">Character</option>
            <option value="opponent">Opponent</option>
            <option value="stage">Stage</option>
            <option value="win_loss">Win/Loss</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600, color: '#6b46c1' }}>
            Order
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'ASC' | 'DESC')}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '2px solid #c5b8fa',
              fontSize: 14,
              background: 'white',
              color: '#4a5568',
            }}
          >
            <option value="DESC">Newest First</option>
            <option value="ASC">Oldest First</option>
          </select>
        </div>
      </div>

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

