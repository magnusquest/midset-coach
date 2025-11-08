import React from 'react';
import './globals.css';
import Header from './Header';

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
      <body style={{ 
        margin: 0, 
        padding: 0,
        background: '#1a1b26',
        minHeight: '100vh',
      }}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}

