import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Share2,
  Instagram,
  Facebook,
  Lightbulb,
  Plus,
  Trash2,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadSocialConfig,
  saveSocialConfig,
  MayaSocialConfig,
} from './mayaStorage';

interface MayaSocialDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaSocialDetailView: React.FC<MayaSocialDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaSocialConfig>(loadSocialConfig);
  const [newPostText, setNewPostText] = useState('');
  const [newPostTime, setNewPostTime] = useState('');
  const [isAddingPost, setIsAddingPost] = useState(false);

  const update = (partial: Partial<MayaSocialConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveSocialConfig(next);
      return next;
    });
  };

  const togglePlatform = (p: 'Instagram' | 'Facebook') => {
    const exists = config.platforms.includes(p);
    const updated = exists
      ? config.platforms.filter((item) => item !== p)
      : [...config.platforms, p];
    update({ platforms: updated });
  };

  const addScheduledPost = () => {
    if (!newPostText.trim()) return;
    update({
      scheduledPosts: [
        ...config.scheduledPosts,
        {
          id: Date.now().toString(),
          text: newPostText.trim(),
          time: newPostTime.trim() || 'Tomorrow 10:00 AM',
        },
      ],
    });
    setNewPostText('');
    setNewPostTime('');
    setIsAddingPost(false);
  };

  const removePost = (id: string) => {
    update({
      scheduledPosts: config.scheduledPosts.filter((p) => p.id !== id),
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
          Social media
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

      {/* Content matching Screenshot 6 with Frosted Glass UI */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16 scrollbar-thin">
        {/* Card 1: Handle & Platforms with Frosted Glass */}
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
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Social handle & accounts
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Where Maya posts or drafts updates
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              className={`text-xs font-semibold ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              Social handle / Username
            </label>
            <input
              type="text"
              placeholder="@username"
              value={config.handle}
              onChange={(e) => update({ handle: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:border-blue-500 ${
                isLight
                  ? 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  : 'bg-[#090e1b] border-white/10 text-white placeholder:text-slate-500'
              }`}
            />
          </div>

          <div className="space-y-2 pt-1">
            <label
              className={`text-xs font-semibold ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              Connected Platforms
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => togglePlatform('Instagram')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer backdrop-blur-xl ${
                  config.platforms.includes('Instagram')
                    ? isLight
                      ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300 text-pink-700 shadow-xs'
                      : 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/40 text-white'
                    : isLight
                    ? 'bg-slate-50/80 border-slate-200 text-slate-500 hover:bg-slate-100'
                    : 'bg-[#090e1b]/80 border-white/8 text-slate-400 hover:bg-white/5'
                }`}
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>Instagram</span>
              </button>

              <button
                type="button"
                onClick={() => togglePlatform('Facebook')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer backdrop-blur-xl ${
                  config.platforms.includes('Facebook')
                    ? isLight
                      ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                      : 'bg-blue-600/20 border-blue-500/40 text-white'
                    : isLight
                    ? 'bg-slate-50/80 border-slate-200 text-slate-500 hover:bg-slate-100'
                    : 'bg-[#090e1b]/80 border-white/8 text-slate-400 hover:bg-white/5'
                }`}
              >
                <Facebook className="w-4 h-4 text-blue-500" />
                <span>Facebook</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Caption Voice with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-3 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="space-y-1">
            <h2
              className={`text-sm font-semibold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Caption voice & tone
            </h2>
            <p
              className={`text-xs leading-relaxed ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Tone guidelines Maya uses when writing your captions and hashtags
            </p>
          </div>
          <textarea
            rows={3}
            placeholder="e.g., Casual, authentic, minimal emojis, focus on tech and productivity..."
            value={config.captionVoice}
            onChange={(e) => update({ captionVoice: e.target.value })}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:border-blue-500 resize-none font-sans ${
              isLight
                ? 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'
                : 'bg-[#090e1b] border-white/10 text-white placeholder:text-slate-500'
            }`}
          />
        </div>

        {/* Card 3: Daily story & Auto-post with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-3.5 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="pr-3">
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Daily story draft
              </h3>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Maya suggests a daily story photo or quote every morning
              </p>
            </div>
            <button
              type="button"
              onClick={() => update({ dailyStory: !config.dailyStory })}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                config.dailyStory ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700/60'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  config.dailyStory ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          <div className={`flex items-center justify-between pt-3 border-t ${isLight ? 'border-slate-200/80' : 'border-white/10'}`}>
            <div className="pr-3">
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Scheduled posts
              </h3>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Review pending posts scheduled for publishing
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {config.scheduledPosts.map((sp) => (
              <div
                key={sp.id}
                className={`p-3.5 rounded-2xl border backdrop-blur-xl space-y-1.5 transition-all ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200/80 shadow-xs'
                    : 'bg-[#090e1b]/80 border-white/8'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isLight ? 'text-blue-700' : 'text-blue-400'
                    }`}
                  >
                    {sp.time}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePost(sp.id)}
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
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {sp.text}
                </p>
              </div>
            ))}

            {isAddingPost ? (
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 backdrop-blur-xl ${
                  isLight
                    ? 'bg-slate-50 border-blue-300 shadow-sm'
                    : 'bg-[#090e1b] border-blue-500/40 shadow-md'
                }`}
              >
                <textarea
                  rows={2}
                  placeholder="Post content / caption draft..."
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors focus:outline-none focus:border-blue-500 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Time (e.g. Tonight 8:00 PM)"
                  value={newPostTime}
                  onChange={(e) => setNewPostTime(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors focus:outline-none focus:border-blue-500 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                  }`}
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingPost(false)}
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
                    onClick={addScheduledPost}
                    className="px-3.5 py-1.5 rounded-xl text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-xs active:scale-95"
                  >
                    Schedule Post
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingPost(true)}
                className={`w-full py-2.5 px-3 rounded-2xl border border-dashed text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700'
                    : 'border-white/15 hover:border-blue-500/50 hover:bg-white/5 text-blue-400'
                }`}
              >
                <Plus className="w-4 h-4" />
                Schedule new post
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
            Posts are prepared according to standard mobile dimensions (1080x1920 stories, 1:1 square feeds).
          </span>
        </div>
      </div>
    </div>
  );
};
