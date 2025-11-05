import React from 'react';
import FileDropzone from '../../../components/FileDropzone';
import NotesEditor from '../../../components/NotesEditor';
import GameCard from '../../../components/GameCard';
import { ensureSchema } from '../../../lib/schema';
import { getDb } from '../../../lib/db';

export default function ReviewPage() {
  ensureSchema();
  const db = getDb();
  const games = db
    .prepare('SELECT id, file_path, character, opponent, stage, duration FROM games ORDER BY id DESC LIMIT 20')
    .all() as Array<any>;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>Review</h2>
      <FileDropzone />
      <div style={{ display: 'grid', gap: 8 }}>
        {games.map((g) => (
          <GameCard key={g.id} {...g} />
        ))}
      </div>
      <NotesEditor />
    </div>
  );
}

