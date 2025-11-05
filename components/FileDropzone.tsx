"use client";
import React, { useCallback, useState } from 'react';

export default function FileDropzone() {
  const [hover, setHover] = useState(false);
  const onDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setHover(false);
    const files = Array.from(event.dataTransfer.files || []);
    const slpFiles = files.filter((f) => f.name.endsWith('.slp'));
    if (slpFiles.length === 0) return;

    console.log(slpFiles);

    const form = new FormData();
    for (const f of slpFiles) form.append('file', f);
    await fetch('/api/upload', { method: 'POST', body: form });
    // TODO: show toast / refresh list via a state store
  }, []);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={onDrop}
      style={{
        border: '2px dashed #888',
        padding: 24,
        borderRadius: 8,
        background: hover ? '#f6f8fa' : 'transparent',
      }}
    >
      <p style={{ margin: 0 }}>Drag and drop Slippi (.slp) files here</p>
    </div>
  );
}

