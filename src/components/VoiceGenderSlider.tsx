import React, { useState, useEffect } from 'react';
import { VoiceOption, LanguageCode } from '../types';
import { Sparkles, User, Volume2, Check } from 'lucide-react';
import { speakMollaWithNaturalVoice, stopMollaNaturalAudio } from '../services/naturalSpeech';
import { audioCoordinator } from '../services/audioCoordinator';

interface VoiceGenderSliderProps {
  currentVoice: VoiceOption;
  onVoiceChange: (voice: VoiceOption) => void;
  accentColor?: string;
  currentLanguage?: LanguageCode;
  compact?: boolean;
  className?: string;
}

export const VoiceGenderSlider: React.FC<VoiceGenderSliderProps> = ({
  currentVoice,
  onVoiceChange,
  accentColor = '#f43f5e',
  currentLanguage = 'en',
  compact = false,
  className = '',
}) => {
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  // Sync sample playing state with global AudioCoordinator
  useEffect(() => {
    const unsub = audioCoordinator.subscribe((s) => {
      setIsPlayingSample(s.isPlaying && s.source === 'sample' && s.id === `sample_${currentVoice}`);
    });
    return unsub;
  }, [currentVoice]);

  // Check if active voice is female (default is ALWAYS female)
  const isFemale =
    currentVoice === 'Aoede' ||
    currentVoice === 'Kore' ||
    currentVoice === 'Zephyr';
  const isMale = !isFemale;

  const handleSelectGender = (gender: 'female' | 'male') => {
    audioCoordinator.stopAllAudio();
    setIsPlayingSample(false);

    if (gender === 'female') {
      onVoiceChange('Aoede');
    } else {
      onVoiceChange('Fenrir');
    }
  };

  const handlePlaySample = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const sampleId = `sample_${currentVoice}`;
    if (audioCoordinator.isPlaying() && audioCoordinator.getPlayingId() === sampleId) {
      audioCoordinator.stopAllAudio();
      return;
    }

    audioCoordinator.requestPlayback('sample', sampleId, 'Voice Sample', () => {
      stopMollaNaturalAudio();
    });

    const sampleText = isFemale
      ? 'Hello! I am Molla, your charming AI companion speaking in a sweet, natural voice.'
      : 'Hello friend! I am Molla, your confident AI companion ready to assist you.';

    try {
      await speakMollaWithNaturalVoice(
        sampleText,
        currentVoice,
        {
          onStart: () => {},
          onEnd: () => {
            audioCoordinator.playbackFinished('sample', sampleId);
          },
        },
        currentLanguage
      );
    } catch {
      audioCoordinator.playbackFinished('sample', sampleId);
    }
  };

  if (compact) {
    return (
      <div
        id="molla-voice-gender-slider-compact"
        className={`relative inline-flex items-center p-1 bg-black/50 rounded-xl border border-white/10 ${className}`}
      >
        {/* Animated Sliding Indicator */}
        <div
          className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out shadow-md pointer-events-none"
          style={{
            width: 'calc(50% - 4px)',
            left: isFemale ? '4px' : 'calc(50%)',
            backgroundColor: isFemale
              ? 'rgba(244, 63, 94, 0.3)'
              : 'rgba(59, 130, 246, 0.3)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: isFemale ? '#f43f5e' : '#3b82f6',
            boxShadow: isFemale
              ? '0 0 12px rgba(244, 63, 94, 0.4)'
              : '0 0 12px rgba(59, 130, 246, 0.4)',
          }}
        />

        <button
          type="button"
          onClick={() => handleSelectGender('female')}
          className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isFemale ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Female Voice (Default)"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isFemale ? 'text-rose-400' : 'text-slate-500'}`} />
          <span>Female</span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-500/25 text-rose-300 font-bold">
            Default
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectGender('male')}
          className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isMale ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Male Voice"
        >
          <User className={`w-3.5 h-3.5 ${isMale ? 'text-blue-400' : 'text-slate-500'}`} />
          <span>Male</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="molla-voice-gender-slider"
      className={`rounded-2xl border border-white/10 bg-[#0c101d]/90 backdrop-blur-md p-3 shadow-xl ${className}`}
    >
      {/* Top Label & Status */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center border"
            style={{
              borderColor: `${accentColor}55`,
              backgroundColor: `${accentColor}20`,
            }}
          >
            <Volume2 className="w-3.5 h-3.5" style={{ color: accentColor }} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display">
              Voice Selection
            </span>
            <p className="text-[10px] text-slate-400">Choose voice tone for live conversations</p>
          </div>
        </div>

        {/* Play Sample Button */}
        <button
          type="button"
          onClick={handlePlaySample}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all ${
            isPlayingSample
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          title="Listen to sample audio"
        >
          <Volume2 className="w-3 h-3" />
          <span>{isPlayingSample ? 'Playing...' : 'Test Voice'}</span>
        </button>
      </div>

      {/* Sliding Segmented Container */}
      <div className="relative p-1 bg-black/50 rounded-xl border border-white/10 flex items-center">
        {/* Animated Sliding Background Indicator */}
        <div
          className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out shadow-lg pointer-events-none"
          style={{
            width: 'calc(50% - 4px)',
            left: isFemale ? '4px' : 'calc(50%)',
            backgroundColor: isFemale
              ? 'rgba(244, 63, 94, 0.28)'
              : 'rgba(59, 130, 246, 0.28)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: isFemale ? '#f43f5e' : '#3b82f6',
            boxShadow: isFemale
              ? '0 0 16px rgba(244, 63, 94, 0.35)'
              : '0 0 16px rgba(59, 130, 246, 0.35)',
          }}
        />

        {/* Option 1: Female Voice (Default) */}
        <button
          type="button"
          id="select-voice-female-btn"
          onClick={() => handleSelectGender('female')}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-2.5 rounded-lg transition-colors text-center ${
            isFemale ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles
            className={`w-4 h-4 shrink-0 transition-transform ${
              isFemale ? 'text-rose-400 scale-110' : 'text-slate-500'
            }`}
          />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              Female Voice
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30">
                Default
              </span>
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Sweet & Natural (Aoede)
            </span>
          </div>
          {isFemale && <Check className="w-4 h-4 text-rose-400 ml-auto hidden sm:block" />}
        </button>

        {/* Option 2: Male Voice */}
        <button
          type="button"
          id="select-voice-male-btn"
          onClick={() => handleSelectGender('male')}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-2.5 rounded-lg transition-colors text-center ${
            isMale ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User
            className={`w-4 h-4 shrink-0 transition-transform ${
              isMale ? 'text-blue-400 scale-110' : 'text-slate-500'
            }`}
          />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              Male Voice
              {isMale && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 font-bold border border-blue-500/30">
                  Active
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Deep & Confident (Fenrir)
            </span>
          </div>
          {isMale && <Check className="w-4 h-4 text-blue-400 ml-auto hidden sm:block" />}
        </button>
      </div>

      {/* Informational Footer Bar */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>
          Active Voice:{' '}
          <strong className={isFemale ? 'text-rose-400' : 'text-blue-400'}>
            {isFemale ? 'Female Voice (Aoede - Default)' : 'Male Voice (Fenrir)'}
          </strong>
        </span>
        <span className="text-[10px] text-slate-500">Applies to live calls and chat audio</span>
      </div>
    </div>
  );
};
