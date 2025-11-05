import React from 'react';

type Props = {
  id: number;
  file_path: string;
  character?: string | null;
  opponent?: string | null;
  stage?: string | null;
  duration?: number | null;
};

export default function GameCard(props: Props) {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
      <div style={{ fontWeight: 600 }}>Game #{props.id} — {props.file_path}</div>
      <div style={{ color: '#555', marginTop: 4 }}>
        {props.character ?? '-'} vs {props.opponent ?? '-'} on {props.stage ?? '-'} ({props.duration ?? 0}s)
      </div>
    </div>
  );
}

