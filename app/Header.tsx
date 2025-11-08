"use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function handleClearDatabase() {
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
      setShowModal(false);
    }
  }

  return (
    <>
      <header style={{ 
        padding: '20px 24px', 
        borderBottom: '2px solid #3b4261',
        background: '#24283b',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: 28,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #7aa2f7 0%, #9ece6a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              MidSet Coach
            </h1>
            <nav style={{ display: 'flex', gap: 8 }}>
              <a 
                href="/games"
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  background: pathname === '/games' 
                    ? '#7aa2f7'
                    : 'transparent',
                  color: pathname === '/games' ? '#1a1b26' : '#c0caf5',
                  border: pathname === '/games' ? 'none' : '1px solid #3b4261',
                }}
                onMouseEnter={(e) => {
                  if (pathname !== '/games') {
                    e.currentTarget.style.background = '#2f3549';
                    e.currentTarget.style.borderColor = '#7aa2f7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/games') {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#3b4261';
                  }
                }}
              >
                Games
              </a>
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
                    ? '#7aa2f7'
                    : 'transparent',
                  color: pathname === '/review' ? '#1a1b26' : '#c0caf5',
                  border: pathname === '/review' ? 'none' : '1px solid #3b4261',
                }}
                onMouseEnter={(e) => {
                  if (pathname !== '/review') {
                    e.currentTarget.style.background = '#2f3549';
                    e.currentTarget.style.borderColor = '#7aa2f7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/review') {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#3b4261';
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
                    ? '#7aa2f7'
                    : 'transparent',
                  color: pathname === '/coach' ? '#1a1b26' : '#c0caf5',
                  border: pathname === '/coach' ? 'none' : '1px solid #3b4261',
                }}
                onMouseEnter={(e) => {
                  if (pathname !== '/coach') {
                    e.currentTarget.style.background = '#2f3549';
                    e.currentTarget.style.borderColor = '#7aa2f7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/coach') {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#3b4261';
                  }
                }}
              >
                Coach
              </a>
            </nav>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              background: 'transparent',
              color: '#565f89',
              border: '1px solid #3b4261',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2f3549';
              e.currentTarget.style.borderColor = '#565f89';
              e.currentTarget.style.color = '#a9b1d6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#3b4261';
              e.currentTarget.style.color = '#565f89';
            }}
          >
            Reset
          </button>
        </div>
      </header>

      {/* Confirmation Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#24283b',
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              width: '100%',
              border: '1px solid #3b4261',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 18, 
              fontWeight: 700, 
              color: '#c0caf5' 
            }}>
              Clear Database?
            </h3>
            <p style={{ 
              margin: '0 0 24px 0', 
              fontSize: 14, 
              color: '#a9b1d6',
              lineHeight: 1.6,
            }}>
              This will permanently delete all games, notes, and documents. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  background: 'transparent',
                  color: '#c0caf5',
                  border: '1px solid #3b4261',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2f3549';
                  e.currentTarget.style.borderColor = '#565f89';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#3b4261';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearDatabase}
                disabled={clearing}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  background: clearing 
                    ? '#565f89'
                    : '#f7768e',
                  color: '#1a1b26',
                  border: 'none',
                  borderRadius: 8,
                  cursor: clearing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!clearing) {
                    e.currentTarget.style.background = '#ff7a93';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!clearing) {
                    e.currentTarget.style.background = '#f7768e';
                  }
                }}
              >
                {clearing ? 'Clearing...' : 'Clear Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

