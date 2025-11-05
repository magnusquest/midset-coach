"use client";
import React, { useState } from 'react';

export default function NotesEditor() {
  const [text, setText] = useState('');
  const [gameId, setGameId] = useState<number | ''>('');

  async function save() {
    if (!gameId) return;
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, content: text })
    });
    setText('');
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label htmlFor="gameId">Game ID</label>
        <input
          id="gameId"
          type="number"
          value={gameId}
          onChange={(e) => setGameId(e.target.value ? Number(e.target.value) : '')}
          style={{ width: 120 }}
        />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Add your review notes here..."
      />
      <div>
        <button onClick={save} disabled={!gameId || !text.trim()}>Save Notes</button>
      </div>
    </div>
  );
}

