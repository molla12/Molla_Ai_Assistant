import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { AtmosphereConfig, TranscriptItem } from '../types';
import { Send } from 'lucide-react';

interface ChatBoxProps {
  aura: AtmosphereConfig;
  transcripts: TranscriptItem[];
  onSendMessage: (text: string) => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ aura, transcripts, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [transcripts]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col h-72 md:h-80 shadow-2xl w-full">
      {/* Transcript Log */}
      <div 
        ref={logRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10"
      >
        {transcripts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Conversation history will appear here...
          </div>
        ) : (
          transcripts.map((t, idx) => (
            <div key={idx} className={`flex flex-col ${t.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] uppercase font-mono text-slate-400 mb-1 opacity-70">
                {t.sender === 'user' ? 'You' : 'Molla'}
              </span>
              <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
                t.sender === 'user' 
                  ? 'bg-white/10 text-white rounded-tr-sm' 
                  : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-sm'
              }`} style={t.sender === 'molla' ? { borderColor: aura.accentColor + '30' } : {}}>
                <Markdown>{t.text}</Markdown>
                {t.isDelta && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-white/10 bg-black/50">
        <div className="flex items-center gap-2 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message or tip here..."
            className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            style={{ 
              borderColor: inputText.trim() ? aura.accentColor + '80' : undefined 
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`absolute right-2 p-1.5 rounded-lg transition-colors ${
              inputText.trim() ? 'text-white' : 'bg-transparent text-slate-500'
            }`}
            style={{
              backgroundColor: inputText.trim() ? aura.accentColor : undefined
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
