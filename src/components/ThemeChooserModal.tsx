import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: ThemeMode;
  onSelectMode: (mode: ThemeMode) => void;
  effectiveTheme?: 'light' | 'dark';
}

export const ThemeChooserModal: React.FC<ThemeChooserModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
  effectiveTheme = 'dark',
}) => {
  const [selected, setSelected] = useState<ThemeMode>(currentMode);
  const initialModeRef = useRef<ThemeMode>(currentMode);
  const isLight = effectiveTheme === 'light';

  useEffect(() => {
    if (isOpen) {
      setSelected(currentMode);
      initialModeRef.current = currentMode;
    }
  }, [isOpen, currentMode]);

  if (!isOpen) return null;

  const applyThemeMode = (mode: ThemeMode) => {
    try {
      localStorage.setItem('molla_theme_mode', mode);
    } catch {}

    const isSystemDark =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : true;
    const isDark = mode === 'system' ? isSystemDark : mode === 'dark';

    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    if (document.body) {
      document.body.dataset.theme = isDark ? 'dark' : 'light';
    }

    try {
      window.dispatchEvent(
        new CustomEvent('molla_theme_changed', {
          detail: { mode, effectiveTheme: isDark ? 'dark' : 'light' },
        })
      );
    } catch {}
  };

  const handleSelect = (mode: ThemeMode) => {
    setSelected(mode);
    initialModeRef.current = mode;
    onSelectMode(mode);
    applyThemeMode(mode);
  };

  const handleCancel = () => {
    // Keep whatever is currently selected and applied
    onSelectMode(selected);
    applyThemeMode(selected);
    onClose();
  };

  const handleConfirm = () => {
    onSelectMode(selected);
    applyThemeMode(selected);
    onClose();
  };

  const options: { id: ThemeMode; label: string; sublabel: string; icon: React.ReactNode }[] = [
    {
      id: 'system',
      label: 'System default',
      sublabel: 'Follows device system appearance',
      icon: <Laptop className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'light',
      label: 'Light',
      sublabel: 'Clean bright crystalline glass',
      icon: <Sun className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'dark',
      label: 'Dark',
      sublabel: 'Deep obsidian neon glow glass',
      icon: <Moon className="w-4 h-4 text-purple-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Dimmed backdrop with heavy glass blur */}
      <div
        id="theme-chooser-backdrop"
        onClick={handleCancel}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity cursor-pointer"
      />

      {/* Glass Dialog Container matching user screenshot */}
      <div
        className={`relative w-full max-w-[340px] rounded-[28px] p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 transition-all ${
          isLight ? 'glass-tile-light text-slate-900' : 'glass-tile text-white'
        }`}
      >
        {/* Specular curved glass top sheen */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-full pointer-events-none" />

        {/* Title */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3
              className={`text-lg font-bold tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Choose Theme
            </h3>
            <p className="text-[11px] text-slate-400">Select your preferred app appearance</p>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Glass UI
          </span>
        </div>

        {/* Radio options list */}
        <div className="space-y-2.5 mb-6">
          {options.map((opt) => {
            const isChecked = selected === opt.id;
            return (
              <label
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none group ${
                  isChecked
                    ? isLight
                      ? 'bg-emerald-50/80 border-emerald-500/60 shadow-sm'
                      : 'bg-white/10 border-emerald-400/50 shadow-[0_0_18px_rgba(16,185,129,0.25)]'
                    : isLight
                    ? 'bg-white/50 hover:bg-white/80 border-white/60'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                      isLight
                        ? 'bg-slate-100 border-slate-200'
                        : 'bg-white/10 border-white/15'
                    }`}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <span
                      className={`text-sm font-semibold block leading-tight ${
                        isLight ? 'text-slate-800' : 'text-slate-100'
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      {opt.sublabel}
                    </span>
                  </div>
                </div>

                {/* Custom radio button */}
                <div className="relative flex items-center justify-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                        : isLight
                        ? 'border-slate-300 group-hover:border-slate-400'
                        : 'border-white/30 group-hover:border-white/50'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Action Buttons: Cancel and OK in Glass UI pills */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            id="cancel-theme-btn"
            onClick={handleCancel}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-theme-btn"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
};
