"use client";
import React, { useRef, useState } from 'react';

export default function ChatUI() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function send() {
    const content = input.trim();
    if (!content) return;
    setMessages((m) => [...m, { role: 'user', content }]);
    setInput('');

    // Retrieve context then ask assistant (text fallback)
    const ctxRes = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: content, k: 5 }) });
    const ctx = await ctxRes.json();
    const res = await fetch('/api/notes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: content, context: ctx.results }) });
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
        border: '2px solid #c5b8fa', 
        borderRadius: 12, 
        padding: 20, 
        minHeight: 300,
        maxHeight: 500,
        overflow: 'auto',
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f0ff 100%)',
        boxShadow: '0 2px 8px rgba(155, 135, 245, 0.1)',
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#9b87f5', 
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
                  ? 'linear-gradient(135deg, #e8e0ff 0%, #f0f9f0 100%)'
                  : 'linear-gradient(135deg, #f0f9f0 0%, #e8e0ff 100%)',
                border: `2px solid ${m.role === 'user' ? '#c5b8fa' : '#d4f2d4'}`,
              }}
            >
              <strong style={{ 
                color: m.role === 'user' ? '#9b87f5' : '#7dd87d', 
                fontSize: 14,
                display: 'block',
                marginBottom: 6,
              }}>
                {m.role === 'user' ? 'You' : '🎓 Coach'}:
              </strong>
              <div style={{ 
                color: '#4a5568', 
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
            border: '2px solid #c5b8fa',
            fontSize: 14,
            fontFamily: 'inherit',
            background: 'white',
            color: '#4a5568',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#9b87f5';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#c5b8fa';
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
              ? 'linear-gradient(135deg, #9b87f5 0%, #7dd87d 100%)'
              : 'linear-gradient(135deg, #c5b8fa 0%, #aee8ae 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            boxShadow: input.trim() ? '0 2px 8px rgba(155, 135, 245, 0.3)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (input.trim()) {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(155, 135, 245, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (input.trim()) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(155, 135, 245, 0.3)';
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
            background: 'linear-gradient(135deg, #7dd87d 0%, #9b87f5 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(125, 216, 125, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(125, 216, 125, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(125, 216, 125, 0.3)';
          }}
        >
          🎤 Voice
        </button>
      </div>
      <audio ref={audioRef} />
    </div>
  );
}

