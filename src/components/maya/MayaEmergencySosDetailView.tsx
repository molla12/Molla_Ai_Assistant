import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  UserPlus,
  Plus,
  Trash2,
  Phone,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadEmergencySosConfig,
  saveEmergencySosConfig,
  MayaEmergencySosConfig,
} from './mayaStorage';

interface MayaEmergencySosDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

const COUNTRY_CODES = [
  '🇮🇳 India (+91)',
  '🇧🇩 Bangladesh (+880)',
  '🇺🇸 United States (+1)',
  '🇬🇧 United Kingdom (+44)',
  '🇦🇪 UAE (+971)',
  '🇸🇦 Saudi Arabia (+966)',
  '🇨🇦 Canada (+1)',
  '🇦🇺 Australia (+61)',
];

export const MayaEmergencySosDetailView: React.FC<
  MayaEmergencySosDetailViewProps
> = ({ onBack, onOpenNotifications, effectiveTheme = 'dark' }) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaEmergencySosConfig>(
    loadEmergencySosConfig
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  const update = (partial: Partial<MayaEmergencySosConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveEmergencySosConfig(next);
      return next;
    });
  };

  const addManualContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) return;
    update({
      contacts: [
        ...config.contacts,
        {
          id: Date.now().toString(),
          name: manualName.trim(),
          phone: manualPhone.trim(),
        },
      ],
    });
    setManualName('');
    setManualPhone('');
    setShowManualAdd(false);
  };

  const removeContact = (id: string) => {
    update({
      contacts: config.contacts.filter((c) => c.id !== id),
    });
  };

  const importFromMockContacts = () => {
    // Add default emergency contacts
    const sample = [
      { id: Date.now().toString(), name: 'Home Emergency', phone: '112' },
      { id: (Date.now() + 1).toString(), name: 'Family Contact', phone: '+91 98765 00000' },
    ];
    update({
      contacts: [...config.contacts, ...sample],
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none animate-in fade-in duration-200 backdrop-blur-3xl transition-colors ${
        isLight
          ? 'bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100/90 text-slate-800'
          : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* 1. Header Bar with Frosted Glass */}
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
          className={`p-2 rounded-xl transition-colors cursor-pointer active:scale-95 border ${
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
          Emergency SOS
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNotifications}
            className={`p-2 rounded-xl transition-colors cursor-pointer relative border ${
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

      {/* 2. Scrollable Body Container with Frosted Glass UI */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16 scrollbar-thin">
        {/* Card 1: Country code with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg space-y-2 relative transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <h2
            className={`text-sm font-semibold ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Country code
          </h2>

          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className={`w-full px-4 py-3 rounded-2xl border text-sm flex items-center justify-between transition-colors cursor-pointer backdrop-blur-xl ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                : 'bg-[#090e1b] border-white/10 text-white hover:border-white/20'
            }`}
          >
            <span className="font-medium">{config.countryCode}</span>
            <ChevronDown
              className={`w-4 h-4 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            />
          </button>

          {showDropdown && (
            <div
              className={`absolute top-full left-4 right-4 mt-1 border rounded-2xl shadow-2xl z-30 overflow-hidden divide-y backdrop-blur-3xl max-h-60 overflow-y-auto scrollbar-thin ${
                isLight
                  ? 'bg-white/95 border-slate-200 divide-slate-100'
                  : 'bg-[#0f172a]/95 border-white/10 divide-white/5'
              }`}
            >
              {COUNTRY_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    update({ countryCode: code });
                    setShowDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-xs font-medium transition-colors flex items-center justify-between ${
                    isLight
                      ? 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                      : 'text-slate-200 hover:bg-blue-600/20 hover:text-white'
                  }`}
                >
                  <span>{code}</span>
                  {config.countryCode === code && (
                    <span className="text-blue-500 font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: Favorite & SOS contacts with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg space-y-3 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <h2
            className={`text-sm font-semibold ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Favorite & SOS contacts
          </h2>

          {config.contacts.length === 0 ? (
            <p
              className={`text-xs ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              No contacts added yet.
            </p>
          ) : (
            <div className="space-y-2">
              {config.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between backdrop-blur-xl ${
                    isLight
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-[#090e1b] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isLight
                          ? 'bg-rose-100 text-rose-600 border border-rose-200'
                          : 'bg-red-500/20 text-rose-400 border border-red-500/30'
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span
                        className={`text-xs font-bold block ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {contact.name}
                      </span>
                      <span
                        className={`text-[11px] font-mono ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {contact.phone}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeContact(contact.id)}
                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showManualAdd && (
            <form
              onSubmit={addManualContact}
              className={`p-3.5 rounded-2xl border space-y-2.5 animate-in fade-in ${
                isLight
                  ? 'bg-white border-blue-200 shadow-md'
                  : 'bg-[#090e1b] border-blue-500/30'
              }`}
            >
              <input
                type="text"
                placeholder="Contact Name (e.g. Mom)"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-[#0e1628] border-white/10 text-white'
                }`}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number (e.g. +91 98765 43210)"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-blue-500 font-mono ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-[#0e1628] border-white/10 text-white'
                }`}
                required
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer active:scale-95"
                >
                  Save contact
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualAdd(false)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center gap-4 pt-1 flex-wrap">
            <button
              type="button"
              onClick={importFromMockContacts}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>From contacts</span>
            </button>

            <button
              type="button"
              onClick={() => setShowManualAdd(!showManualAdd)}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Type manually</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
