"use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function handleClearDatabase() {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      return;
    }

    setClearing(true);
    try {
      const res = await fetch('/api/clear', { method: 'POST' });
      const data = await res.json();
      
      if (data.ok) {
        alert('Database cleared successfully! Page will reload.');
        window.location.reload();
      } else {
        alert('Failed to clear database: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error clearing database:', error);
      alert('Failed to clear database');
    } finally {
      setClearing(false);
      setShowClearConfirm(false);
    }
  }

  return (
    <header style={{ 
      padding: '20px 24px', 
      borderBottom: '2px solid #e8e0ff',
      background: 'linear-gradient(135deg, #ffffff 0%, #f5f0ff 100%)',
      boxShadow: '0 2px 8px rgba(155, 135, 245, 0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: 28,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #9b87f5 0%, #7dd87d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            MidSet Coach
          </h1>
          <nav style={{ display: 'flex', gap: 8 }}>
            <a 
              href="/review"
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 600,
                transition: 'all 0.2s',
                background: pathname === '/review' 
                  ? 'linear-gradient(135deg, #9b87f5 0%, #7dd87d 100%)'
                  : 'transparent',
                color: pathname === '/review' ? 'white' : '#6b46c1',
                border: pathname === '/review' ? 'none' : '2px solid #c5b8fa',
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/review') {
                  e.currentTarget.style.background = '#f5f0ff';
                  e.currentTarget.style.borderColor = '#9b87f5';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/review') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#c5b8fa';
                }
              }}
            >
              Review
            </a>
            <a 
              href="/coach"
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 600,
                transition: 'all 0.2s',
                background: pathname === '/coach' 
                  ? 'linear-gradient(135deg, #9b87f5 0%, #7dd87d 100%)'
                  : 'transparent',
                color: pathname === '/coach' ? 'white' : '#6b46c1',
                border: pathname === '/coach' ? 'none' : '2px solid #c5b8fa',
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/coach') {
                  e.currentTarget.style.background = '#f5f0ff';
                  e.currentTarget.style.borderColor = '#9b87f5';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/coach') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#c5b8fa';
                }
              }}
            >
              Coach
            </a>
          </nav>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showClearConfirm ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 500 }}>
                Confirm clear?
              </span>
              <button
                onClick={handleClearDatabase}
                disabled={clearing}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: clearing 
                    ? 'linear-gradient(135deg, #c5b8fa 0%, #aee8ae 100%)'
                    : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: clearing ? 'not-allowed' : 'pointer',
                }}
              >
                {clearing ? 'Clearing...' : 'Yes'}
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'white',
                  color: '#6b46c1',
                  border: '2px solid #c5b8fa',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleClearDatabase}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(245, 158, 11, 0.3)';
              }}
            >
              🗑️ Clear Database
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

