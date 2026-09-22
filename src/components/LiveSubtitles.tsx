import React, { useEffect, useRef } from 'react';
import { TranscriptItem, AtmosphereConfig } from '../types';

interface LiveSubtitlesProps {
  aura: AtmosphereConfig;
  transcripts: TranscriptItem[];
}

export const LiveSubtitles: React.FC<LiveSubtitlesProps> = ({
  aura,
  transcripts,
}) => {
  const textScrollRef = useRef<HTMLDivElement | null>(null);
  const latestItem = transcripts.length > 0 ? transcripts[transcripts.length - 1] : null;

  useEffect(() => {
    if (textScrollRef.current) {
      textScrollRef.current.scrollTop = textScrollRef.current.scrollHeight;
    }
  }, [latestItem?.text]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 z-20">
      <div
        className="rounded-2xl sm:rounded-3xl border backdrop-blur-xl bg-[#0b0d17]/85 px-5 py-4 shadow-2xl transition-all duration-300 flex flex-col justify-center select-text h-[100px] sm:h-[110px]"
        style={{
          borderColor: 'rgba(244, 63, 94, 0.22)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {!latestItem ? (
          <p className="text-center text-xs sm:text-[13px] text-slate-400/90 italic font-normal tracking-wide px-2 leading-relaxed">
            Start talking or listening, real-time captions will appear here...
          </p>
        ) : (
          <div className="flex flex-col h-full min-h-0 justify-center">
            <div className="flex items-center justify-between mb-1 shrink-0">
              <span
                className="text-[10px] font-bold uppercase tracking-wider font-mono"
                style={{
                  color:
                    latestItem.sender === 'molla'
                      ? aura.accentColor
                      : '#38bdf8',
                }}
              >
                {latestItem.sender === 'molla' ? 'Molla' : 'You'}
              </span>
              <span className="text-[9px] text-slate-500 font-mono">Live Captions</span>
            </div>
            <div
              ref={textScrollRef}
              className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-1 min-h-0"
            >
              <p className="text-xs sm:text-[13px] text-white font-medium leading-relaxed">
                {latestItem.text}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
