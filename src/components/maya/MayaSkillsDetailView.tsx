import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Sparkles,
  ShoppingBag,
  Lightbulb,
  Check,
  Plus,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadSkillsConfig,
  saveSkillsConfig,
  MayaSkillItem,
} from './mayaStorage';

interface MayaSkillsDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaSkillsDetailView: React.FC<MayaSkillsDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [activeTab, setActiveTab] = useState<'installed' | 'store'>('installed');
  const [skillsData, setSkillsData] = useState<{ installed: MayaSkillItem[]; store: MayaSkillItem[] }>(
    loadSkillsConfig
  );

  const toggleInstalledSkill = (id: string) => {
    setSkillsData((prev) => {
      const next = {
        ...prev,
        installed: prev.installed.map((item) =>
          item.id === id ? { ...item, enabled: !item.enabled } : item
        ),
      };
      saveSkillsConfig(next);
      return next;
    });
  };

  const installFromStore = (storeItem: MayaSkillItem) => {
    setSkillsData((prev) => {
      const alreadyInstalled = prev.installed.some((i) => i.id === storeItem.id);
      if (alreadyInstalled) return prev;
      const next = {
        installed: [...prev.installed, { ...storeItem, enabled: true, isStore: false }],
        store: prev.store.filter((i) => i.id !== storeItem.id),
      };
      saveSkillsConfig(next);
      return next;
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
      {/* Top App Bar with Frosted Glass */}
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
          Skills
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

      {/* Segmented Tab: Installed / Skill Store */}
      <div className="px-4 pt-3.5 pb-2 max-w-xl mx-auto w-full shrink-0">
        <div
          className={`grid grid-cols-2 gap-1.5 p-1 rounded-2xl border backdrop-blur-2xl transition-colors ${
            isLight
              ? 'bg-white/80 border-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.05)]'
              : 'bg-[#0b1120]/75 border-white/10 shadow-md'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('installed')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'installed'
                ? isLight
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Installed ({skillsData.installed.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'store'
                ? isLight
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Skill Store ({skillsData.store.length})
          </button>
        </div>
      </div>

      {/* Content list with Frosted Glass UI */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 max-w-xl mx-auto w-full overscroll-contain pb-16 scrollbar-thin">
        {activeTab === 'installed' ? (
          <>
            {skillsData.installed.map((skill) => (
              <div
                key={skill.id}
                className={`rounded-[22px] border backdrop-blur-2xl p-4 space-y-2.5 transition-all ${
                  isLight
                    ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
                    : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      isLight
                        ? 'text-blue-700 bg-blue-50 border-blue-200'
                        : 'text-blue-400 bg-blue-500/15 border-blue-500/25'
                    }`}
                  >
                    {skill.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleInstalledSkill(skill.id)}
                    className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                      skill.enabled ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700/60'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        skill.enabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {skill.description}
                </p>
              </div>
            ))}

            {/* Bottom Tip */}
            <div
              className={`flex items-start gap-2.5 p-3.5 rounded-2xl border backdrop-blur-xl text-xs ${
                isLight
                  ? 'bg-blue-50/80 border-blue-200/80 text-blue-900 shadow-xs'
                  : 'bg-blue-950/30 border-blue-500/25 text-blue-300'
              }`}
            >
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
              <span className="leading-relaxed">
                Skills teach Maya how to handle specific tasks. Installed skills are ready to use when
                needed.
              </span>
            </div>
          </>
        ) : (
          <>
            {skillsData.store.map((skill) => (
              <div
                key={skill.id}
                className={`rounded-[22px] border backdrop-blur-2xl p-4 space-y-2.5 transition-all ${
                  isLight
                    ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
                    : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      isLight
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25'
                    }`}
                  >
                    {skill.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => installFromStore(skill)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Install
                  </button>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {skill.description}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
