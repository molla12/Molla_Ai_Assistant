import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Shield,
  BellRing,
  Mic,
  Camera,
  Layers,
  MapPin,
  BatteryCharging,
  HardDrive,
  PhoneCall,
  CheckCircle,
  AlertCircle,
  Accessibility,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadPermissionsConfig,
  savePermissionsConfig,
  MayaPermissionsConfig,
} from './mayaStorage';

interface MayaPermissionsDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaPermissionsDetailView: React.FC<MayaPermissionsDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaPermissionsConfig>(loadPermissionsConfig);
  const [notice, setNotice] = useState<string | null>(null);

  const toggle = (key: keyof MayaPermissionsConfig) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      savePermissionsConfig(next);
      return next;
    });
    setNotice('Permissions updated.');
    setTimeout(() => setNotice(null), 2000);
  };

  const activeCount = Object.values(config).filter(Boolean).length;
  const totalCount = Object.keys(config).length;

  const permissionsList = [
    {
      key: 'notificationAccess' as const,
      name: 'Notification Access',
      description: 'Required for WhatsApp auto-reply & notification reading',
      icon: BellRing,
      recommended: true,
    },
    {
      key: 'microphone' as const,
      name: 'Microphone',
      description: 'Real-time voice calls & wake word detection',
      icon: Mic,
      recommended: true,
    },
    {
      key: 'camera' as const,
      name: 'Camera',
      description: 'Live visual AI & Touch Guard intrusion photo',
      icon: Camera,
      recommended: true,
    },
    {
      key: 'accessibilityService' as const,
      name: 'Accessibility Service',
      description: 'Screen reading, automated typing, and UI interaction',
      icon: Accessibility,
      recommended: false,
    },
    {
      key: 'displayOverlay' as const,
      name: 'Display over other apps',
      description: 'Floating orb & edge glow display',
      icon: Layers,
      recommended: true,
    },
    {
      key: 'locationGps' as const,
      name: 'Location (GPS)',
      description: 'Geofence triggers, local weather, and place queries',
      icon: MapPin,
      recommended: true,
    },
    {
      key: 'batteryOptimization' as const,
      name: 'Ignore Battery Optimization',
      description: 'Keep Maya alive 24/7 in background without OS sleep',
      icon: BatteryCharging,
      recommended: true,
    },
    {
      key: 'storageMedia' as const,
      name: 'Storage & Media',
      description: 'Export backup archives & analyze photos',
      icon: HardDrive,
      recommended: true,
    },
    {
      key: 'phoneCallState' as const,
      name: 'Phone & Call State',
      description: 'Emergency SOS calling and caller name announcement',
      icon: PhoneCall,
      recommended: true,
    },
  ];

  const cardCls = `rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg transition-all ${
    isLight
      ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
      : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
  }`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none animate-in fade-in duration-200 backdrop-blur-3xl transition-colors ${
        isLight
          ? 'bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100/90 text-slate-800'
          : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* 1. Header */}
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
          Permissions
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

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-12 scrollbar-thin">
        {/* Overview Banner */}
        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
                }`}
              >
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2
                  className={`text-sm font-semibold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  App Permissions
                </h2>
                <p
                  className={`text-xs mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Manage system capabilities granted to Maya
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isLight
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}
            >
              {activeCount}/{totalCount} Active
            </span>
          </div>
        </div>

        {notice && (
          <div
            className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 animate-in fade-in backdrop-blur-xl ${
              isLight
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-800'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Permissions List */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl overflow-hidden shadow-lg divide-y transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 divide-slate-200/70 shadow-[0_8px_30px_rgba(15,23,42,0.06)]'
              : 'bg-[#0b1120]/75 border-white/12 divide-white/5 shadow-[0_12px_36px_rgba(0,0,0,0.35)]'
          }`}
        >
          {permissionsList.map((item) => {
            const Icon = item.icon;
            const isGranted = config[item.key];

            return (
              <div
                key={item.key}
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-4 transition-colors ${
                  isLight ? 'hover:bg-slate-50/60' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                      isGranted
                        ? isLight
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
                        : isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-400'
                        : 'bg-slate-800/60 border-white/5 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {item.name}
                      </span>
                      {isGranted ? (
                        <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" />
                          Granted
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-medium ${
                            isLight ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          Disabled
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 leading-relaxed ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isGranted}
                  onClick={() => toggle(item.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isGranted
                      ? 'bg-blue-600'
                      : isLight
                      ? 'bg-slate-300'
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isGranted ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <p
          className={`text-center text-xs pt-2 leading-relaxed ${
            isLight ? 'text-slate-500' : 'text-slate-500'
          }`}
        >
          Permissions can be toggled on demand without restarting Maya services.
        </p>
      </div>
    </div>
  );
};
