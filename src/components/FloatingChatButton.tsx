import React, { useState } from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import { AIChatView } from './AIChatView';
import { Language, LocationState, UserProfile } from '../types';

interface FloatingChatButtonProps {
  location: LocationState;
  profile: UserProfile;
  isOnline: boolean;
  onTriggerSOS: () => void;
  language: Language;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  location,
  profile,
  isOnline,
  onTriggerSOS,
  language,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 z-40 p-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white shadow-2xl shadow-rose-950/60 hover:scale-105 active:scale-95 transition border-2 border-white/20 flex items-center gap-2 group"
          title="Open SAHAYA Safety AI Assistant"
          aria-label="Open SAHAYA Safety AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${
                isOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </div>
          <span className="font-bold text-xs tracking-wider pr-1 hidden sm:inline-block">
            Safety AI
          </span>
        </button>
      )}

      {/* Floating Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <AIChatView
            location={location}
            profile={profile}
            isOnline={isOnline}
            onTriggerSOS={onTriggerSOS}
            language={language}
            isModal={true}
            onCloseModal={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
};
