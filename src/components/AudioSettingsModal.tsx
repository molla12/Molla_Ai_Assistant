import React, { useState, useEffect } from 'react';
import { AudioSettings } from '../types';
import { Volume2, VolumeX, Sparkles, Mic, Settings, Sliders } from 'lucide-react';
import { speechController } from '../lib/speech';
import { soundEngine } from '../lib/soundEngine';

interface AudioSettingsModalProps {
  settings: AudioSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  settings,
  onClose,
  onUpdateSettings,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const v = speechController.getVoices();
    setVoices(v);

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoices(speechController.getVoices());
      };
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-6 border-2 border-amber-200 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 text-amber-950 font-extrabold">
            <Volume2 className="w-5 h-5 text-amber-600" />
            <h3>Read-Aloud & Audio Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-amber-950 block">Sound Effects</span>
              <span className="text-[11px] text-amber-700 block">Page flip chimes and magic sparkle sounds</span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEffectsEnabled}
              onChange={(e) => {
                onUpdateSettings({ soundEffectsEnabled: e.target.checked });
                soundEngine.setEnabled(e.target.checked);
                if (e.target.checked) soundEngine.playSparkle();
              }}
              className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              id="sound-effects-toggle"
            />
          </div>

          {/* Speech Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-950">
              <span>Reading Speed</span>
              <span className="text-amber-700">{settings.speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.1"
              value={settings.speechRate}
              onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
              id="speech-rate-slider"
            />
            <div className="flex justify-between text-[10px] text-amber-700 font-semibold">
              <span>0.7x (Slow Reader)</span>
              <span>1.0x (Normal)</span>
              <span>1.3x (Fast)</span>
            </div>
          </div>

          {/* Speech Pitch Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-950">
              <span>Voice Pitch Tone</span>
              <span className="text-amber-700">{settings.speechPitch}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.1"
              value={settings.speechPitch}
              onChange={(e) => onUpdateSettings({ speechPitch: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
              id="speech-pitch-slider"
            />
            <div className="flex justify-between text-[10px] text-amber-700 font-semibold">
              <span>Deep Storyteller</span>
              <span>Friendly</span>
              <span>High Whimsical</span>
            </div>
          </div>

          {/* Web Speech Voice Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-950 block">Select Voice Accent</label>
            <select
              value={settings.selectedVoiceURI}
              onChange={(e) => onUpdateSettings({ selectedVoiceURI: e.target.value })}
              className="w-full p-3 rounded-2xl border-2 border-amber-200 text-xs font-semibold focus:outline-none focus:border-amber-400 bg-white"
              id="voice-select-dropdown"
            >
              <option value="">Default System Voice</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Test Speech Button */}
          <button
            onClick={() => {
              speechController.speakText('Hello story explorer! I am ready to read your magic storybook aloud!', {
                rate: settings.speechRate,
                pitch: settings.speechPitch,
                voiceURI: settings.selectedVoiceURI,
              });
            }}
            className="w-full py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs flex items-center justify-center gap-2 border border-amber-300 transition-colors"
            id="test-voice-btn"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Test Voice Audio</span>
          </button>
        </div>

        <div className="pt-2 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-amber-500 text-white font-bold text-xs shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
