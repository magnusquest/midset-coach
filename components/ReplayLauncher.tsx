"use client";
import React, { useState } from 'react';

type Props = {
  filePath: string;
  gameId: number;
};

export default function ReplayLauncher({ filePath, gameId }: Props) {
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLaunch() {
    setLaunching(true);
    setError(null);
    
    try {
      const res = await fetch('/api/replay/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, gameId }),
      });
      
      const data = await res.json();
      
      if (data.ok) {
        // Success
      } else {
        setError(data.error || 'Failed to launch replay');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to launch replay');
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        onClick={handleLaunch}
        disabled={launching}
        style={{
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 600,
          background: launching
            ? '#565f89'
            : '#7aa2f7',
          color: launching ? '#565f89' : '#1a1b26',
          border: 'none',
          borderRadius: 8,
          cursor: launching ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {launching ? 'Launching...' : '🎮 Watch Replay'}
      </button>
      {error && (
        <div style={{ 
          padding: '8px 12px', 
          background: '#1a1b26', 
          borderRadius: 8, 
          border: '1px solid #f7768e',
          color: '#f7768e',
          fontSize: 12,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

