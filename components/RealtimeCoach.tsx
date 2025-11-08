"use client";
import React, { useState, useRef, useEffect } from 'react';

type Props = {
  userCharacter?: string | null;
  opponentCharacter?: string | null;
};

export default function RealtimeCoach({ userCharacter, opponentCharacter }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [useRealtime, setUseRealtime] = useState(true);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  async function startRealtimeSession() {
    try {
      setError(null);
      
      // Get token from API
      const tokenRes = await fetch('/api/realtime/token');
      const tokenData = await tokenRes.json();
      
      if (!tokenData.token) {
        throw new Error('Failed to get API token');
      }
      
      // Connect to OpenAI Realtime API
      const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
        headers: {
          'Authorization': `Bearer ${tokenData.token}`,
        },
      } as any);
      
      wsRef.current = ws;
      
      ws.onopen = () => {
        setIsConnected(true);
        // Send session configuration
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: `You are MidSet Coach, an expert Super Smash Bros. Melee coach. The player is playing ${userCharacter || 'their character'} against ${opponentCharacter || 'an opponent'}. Provide real-time coaching advice based on their gameplay.`,
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1',
            },
          },
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'response.audio.delta') {
          // Handle audio response
          // This would require audio buffer handling
        } else if (data.type === 'response.audio_transcript.delta') {
          // Handle transcript delta
          const transcript = data.delta;
          if (transcript) {
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'assistant') {
                return [...prev.slice(0, -1), { role: 'assistant', content: last.content + transcript }];
              }
              return [...prev, { role: 'assistant', content: transcript }];
            });
          }
        } else if (data.type === 'response.audio_transcript.done') {
          // Transcript complete
        } else if (data.type === 'input_audio_buffer.speech_started') {
          setIsListening(true);
        } else if (data.type === 'input_audio_buffer.speech_stopped') {
          setIsListening(false);
        } else if (data.type === 'error') {
          setError(data.error?.message || 'Unknown error');
        }
      };
      
      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection error. Falling back to Web Speech API.');
        setUseRealtime(false);
        startWebSpeechSession();
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setIsListening(false);
      };
      
      // Start audio capture
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        const audioContext = new AudioContext({ sampleRate: 24000 });
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const audioData = e.inputBuffer.getChannelData(0);
            const pcm16 = new Int16Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
              pcm16[i] = Math.max(-32768, Math.min(32767, audioData[i] * 32768));
            }
            
            ws.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: Array.from(pcm16),
            }));
            
            ws.send(JSON.stringify({
              type: 'input_audio_buffer.commit',
            }));
          }
        };
        
        source.connect(processor);
        processor.connect(audioContext.destination);
      } catch (audioErr) {
        console.error('Failed to start audio capture:', audioErr);
        setError('Failed to access microphone');
      }
      
    } catch (err: any) {
      console.error('Failed to start realtime session:', err);
      setError(err.message || 'Failed to start realtime session. Falling back to Web Speech API.');
      setUseRealtime(false);
      startWebSpeechSession();
    }
  }
  
  function startWebSpeechSession() {
    // Fallback to Web Speech API
    const Rec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!Rec) {
      setError('Speech recognition not supported');
      return;
    }
    
    const rec = new Rec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    
    rec.onresult = async (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(' ');
      
      if (e.results[e.results.length - 1].isFinal) {
        setMessages(prev => [...prev, { role: 'user', content: transcript }]);
        
        // Send to API for response
        const searchBody: any = { query: transcript, k: 5 };
        if (userCharacter && opponentCharacter) {
          searchBody.userCharacter = userCharacter;
          searchBody.opponentCharacter = opponentCharacter;
        }
        
        const ctxRes = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(searchBody),
        });
        const ctx = await ctxRes.json();
        const res = await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: transcript, context: ctx.results }),
        });
        const data = await res.json();
        const answer = data.answer || '(no response)';
        setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
        
        // Speak response
        const utterance = new SpeechSynthesisUtterance(answer);
        window.speechSynthesis.speak(utterance);
      }
    };
    
    rec.onerror = (err: any) => {
      console.error('Speech recognition error:', err);
      setError('Speech recognition error');
    };
    
    rec.start();
    setIsListening(true);
    setIsConnected(true);
  }
  
  function stopSession() {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsListening(false);
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{
        padding: 16,
        background: '#24283b',
        borderRadius: 12,
        border: '1px solid #3b4261',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <strong style={{ color: '#c0caf5', fontSize: 14, display: 'block', marginBottom: 4 }}>
            Realtime Voice Coach
          </strong>
          <span style={{ color: '#565f89', fontSize: 12 }}>
            {useRealtime ? 'Using OpenAI Realtime API' : 'Using Web Speech API (fallback)'}
          </span>
        </div>
        {!isConnected ? (
          <button
            onClick={startRealtimeSession}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              background: '#7aa2f7',
              color: '#1a1b26',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            🎤 Start Voice Session
          </button>
        ) : (
          <button
            onClick={stopSession}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              background: '#f7768e',
              color: '#1a1b26',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            ⏹ Stop Session
          </button>
        )}
      </div>
      
      {isListening && (
        <div style={{
          padding: 12,
          background: '#1a1b26',
          borderRadius: 8,
          border: '1px solid #3b4261',
          textAlign: 'center',
          color: '#9ece6a',
          fontSize: 14,
        }}>
          🎤 Listening...
        </div>
      )}
      
      {error && (
        <div style={{
          padding: 12,
          background: '#1a1b26',
          borderRadius: 8,
          border: '1px solid #f7768e',
          color: '#f7768e',
          fontSize: 12,
        }}>
          {error}
        </div>
      )}
      
      {messages.length > 0 && (
        <div style={{
          border: '1px solid #3b4261',
          borderRadius: 12,
          padding: 20,
          minHeight: 300,
          maxHeight: 500,
          overflow: 'auto',
          background: '#24283b',
        }}>
          {messages.map((m, i) => (
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
          ))}
        </div>
      )}
    </div>
  );
}

