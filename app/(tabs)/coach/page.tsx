"use client";
import React, { useState, useEffect } from 'react';
import ChatUI from '../../../components/ChatUI';
import MatchupSelector from '../../../components/MatchupSelector';
import RealtimeCoach from '../../../components/RealtimeCoach';

export default function CoachPage() {
  const [userCharacter, setUserCharacter] = useState<string | null>(null);
  const [opponentCharacter, setOpponentCharacter] = useState<string | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextLoaded, setContextLoaded] = useState(false);

  // Pre-load context when matchup is selected
  useEffect(() => {
    if (userCharacter && opponentCharacter) {
      setContextLoading(true);
      setContextLoaded(false);
      
      // Pre-load context for this matchup
      fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${userCharacter} vs ${opponentCharacter} matchup`,
          k: 10,
          userCharacter,
          opponentCharacter,
        }),
      })
        .then(res => res.json())
        .then(data => {
          setContextLoaded(true);
          setContextLoading(false);
        })
        .catch(err => {
          console.error('Failed to pre-load context:', err);
          setContextLoading(false);
        });
    } else {
      setContextLoaded(false);
    }
  }, [userCharacter, opponentCharacter]);

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
        Coach
      </h2>
      
      <MatchupSelector
        userCharacter={userCharacter}
        opponentCharacter={opponentCharacter}
        onUserCharacterChange={setUserCharacter}
        onOpponentCharacterChange={setOpponentCharacter}
      />
      
      {contextLoading && (
        <div style={{
          padding: 12,
          background: '#f5f0ff',
          borderRadius: 8,
          border: '2px solid #c5b8fa',
          textAlign: 'center',
          color: '#6b46c1',
          fontSize: 14,
        }}>
          Loading context for matchup...
        </div>
      )}
      
      {contextLoaded && !contextLoading && (
        <div style={{
          padding: 12,
          background: '#f0f9f0',
          borderRadius: 8,
          border: '2px solid #d4f2d4',
          textAlign: 'center',
          color: '#52b052',
          fontSize: 14,
        }}>
          ✓ Context loaded for this matchup
        </div>
      )}
      
      <RealtimeCoach
        userCharacter={userCharacter}
        opponentCharacter={opponentCharacter}
      />
      
      <ChatUI 
        userCharacter={userCharacter}
        opponentCharacter={opponentCharacter}
      />
    </div>
  );
}

