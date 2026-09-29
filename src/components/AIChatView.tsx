import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Language, LocationState, UserProfile } from '../types';
import { translations } from '../utils/translations';
import { n8nChatService, DEFAULT_N8N_WEBHOOK_URL } from '../utils/n8nChatService';
import {
  Bot,
  Send,
  User,
  Trash2,
  Settings as SettingsIcon,
  RefreshCw,
  AlertTriangle,
  Radio,
  PhoneCall,
  CheckCircle,
  Copy,
  Sparkles,
  MapPin,
  Mic,
  MicOff,
  ExternalLink,
  Info,
  X
} from 'lucide-react';

interface AIChatViewProps {
  location: LocationState;
  profile: UserProfile;
  isOnline: boolean;
  onTriggerSOS: () => void;
  language: Language;
  isModal?: boolean;
  onCloseModal?: () => void;
}

const CHAT_STORAGE_KEY = 'sahaya_chat_history_v1';

const SUGGESTED_CHIPS = [
  { label: '🚨 I am in danger', text: 'I am in immediate danger and need safety guidance.' },
  { label: '🚶 Someone is following me', text: 'Someone has been following me for blocks, what do I do?' },
  { label: '🚕 Cab route deviated', text: 'My cab driver deviated from the GPS route into dark roads.' },
  { label: '💰 Cyber fraud (1930)', text: 'I lost money to an online scam just now. How do I freeze it?' },
  { label: '🔐 Sextortion blackmail', text: 'Someone is threatening to leak private photos unless I pay them.' },
  { label: '📞 Emergency numbers', text: 'What are the official emergency helpline numbers in India?' },
];

