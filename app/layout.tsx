import React from 'react';
import './globals.css';

export const metadata = {
  title: 'MidSet Coach',
  description: 'AI Melee coach with RAG and realtime voice',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: 16, borderBottom: '1px solid #eee' }}>
          <h1 style={{ margin: 0 }}>MidSet Coach</h1>
          <nav style={{ marginTop: 8, display: 'flex', gap: 12 }}>
            <a href="/review">Review</a>
            <a href="/coach">Coach</a>
          </nav>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}

