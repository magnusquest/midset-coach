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
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, minHeight: 200 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '8px 0' }}>
            <strong>{m.role === 'user' ? 'You' : 'Coach'}:</strong> {m.content}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the coach..." style={{ flex: 1 }} />
        <button onClick={send}>Send</button>
        <button onClick={startVoice}>Voice</button>
      </div>
      <audio ref={audioRef} />
    </div>
  );
}

