"use client";
import React from 'react';
import ChatUI from '../../../components/ChatUI';

export default function CoachPage() {
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
      <ChatUI />
    </div>
  );
}

