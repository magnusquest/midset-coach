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
            ? 'linear-gradient(135deg, #c5b8fa 0%, #aee8ae 100%)'
            : 'linear-gradient(135deg, #9b87f5 0%, #7dd87d 100%)',
          color: 'white',
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
          background: '#fff5e6', 
          borderRadius: 8, 
          border: '1px solid #fbbf24',
          color: '#f59e0b',
          fontSize: 12,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

