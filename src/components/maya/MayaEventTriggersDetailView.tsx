import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  BatteryCharging,
  MessageSquare,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  Play,
  CheckCircle,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadEventTriggersConfig,
  saveEventTriggersConfig,
  MayaEventTriggersConfig,
} from './mayaStorage';

interface MayaEventTriggersDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  onOpenWhatsAppAutoReply?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaEventTriggersDetailView: React.FC<MayaEventTriggersDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  onOpenWhatsAppAutoReply,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaEventTriggersConfig>(loadEventTriggersConfig);
  const [simulatedTrigger, setSimulatedTrigger] = useState<string | null>(null);

  const toggle = (key: keyof MayaEventTriggersConfig) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveEventTriggersConfig(next);
      return next;
    });
  };

  const handleSimulate = (triggerName: string) => {
    setSimulatedTrigger(`Trigger fired: "${triggerName}" → Maya automated task running in background.`);
    setTimeout(() => {
      setSimulatedTrigger(null);
    }, 3500);
  };

  const cardCls = `rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg space-y-3.5 transition-all ${
    isLight
      ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
      : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
  }`;

  const innerGroupCls = `rounded-2xl border divide-y transition-colors ${
    isLight
      ? 'bg-slate-50/80 border-slate-200/80 divide-slate-200/70'
      : 'bg-[#0a101d] border-white/5 divide-white/5'
  }`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none animate-in fade-in duration-200 backdrop-blur-3xl transition-colors ${
        isLight
          ? 'bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100/90 text-slate-800'
          : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* 1. Top Bar */}
      <header
        className={`relative z-20 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between border-b backdrop-blur-2xl shrink-0 transition-colors ${
          isLight
            ? 'bg-white/80 border-slate-200/80 shadow-xs'
            : 'bg-[#090e1b]/80 border-white/10 shadow-lg'
        }`}
      >
        <button
          type="button"
          onClick={onBack}
          className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
            isLight
              ? 'bg-white/90 hover:bg-white text-slate-700 border-slate-200 shadow-xs'
              : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
          }`}
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1
          className={`text-base font-bold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Event triggers
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNotifications}
            className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
              isLight
                ? 'bg-white/90 hover:bg-white text-slate-700 border-slate-200 shadow-xs'
                : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          </button>
          <MayaAvatar size="sm" onClick={onBack} />
        </div>
      </header>

      {/* Toast Feedback */}
      {simulatedTrigger && (
        <div className="px-4 pt-3 max-w-xl mx-auto w-full">
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 flex items-center gap-2.5 text-emerald-500 text-xs shadow-lg animate-in slide-in-from-top duration-200">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium flex-1">{simulatedTrigger}</span>
          </div>
        </div>
      )}

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-12 scrollbar-thin">
        {/* Intro banner */}
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-3 backdrop-blur-xl ${
            isLight
              ? 'bg-blue-50/80 border-blue-200 text-slate-700'
              : 'bg-blue-500/10 border-blue-500/20 text-slate-300'
          }`}
        >
          <Sparkles
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              isLight ? 'text-blue-600' : 'text-blue-400'
            }`}
          />
          <div>
            <h2
              className={`text-xs font-semibold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Automate tasks when events happen
            </h2>
            <p
              className={`text-[11px] mt-0.5 leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Maya wakes in the background and runs your customized routines whenever these system triggers occur.
            </p>
          </div>
        </div>

        {/* CARD 1: Hardware and battery */}
        <div className={cardCls}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <BatteryCharging className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Hardware and battery
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Screen, charger and battery events
              </p>
            </div>
          </div>

          <div className={innerGroupCls}>
            {/* Screen turns on */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Screen turns on
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Wake Maya when display powers up
                </span>
              </div>
              <div className="flex items-center gap-2">
                {config.screenTurnsOn && (
                  <button
                    type="button"
                    onClick={() => handleSimulate('Screen turns on')}
                    className={`p-1.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                    title="Test trigger"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.screenTurnsOn}
                  onClick={() => toggle('screenTurnsOn')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.screenTurnsOn
                      ? 'bg-blue-600'
                      : isLight
                      ? 'bg-slate-300'
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      config.screenTurnsOn ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Screen unlocks */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Screen unlocks
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Run morning greeting or briefing when unlocked
                </span>
              </div>
              <div className="flex items-center gap-2">
                {config.screenUnlocks && (
                  <button
                    type="button"
                    onClick={() => handleSimulate('Screen unlocks')}
                    className={`p-1.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                    title="Test trigger"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.screenUnlocks}
                  onClick={() => toggle('screenUnlocks')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.screenUnlocks
                      ? 'bg-blue-600'
                      : isLight
                      ? 'bg-slate-300'
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      config.screenUnlocks ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Charger connected */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Charger connected
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Start ambient charging display or nighttime standby
                </span>
              </div>
              <div className="flex items-center gap-2">
                {config.chargerConnected && (
                  <button
                    type="button"
                    onClick={() => handleSimulate('Charger connected')}
                    className={`p-1.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                    title="Test trigger"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.chargerConnected}
                  onClick={() => toggle('chargerConnected')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.chargerConnected
                      ? 'bg-blue-600'
                      : isLight
                      ? 'bg-slate-300'
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      config.chargerConnected ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Charger disconnected */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Charger disconnected
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Alert if cable is unplugged without authorization
                </span>
              </div>
              <div className="flex items-center gap-2">
                {config.chargerDisconnected && (
                  <button
                    type="button"
                    onClick={() => handleSimulate('Charger disconnected')}
                    className={`p-1.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                    title="Test trigger"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.chargerDisconnected}
                  onClick={() => toggle('chargerDisconnected')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.chargerDisconnected
                      ? 'bg-blue-600'
                      : isLight
                      ? 'bg-slate-300'
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      config.chargerDisconnected ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Battery low (<= 20%) */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Battery low (&le; 20%)
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Voice reminder to plug in phone and conserve background power
                </span>
              </div>
              <div className="flex items-center gap-2">
                {config.batteryLow && (
                  <button
                    type="button"
                    onClick={() => handleSimulate('Battery low')}
                    className={`p-1.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                    title="Test trigger"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.batteryLow}
                  onClick={() => toggle('batteryLow')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.batteryLow
                      ? 'bg-blue-600'
                      : isLight
                      ? 'bg-slate-300'
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      config.batteryLow ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Communications */}
        <div className={cardCls}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Communications
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Automated messaging and phone triggers
              </p>
            </div>
          </div>

          <div className={innerGroupCls}>
            {/* WhatsApp message */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div
                className="flex-1 cursor-pointer group"
                onClick={onOpenWhatsAppAutoReply}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-semibold transition-colors ${
                      isLight
                        ? 'text-slate-900 group-hover:text-blue-600'
                        : 'text-white group-hover:text-blue-300'
                    }`}
                  >
                    WhatsApp message
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-colors ${
                      isLight
                        ? 'text-slate-400 group-hover:text-slate-700'
                        : 'text-slate-500 group-hover:text-white'
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Auto-reply or summarize unread messages
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.whatsAppMessage}
                  onClick={() => toggle('whatsAppMessage')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.whatsAppMessage
                      ? 'bg-blue-600'
                      : isLight
                      ? 'bg-slate-300'
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      config.whatsAppMessage ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Incoming phone call */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Incoming phone call
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Announce caller name using voice synthesis
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.incomingCall}
                onClick={() => toggle('incomingCall')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.incomingCall
                    ? 'bg-blue-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.incomingCall ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: Time and routine */}
        <div className={cardCls}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Time and routine
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Scheduled intervals and regular daily events
              </p>
            </div>
          </div>

          <div className={innerGroupCls}>
            {/* Every 1 hour */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Every 1 hour
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Water intake reminder and posture check
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.hourlyTrigger}
                onClick={() => toggle('hourlyTrigger')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.hourlyTrigger
                    ? 'bg-blue-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.hourlyTrigger ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Daily at 9:00 AM */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Daily at 9:00 AM
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Morning briefing: Weather, news highlights &amp; tasks
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.dailyMorning}
                onClick={() => toggle('dailyMorning')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.dailyMorning
                    ? 'bg-blue-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.dailyMorning ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Night routine (11:00 PM) */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Night routine (11:00 PM)
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Wind down music, silent notifications &amp; alarm check
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.nightRoutine}
                onClick={() => toggle('nightRoutine')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.nightRoutine
                    ? 'bg-blue-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.nightRoutine ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 4: Geofence (GPS) */}
        <div className={cardCls}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-cyan-50 border-cyan-200 text-cyan-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Geofence (GPS)
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Location-based triggers
              </p>
            </div>
          </div>

          <div className={innerGroupCls}>
            {/* Arrive at Home */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Arrive at Home
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Welcome home greeting and connect to home Wi-Fi
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.arriveHome}
                onClick={() => toggle('arriveHome')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.arriveHome
                    ? 'bg-blue-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.arriveHome ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Leave Home */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Leave Home
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Arm Touch Guard and remind if keys/wallet are forgotten
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.leaveHome}
                onClick={() => toggle('leaveHome')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.leaveHome
                    ? 'bg-blue-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.leaveHome ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p
          className={`text-center text-xs pt-1 ${
            isLight ? 'text-slate-500' : 'text-slate-500'
          }`}
        >
          Tap any trigger to configure its automated action and prompts.
        </p>
      </div>
    </div>
  );
};
