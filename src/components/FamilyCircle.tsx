import React, { useState } from 'react';
import { TrustedContact, Language } from '../types';
import { translations } from '../utils/translations';
import {
  Users,
  Heart,
  Phone,
  MessageSquare,
  ShieldCheck,
  Send,
  MapPin,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface FamilyCircleProps {
  contacts: TrustedContact[];
  onTriggerSOS: () => void;
  language: Language;
}

export const FamilyCircle: React.FC<FamilyCircleProps> = ({
  contacts,
  onTriggerSOS,
  language,
}) => {
  const t = translations[language];
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Filter contacts marked for group or family
  const familyMembers = contacts.filter((c) => c.isGroupMember !== false);

  const handleBroadcastCheckIn = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t.familySafety}</h2>
            <p className="text-xs text-slate-400">
              Coordinated safety circle for parents, partners, children, and guardians.
            </p>
          </div>
        </div>
      </div>

      {/* Explicit Consent & Zero Continuous Tracking Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-emerald-300 block">Privacy-First Family Architecture</span>
          <p className="text-slate-400 leading-relaxed">
            SAHAYA never conducts silent or continuous background GPS surveillance. Location is only shared when you deliberately trigger an SOS or send an "I'm Safe" check-in broadcast.
          </p>
        </div>
      </div>

      {/* Broadcast Quick Action */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-white">One-Tap "I'm Safe" Family Broadcast</h3>
          <p className="text-xs text-slate-400">
            Send a pre-formatted peace-of-mind SMS to your entire family circle simultaneously.
          </p>
        </div>

        <button
          onClick={handleBroadcastCheckIn}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 font-bold text-xs text-white shadow-md transition"
        >
          <Send className="w-4 h-4" />
          <span>{broadcastSent ? 'Check-In Sent!' : 'Send "I\'m Safe" Ping'}</span>
        </button>
      </div>

      {/* Family Members Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Active Circle Members ({familyMembers.length})
        </h4>

        {familyMembers.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-500">
            No family members linked yet. Add family members in the Trusted Contacts tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-xl bg-pink-950/80 border border-pink-500/40 text-pink-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-white text-sm block truncate">{member.name}</span>
                    <span className="text-[11px] text-slate-400">{member.relationship}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`tel:${member.phone}`}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`sms:${member.phone}?body=${encodeURIComponent(
                      'SAHAYA Family Update: Checking in to let you know I am safe and sound.'
                    )}`}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                    title="SMS"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
