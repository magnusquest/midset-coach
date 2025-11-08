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
        background: 'linear-gradient(135deg, #faf5ff 0%, #f0fff0 100%)',
        minHeight: '100vh',
      }}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}