export const AIChatView: React.FC<AIChatViewProps> = ({
  location,
  profile,
  isOnline,
  onTriggerSOS,
  language,
  isModal = false,
  onCloseModal,
}) => {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        text: `Hello ${profile.name || 'there'}! I am **SAHAYA Safety AI**, connected to your dedicated **n8n workflow**.\n\nI can assist you with emergency response protocols, de-escalation, cyber fraud reporting (1930), and travel safety.\n\nHow can I help you stay safe right now?`,
        timestamp: Date.now(),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(n8nChatService.getWebhookUrl());
  const [configSaved, setConfigSaved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await n8nChatService.sendMessage({
        userMessage: query,
        location: includeLocation
          ? { lat: location.latitude, lng: location.longitude }
          : undefined,
        userName: profile.name,
        isOnline,
      });

      const assistantMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'assistant',
        text: result.reply,
        timestamp: Date.now(),
        isFallback: result.source === 'offline_fallback',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue processing your request. If in immediate danger, call **112** or trigger **Emergency SOS** immediately.',
        timestamp: Date.now(),
        isError: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    const welcome: ChatMessage = {
      id: 'welcome_' + Date.now(),
      sender: 'assistant',
      text: `Chat history cleared. I am ready to assist you.`,
      timestamp: Date.now(),
    };
    setMessages([welcome]);
    n8nChatService.resetSession();
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    n8nChatService.setWebhookUrl(webhookUrl);
    setConfigSaved(true);
    setTimeout(() => {
      setConfigSaved(false);
      setShowConfig(false);
    }, 1200);
  };

  const handleResetDefaultWebhook = () => {
    setWebhookUrl(DEFAULT_N8N_WEBHOOK_URL);
    n8nChatService.setWebhookUrl(DEFAULT_N8N_WEBHOOK_URL);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Speech Recognition (Web Speech API)
  const toggleSpeechRecognition = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowObj = window as any;
    const SpeechRecognitionClass = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Formatter for markdown-like text with telephone action pills
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Bold handling
      let formatted: React.ReactNode = line;
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        formatted = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
          }
          return part;
        });
      }

      // Check for prominent Indian phone numbers (112, 181, 1930, 108, 1098, 1090)
      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'min-h-[1.2rem]'}>
          {formatted}
        </p>
      );
    });
  };

  return (
    <div
      className={`flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white ${
        isModal ? 'h-[85vh] max-h-[700px] w-full max-w-2xl' : 'h-[calc(100vh-140px)] min-h-[550px]'
      }`}
    >
      {/* Top Header */}
      <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-950/40">
            <Bot className="w-5 h-5" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                isOnline ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm sm:text-base text-white">SAHAYA Safety AI</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                n8n Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xs">
              {isOnline ? 'Online • Ready to assist' : 'Offline • Local safety rules active'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick SOS Trigger inside Chat */}
          <button
            onClick={onTriggerSOS}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition mr-1"
            title="Emergency SOS"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">SOS</span>
          </button>

          {/* Settings / Webhook Config Toggle */}
          <button
            onClick={() => setShowConfig((prev) => !prev)}
            className={`p-2 rounded-xl transition ${
              showConfig ? 'bg-slate-700 text-rose-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Configure n8n Webhook"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Clear History */}
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Close Modal if inside dialog */}
          {isModal && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Webhook Configuration Sub-panel */}
      {showConfig && (
        <form
          onSubmit={handleSaveWebhook}
          className="bg-slate-800/95 border-b border-slate-700 px-4 py-3 space-y-2 text-xs shrink-0 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>n8n Chat Webhook Configuration</span>
            </span>
            <button
              type="button"
              onClick={handleResetDefaultWebhook}
              className="text-[11px] text-rose-400 hover:underline"
            >
              Reset to Default
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="url"
              required
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://.../webhook/.../chat"
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-[11px] focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 font-bold text-white transition"
            >
              Save URL
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>
              Target: <code className="text-slate-300">{webhookUrl}</code>
            </span>
            {configSaved && <span className="text-emerald-400 font-bold">Saved!</span>}
          </div>
        </form>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSOSPrompt =
            msg.text.toLowerCase().includes('112') ||
            msg.text.toLowerCase().includes('emergency') ||
            msg.text.toLowerCase().includes('danger') ||
            msg.text.toLowerCase().includes('sos');

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-rose-600 text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-red-950/80 border border-red-500/50 text-red-200 rounded-tl-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                {/* Source or status badges for assistant */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-700/60 text-[10px]">
                    <div className="flex items-center gap-1 font-bold text-slate-300">
                      <Bot className="w-3 h-3 text-rose-400" />
                      <span>{msg.isFallback ? 'SAHAYA Local Engine' : 'n8n Cloud Agent'}</span>
                    </div>
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="text-slate-400 hover:text-white p-0.5 rounded transition"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {/* Formatted body */}
                <div className="space-y-1">{renderFormattedText(msg.text)}</div>

                {/* Inline Action Pills if Emergency is mentioned */}
                {!isUser && isSOSPrompt && (
                  <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={onTriggerSOS}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] shadow-sm transition"
                    >
                      <Radio className="w-3 h-3" />
                      <span>Trigger SOS</span>
                    </button>
                    <a
                      href="tel:112"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-[11px] transition"
                    >
                      <PhoneCall className="w-3 h-3 text-emerald-400" />
                      <span>Call 112</span>
                    </a>
                    {msg.text.includes('1930') && (
                      <a
                        href="tel:1930"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-[11px] transition"
                      >
                        <PhoneCall className="w-3 h-3 text-amber-400" />
                        <span>Call 1930 (Fraud)</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-slate-500 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 w-fit">
            <Bot className="w-4 h-4 text-rose-400 animate-spin" />
            <span>Consulting safety knowledge base...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/90 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        {SUGGESTED_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.text)}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white whitespace-nowrap transition"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <div className="p-3 bg-slate-850 border-t border-slate-800 shrink-0 space-y-2">
        <div className="flex items-end gap-2">
          {/* Audio speech dictation button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl border transition ${
              isListening
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
            }`}
            title={isListening ? 'Listening...' : 'Voice Dictation'}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Text Area */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask safety guidance, emergency steps, legal helplines..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500 resize-none max-h-24"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-xl font-bold transition flex items-center justify-center ${
              !input.trim() || isLoading
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40 active:scale-95'
            }`}
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Location & Privacy metadata toggle */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLocation}
              onChange={(e) => setIncludeLocation(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Share GPS context with AI</span>
            </span>
          </label>

          <span className="text-[10px] text-slate-500">
            Press Enter to send, Shift+Enter for newline
          </span>
        </div>
      </div>
    </div>
  );
};
