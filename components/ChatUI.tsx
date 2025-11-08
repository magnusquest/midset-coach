"use client";
import React, { useRef, useState } from 'react';

type Props = {
  userCharacter?: string | null;
  opponentCharacter?: string | null;
};

export default function ChatUI({ userCharacter, opponentCharacter }: Props) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function send() {
    const content = input.trim();
    if (!content) return;
    setMessages((m) => [...m, { role: 'user', content }]);
    setInput('');

    // Retrieve context then ask assistant (text fallback)
    // Include matchup filtering if characters are selected
    const searchBody: any = { query: content, k: 5 };
    if (userCharacter && opponentCharacter) {
      searchBody.userCharacter = userCharacter;
      searchBody.opponentCharacter = opponentCharacter;
    }
    
    const ctxRes = await fetch('/api/search', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(searchBody) 
    });
    const ctx = await ctxRes.json();
    const res = await fetch('/api/notes', { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ query: content, context: ctx.results }) 
    });
    const data = await res.json();
    const answer = data.answer || '(no response)';
    setMessages((m) => [...m, { role: 'assistant', content: answer }]);
    try { window.speechSynthesis?.speak(new SpeechSynthesisUtterance(answer)); } catch {}
  }

  async function startVoice() {
    // Browser voice input via Web Speech API, send as text
    const Rec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!Rec) return alert('SpeechRecognition not supported');
    const rec = new Rec();
    rec.continuous = false;
    rec.lang = 'en-US';
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join(' ');
      setInput(transcript);
      setTimeout(() => send(), 0);
    };
    rec.start();
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ 
        border: '1px solid #3b4261', 
        borderRadius: 12, 
        padding: 20, 
        minHeight: 300,
        maxHeight: 500,
        overflow: 'auto',
        background: '#24283b',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#7aa2f7', 
            fontSize: 15, 
            padding: '40px 20px',
            fontStyle: 'italic',
          }}>
            Ask me anything about your games! I'll analyze your stats and notes to help you improve.
          </div>
        ) : (
          messages.map((m, i) => (
            <div 
              key={i} 
              style={{ 
                margin: '12px 0',
                padding: '12px 16px',
                borderRadius: 8,
                background: m.role === 'user' 
                  ? '#2f3549'
                  : '#1a1b26',
                border: `1px solid ${m.role === 'user' ? '#3b4261' : '#565f89'}`,
              }}
            >
              <strong style={{ 
                color: m.role === 'user' ? '#7aa2f7' : '#9ece6a', 
                fontSize: 14,
                display: 'block',
                marginBottom: 6,
              }}>
                {m.role === 'user' ? 'You' : '🎓 Coach'}:
              </strong>
              <div style={{ 
                color: '#c0caf5', 
                fontSize: 14, 
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask the coach about your games..." 
          style={{ 
            flex: 1,
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid #3b4261',
            fontSize: 14,
            fontFamily: 'inherit',
            background: '#24283b',
            color: '#c0caf5',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#7aa2f7';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#3b4261';
          }}
        />
        <button 
          onClick={send}
          disabled={!input.trim()}
          style={{
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            background: input.trim()
              ? '#7aa2f7'
              : '#565f89',
            color: input.trim() ? '#1a1b26' : '#565f89',
            border: 'none',
            borderRadius: 10,
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            boxShadow: input.trim() ? '0 2px 8px rgba(122, 162, 247, 0.3)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (input.trim()) {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(122, 162, 247, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (input.trim()) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(122, 162, 247, 0.3)';
            }
          }}
        >
          Send
        </button>
        <button 
          onClick={startVoice}
          style={{
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 600,
            background: '#9ece6a',
            color: '#1a1b26',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(158, 206, 106, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(158, 206, 106, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(158, 206, 106, 0.3)';
          }}
        >
          🎤 Voice
        </button>
      </div>
      <audio ref={audioRef} />
    </div>
  );
}

