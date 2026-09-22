import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, CompanionRole } from '../types';
import { MessageCircle, Send, Sparkles, Volume2, Bot, Trash2, HelpCircle, X, Smile, Wand2 } from 'lucide-react';
import { speechController } from '../lib/speech';
import { soundEngine } from '../lib/soundEngine';

interface StoryCompanionChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentStoryTitle?: string;
  currentPageText?: string;
  initialPrompt?: string;
}

const ROLES: { id: CompanionRole; name: string; avatar: string; title: string; color: string }[] = [
  { id: 'owl', name: 'Barnaby Owl', avatar: '🦉', title: 'Wise Story Owl', color: 'from-amber-400 to-orange-500' },
  { id: 'fairy', name: 'Pippa Pixie', avatar: '🧚', title: 'Sparkle Fairy', color: 'from-pink-400 to-purple-500' },
  { id: 'robot', name: 'Beep Bot', avatar: '🤖', title: 'Curious Robot', color: 'from-cyan-400 to-blue-500' },
];

export const StoryCompanionChat: React.FC<StoryCompanionChatProps> = ({
  isOpen,
  onClose,
  currentStoryTitle = '',
  currentPageText = '',
  initialPrompt = '',
}) => {
  const [role, setRole] = useState<CompanionRole>('owl');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hoot hoot! I'm Barnaby your AI Story Buddy! Ask me anything about this page, hard words, or fun riddles!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roleName: 'Barnaby Owl',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRoleInfo = ROLES.find((r) => r.id === role) || ROLES[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    soundEngine.playPop();

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ sender: m.sender, text: m.text })),
          role,
          currentStoryContext: currentStoryTitle,
          currentPageText,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Chat failed');

      const assistantMsg: ChatMessage = {
        id: 'reply-' + Date.now(),
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleName: activeRoleInfo.name,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      soundEngine.playSparkle();

      // Read aloud assistant reply if wanted
      speechController.speakText(data.text, { rate: 1.0, pitch: 1.1 });
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: "Hoot! My magic feather got a little tangled. Can you ask me that again?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          roleName: activeRoleInfo.name,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakMsg = (text: string) => {
    soundEngine.playPop();
    speechController.speakText(text, { rate: 1.0, pitch: 1.1 });
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'assistant',
        text: `Hello! I'm ${activeRoleInfo.name}. Ready for story fun?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleName: activeRoleInfo.name,
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-amber-50 shadow-2xl border-l-2 border-amber-200 flex flex-col justify-between animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-white p-4 border-b border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${activeRoleInfo.color} flex items-center justify-center text-xl shadow-md`}>
            {activeRoleInfo.avatar}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-1.5">
              <span>{activeRoleInfo.name}</span>
              <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            </h3>
            <p className="text-[11px] text-amber-700 font-semibold">{activeRoleInfo.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl hover:bg-amber-100 text-stone-400 hover:text-stone-600 transition-colors"
            title="Clear Chat History"
            id="clear-chat-btn"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-amber-100 text-stone-500 font-bold"
            id="close-chat-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Role Selection Pills */}
      <div className="bg-amber-100/70 p-2 flex items-center gap-1.5 overflow-x-auto border-b border-amber-200">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              soundEngine.playPop();
              setRole(r.id);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              role === r.id
                ? 'bg-white text-amber-950 shadow-sm border border-amber-300'
                : 'text-amber-800 hover:text-amber-950'
            }`}
            id={`role-btn-${r.id}`}
          >
            <span>{r.avatar}</span>
            <span>{r.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentPageText && (
          <div className="p-3 rounded-2xl bg-amber-100/60 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-extrabold text-[10px] uppercase text-amber-700">Reading Context</span>
            <p className="line-clamp-2 italic font-medium">"{currentPageText}"</p>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}>
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-xs font-medium'
                    : 'bg-white text-stone-800 border border-amber-200 rounded-bl-xs'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between mb-1 text-[10px] font-bold text-amber-700">
                    <span>{m.roleName || activeRoleInfo.name}</span>
                    <button
                      onClick={() => handleSpeakMsg(m.text)}
                      className="p-1 hover:text-amber-950 transition-colors"
                      title="Speak Message"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <p>{m.text}</p>
              </div>
              <span className="text-[10px] text-stone-400 font-medium px-1">{m.timestamp}</span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-white p-3 rounded-2xl border border-amber-200 w-fit animate-pulse">
            <Bot className="w-4 h-4 text-amber-500 animate-spin" />
            <span>Thinking of a magical answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="p-2.5 bg-amber-100/50 border-t border-amber-200 space-y-2">
        <span className="text-[10px] font-extrabold uppercase text-amber-800 px-1">Quick Questions</span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleSendMessage('Can you explain hard words on this page?')}
            className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 text-[11px] font-bold whitespace-nowrap hover:bg-amber-50"
            id="chip-explain-words"
          >
            📖 Explain Words
          </button>
          <button
            onClick={() => handleSendMessage('Tell me a fun bedtime riddle!')}
            className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 text-[11px] font-bold whitespace-nowrap hover:bg-amber-50"
            id="chip-riddle"
          >
            🧩 Bedtime Riddle
          </button>
          <button
            onClick={() => handleSendMessage('What lesson can we learn from this story?')}
            className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 text-[11px] font-bold whitespace-nowrap hover:bg-amber-50"
            id="chip-lesson"
          >
            🌟 Story Lesson
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-1"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${activeRoleInfo.name.split(' ')[0]} anything...`}
            className="flex-1 p-2.5 rounded-xl bg-white border-2 border-amber-200 text-xs font-medium focus:outline-none focus:border-amber-400"
            id="companion-chat-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold disabled:opacity-50 transition-transform active:scale-95 shadow-md"
            id="send-companion-msg-btn"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};
