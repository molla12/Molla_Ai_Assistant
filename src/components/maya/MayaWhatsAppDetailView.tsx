import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Users,
  Plus,
  Trash2,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadWhatsAppConfig,
  saveWhatsAppConfig,
  MayaWhatsAppConfig,
} from './mayaStorage';

interface MayaWhatsAppDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaWhatsAppDetailView: React.FC<MayaWhatsAppDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaWhatsAppConfig>(loadWhatsAppConfig);
  const [newGroup, setNewGroup] = useState('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportTemplate, setNewReportTemplate] = useState('');
  const [isAddingReport, setIsAddingReport] = useState(false);

  const update = (partial: Partial<MayaWhatsAppConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveWhatsAppConfig(next);
      return next;
    });
  };

  const addGroup = () => {
    if (!newGroup.trim()) return;
    update({ groups: [...config.groups, newGroup.trim()] });
    setNewGroup('');
    setIsAddingGroup(false);
  };

  const removeGroup = (idx: number) => {
    update({ groups: config.groups.filter((_, i) => i !== idx) });
  };

  const addReportFormat = () => {
    if (!newReportTitle.trim()) return;
    update({
      reportFormats: [
        ...config.reportFormats,
        {
          id: Date.now().toString(),
          title: newReportTitle.trim(),
          template: newReportTemplate.trim() || 'Daily Task Report:\n1. Done:\n2. Blockers:\n3. Tomorrow:',
        },
      ],
    });
    setNewReportTitle('');
    setNewReportTemplate('');
    setIsAddingReport(false);
  };

  const removeReport = (id: string) => {
    update({ reportFormats: config.reportFormats.filter((r) => r.id !== id) });
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
          WhatsApp groups & reports
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

      {/* Content matching Screenshot 5 with Frosted Glass UI */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16 scrollbar-thin">
        {/* Card 1: Groups with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-3.5 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                  isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
                }`}
              >
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2
                  className={`text-sm font-semibold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Groups
                </h2>
                <p
                  className={`text-xs ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Add the groups Maya can send reports to
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {config.groups.map((group, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-2xl border backdrop-blur-xl transition-all ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200/80 shadow-xs'
                    : 'bg-[#090e1b]/80 border-white/8'
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {group}
                </span>
                <button
                  type="button"
                  onClick={() => removeGroup(idx)}
                  className={`p-1.5 transition-colors cursor-pointer ${
                    isLight
                      ? 'text-slate-400 hover:text-red-500'
                      : 'text-slate-400 hover:text-red-400'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {isAddingGroup ? (
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 backdrop-blur-xl ${
                  isLight
                    ? 'bg-slate-50 border-blue-300 shadow-sm'
                    : 'bg-[#090e1b] border-blue-500/40 shadow-md'
                }`}
              >
                <input
                  type="text"
                  placeholder="Group Name (e.g. Sales Team, Project Delta)"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors focus:outline-none focus:border-blue-500 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                  }`}
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingGroup(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                      isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addGroup}
                    className="px-3.5 py-1.5 rounded-xl text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-xs active:scale-95"
                  >
                    Add Group
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingGroup(true)}
                className={`w-full py-2.5 px-3 rounded-2xl border border-dashed text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700'
                    : 'border-white/15 hover:border-blue-500/50 hover:bg-white/5 text-blue-400'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add group
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Report formats with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-3.5 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Report formats
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Predefined daily formats Maya fills in
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {config.reportFormats.map((rf) => (
              <div
                key={rf.id}
                className={`p-3.5 rounded-2xl border backdrop-blur-xl space-y-1.5 transition-all ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200/80 shadow-xs'
                    : 'bg-[#090e1b]/80 border-white/8'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-sm font-semibold ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {rf.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeReport(rf.id)}
                    className={`p-1 transition-colors cursor-pointer ${
                      isLight
                        ? 'text-slate-400 hover:text-red-500'
                        : 'text-slate-400 hover:text-red-400'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p
                  className={`text-xs font-mono whitespace-pre-wrap ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {rf.template}
                </p>
              </div>
            ))}

            {isAddingReport ? (
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 backdrop-blur-xl ${
                  isLight
                    ? 'bg-slate-50 border-blue-300 shadow-sm'
                    : 'bg-[#090e1b] border-blue-500/40 shadow-md'
                }`}
              >
                <input
                  type="text"
                  placeholder="Format Title (e.g. End of Day Update)"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors focus:outline-none focus:border-blue-500 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                  }`}
                />
                <textarea
                  rows={3}
                  placeholder="Template structure..."
                  value={newReportTemplate}
                  onChange={(e) => setNewReportTemplate(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border font-mono resize-none transition-colors focus:outline-none focus:border-blue-500 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                  }`}
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingReport(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                      isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addReportFormat}
                    className="px-3.5 py-1.5 rounded-xl text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-xs active:scale-95"
                  >
                    Save Format
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingReport(true)}
                className={`w-full py-2.5 px-3 rounded-2xl border border-dashed text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700'
                    : 'border-white/15 hover:border-blue-500/50 hover:bg-white/5 text-blue-400'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add report format
              </button>
            )}
          </div>
        </div>

        {/* Tip box */}
        <div
          className={`flex items-start gap-2.5 p-3.5 rounded-2xl border backdrop-blur-xl text-xs ${
            isLight
              ? 'bg-blue-50/80 border-blue-200/80 text-blue-900 shadow-xs'
              : 'bg-blue-950/30 border-blue-500/25 text-blue-300'
          }`}
        >
          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <span className="leading-relaxed">
            Maya will always verify draft values with you before broadcasting to any WhatsApp group.
          </span>
        </div>
      </div>
    </div>
  );
};
