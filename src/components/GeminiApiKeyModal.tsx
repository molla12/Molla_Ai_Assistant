import React, { useState, useEffect, useRef } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clipboard,
  Check,
  ExternalLink,
  X,
  Sparkles,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { getStoredGeminiApiKey, saveStoredGeminiApiKey } from './maya/mayaStorage';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: (apiKey: string) => void;
  effectiveTheme?: 'light' | 'dark';
}

export const GeminiApiKeyModal: React.FC<GeminiApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [currentServerStatus, setCurrentServerStatus] = useState<{ hasKey: boolean; maskedKey?: string } | null>(null);
  const [hasPasted, setHasPasted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Load stored key
    const localKey = getStoredGeminiApiKey();
    if (localKey) {
      setApiKey(localKey);
    }

    // Check server status
    fetch('/api/config/gemini-key')
      .then((res) => res.json())
      .then((data) => {
        setCurrentServerStatus(data);
        if (!localKey && data.hasKey) {
          // Server already has an environment key
        }
      })
      .catch((err) => console.warn('Could not check server API key status:', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePaste = async () => {
    // 1. Try standard async clipboard API
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setApiKey(text.trim());
          setTestResult({
            success: true,
            message: 'API Key successfully pasted from clipboard!',
          });
          setHasPasted(true);
          setTimeout(() => setHasPasted(false), 2500);
          return;
        }
      }
    } catch (err) {
      console.warn('Direct clipboard reading restricted by browser sandbox/iframe, trying fallback:', err);
    }

    // 2. Iframe / sandbox security fallback: prompt dialog where user can paste
    try {
      const promptValue = window.prompt(
        'Paste your Google Gemini API Key here (press Ctrl+V or Cmd+V, then press OK):',
        apiKey || ''
      );
      if (promptValue !== null && promptValue.trim()) {
        setApiKey(promptValue.trim());
        setTestResult({
          success: true,
          message: 'API Key entered successfully!',
        });
        setHasPasted(true);
        setTimeout(() => setHasPasted(false), 2500);
        return;
      }
    } catch (e) {
      console.warn('Prompt fallback error:', e);
    }

    // 3. Focus fallback: focus and select the input box directly so user can press Ctrl+V / Cmd+V
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
    setTestResult({
      success: false,
      message: 'Browser restricted direct clipboard access. We focused the input box—please press Ctrl+V (or tap and hold) to paste directly!',
    });
  };

  const handleTestKey = async () => {
    const keyToTest = apiKey.trim();
    if (!keyToTest) {
      setTestResult({ success: false, message: 'Please enter a valid API Key first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/config/test-gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToTest }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: 'Excellent! API Key is verified and working. Real-time live voice ready!',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Could not verify API Key. Please make sure the key is valid.',
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: 'Could not connect to the server. Please try again.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      setTestResult({
        success: false,
        message: 'Please enter or paste an API Key.',
      });
      return;
    }

    setIsSaving(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/config/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: cleanKey }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        saveStoredGeminiApiKey(cleanKey);
        setCurrentServerStatus({ hasKey: true, maskedKey: `${cleanKey.slice(0, 4)}...${cleanKey.slice(-4)}` });
        setTestResult({
          success: true,
          message: 'Successfully saved! Real-time natural voice is active.',
        });
        onKeySaved?.(cleanKey);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to save key. Please try again.',
        });
      }
    } catch {
      // Still save locally so it can be passed via WS
      saveStoredGeminiApiKey(cleanKey);
      setTestResult({
        success: true,
        message: 'Saved to local storage.',
      });
      onKeySaved?.(cleanKey);
      setTimeout(() => {
        onClose();
      }, 1200);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        className={`relative z-10 w-full max-w-lg rounded-[28px] border p-5 sm:p-6 shadow-2xl backdrop-blur-2xl transition-all max-h-[90vh] overflow-y-auto ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
            : 'bg-[#090e1b]/95 border-white/15 text-white shadow-[0_25px_70px_rgba(0,0,0,0.6)]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 text-white">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Google Gemini API Key
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold uppercase tracking-wider border border-blue-500/30">
                  Real-Time
                </span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Enable natural human voice & real-time live conversations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer active:scale-95 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-white/10 hover:bg-white/15 text-slate-300 border-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current status notice */}
        {currentServerStatus?.hasKey && (
          <div
            className={`mb-4 p-3 rounded-2xl border flex items-center gap-3 text-xs ${
              isLight
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Server Status: </span>
              <span>API Key is active ({currentServerStatus.maskedKey || 'Configured'})</span>
            </div>
          </div>
        )}

        {/* Informational Guidance Box */}
        <div
          className={`p-3.5 rounded-2xl border mb-4 text-xs leading-relaxed ${
            isLight
              ? 'bg-blue-50/70 border-blue-200 text-blue-950'
              : 'bg-blue-950/30 border-blue-500/20 text-blue-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Natural human voice — expressive & fluent speech!</p>
              <p className="text-[11px] opacity-90">
                Powered by Google AI Studio <strong>Gemini 3.8 Live</strong> and <strong>Gemini TTS</strong> models for human-like, responsive conversation. Enter your API Key below.
              </p>
            </div>
          </div>
        </div>

        {/* Input Field with Actions */}
        <div className="space-y-3 mb-5">
          <label className={`block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Your Gemini API Key
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="AIzaSy..."
              className={`w-full pl-3.5 pr-24 py-3 rounded-xl border text-xs sm:text-sm font-mono transition-all focus:outline-none focus:border-blue-500 ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                  : 'bg-[#060a14] border-white/15 text-white placeholder:text-slate-500 focus:border-blue-500/70'
              }`}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                id="gemini-paste-key-btn"
                type="button"
                onClick={handlePaste}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handlePaste();
                }}
                title={hasPasted ? 'Pasted!' : 'Paste from clipboard'}
                className={`p-1.5 rounded-lg border text-[11px] font-sans flex items-center gap-1 transition-all cursor-pointer active:scale-95 touch-manipulation select-none ${
                  hasPasted
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : isLight
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/10'
                }`}
              >
                {hasPasted ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="hidden sm:inline text-emerald-400 font-semibold">Pasted!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3 h-3" />
                    <span className="hidden sm:inline">Paste</span>
                  </>
                )}
              </button>
              <button
                id="gemini-toggle-key-visibility-btn"
                type="button"
                onClick={() => setShowKey(!showKey)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  setShowKey((prev) => !prev);
                }}
                title={showKey ? 'Hide key' : 'Show key'}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer active:scale-95 touch-manipulation select-none ${
                  isLight
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/10'
                }`}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-3 rounded-2xl border mb-4 text-xs flex items-start gap-2.5 animate-in fade-in ${
              testResult.success
                ? isLight
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300'
                : isLight
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-rose-500/15 border-rose-500/25 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed">{testResult.message}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 mb-4">
          <button
            id="gemini-test-key-btn"
            type="button"
            onClick={handleTestKey}
            disabled={isTesting || !apiKey.trim()}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 touch-manipulation disabled:opacity-40 disabled:pointer-events-none ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
            }`}
          >
            {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Test Key</span>
          </button>

          <button
            id="gemini-save-key-btn"
            type="button"
            onClick={handleSave}
            disabled={isSaving || !apiKey.trim()}
            className="w-full sm:flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95 touch-manipulation disabled:opacity-40 disabled:pointer-events-none"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Save & Activate</span>
          </button>
        </div>

        {/* Link to get key */}
        <div
          className={`pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs ${
            isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-slate-400'
          }`}
        >
          <span>Need an API Key? Get one free:</span>
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 hover:underline"
          >
            Get Google AI Studio Key
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
