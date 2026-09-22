import React, { useEffect, useState } from 'react';
import { ToolCallData, AuraConfig } from '../types';
import { ExternalLink, Search, Palette, Clock, CheckCircle2, X } from 'lucide-react';

interface ToolActionToastProps {
  toolCalls: ToolCallData[];
  aura: AuraConfig;
  onClear: () => void;
}

export const ToolActionToast: React.FC<ToolActionToastProps> = ({
  toolCalls,
  aura,
  onClear,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toolCalls.length > 0) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [toolCalls]);

  if (!visible || toolCalls.length === 0) {
    return null;
  }

  const latestCall = toolCalls[toolCalls.length - 1];

  const getToolIcon = () => {
    switch (latestCall.name) {
      case 'openWebsite':
        return <ExternalLink className="w-4 h-4 text-cyan-400" />;
      case 'searchWeb':
        return <Search className="w-4 h-4 text-emerald-400" />;
      case 'changeAtmosphere':
      case 'setThemeAura':
        return <Palette className="w-4 h-4 text-pink-400" />;
      case 'getCurrentTime':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTitle = () => {
    switch (latestCall.name) {
      case 'openWebsite':
        return `Opened ${latestCall.args?.name || 'Website'}`;
      case 'searchWeb':
        return `Searched: "${latestCall.args?.query}"`;
      case 'changeAtmosphere':
      case 'setThemeAura':
        return `Atmosphere switched to ${latestCall.args?.theme || latestCall.args?.mood}`;
      case 'getCurrentTime':
        return `Local Time: ${latestCall.result?.time || 'Current Time'}`;
      default:
        return `Action: ${latestCall.name}`;
    }
  };

  const url =
    latestCall.name === 'openWebsite'
      ? latestCall.result?.url || latestCall.args?.url
      : latestCall.name === 'searchWeb'
      ? latestCall.result?.url
      : null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className="p-3.5 rounded-2xl border backdrop-blur-xl bg-[#0e121d]/90 shadow-2xl flex items-center justify-between gap-3"
        style={{ borderColor: aura.accentColor + '55' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            {getToolIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                Action Executed
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5">
              {getTitle()}
            </p>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] underline hover:text-white transition-colors mt-0.5"
                style={{ color: aura.particleColor }}
              >
                Launch destination <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>

        <button
          id="close-tool-toast-btn"
          onClick={() => {
            setVisible(false);
            onClear();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
