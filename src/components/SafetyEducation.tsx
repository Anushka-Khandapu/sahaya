import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Shield,
  Eye,
  AlertCircle,
  HelpCircle,
  MapPin,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';

interface SafetyEducationProps {
  language: Language;
}

interface GuideItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  steps: string[];
}

const SAFETY_GUIDES: GuideItem[] = [
  {
    id: 'g1',
    category: 'Public Awareness',
    title: 'Situational Awareness in Public Spaces & Commutes',
    summary: 'How to notice early warning signals and stay alert without living in fear.',
    steps: [
      'Maintain the "Yellow Condition": Alert and relaxed, scanning exits, crowds, and movement patterns.',
      'Limit headphone usage in dimly lit or deserted areas; keep one ear open for footsteps or approaching vehicles.',
      'Walk with purpose, head upright, and eyes engaged. Opportunistic harassers avoid individuals projecting confidence.',
      'Know your emergency exits in metro stations, buses, malls, and movie theaters as soon as you enter.',
      'If you feel uncomfortable about someone nearby, trust your intuition immediately and change compartments or walk toward a well-lit store.'
    ]
  },
  {
    id: 'g2',
    category: 'Stalking & Harassment',
    title: 'Dealing with Stalking or Persistent Following',
    summary: 'Clear tactical steps to take when someone follows or watches you repeatedly.',
    steps: [
      'Verify the trail: make three intentional turns or cross to the opposite sidewalk. If they mirror your movements, it is deliberate.',
      'Do not retreat into your empty residence or private driveway. Head immediately toward a brightly lit, populated venue (pharmacy, supermarket, bank with armed guard).',
      'Speak loudly into your phone or pretend to video call: "I am right outside the supermarket at [Street Name], wait for me here."',
      'Take photos or mental notes of the person’s attire, shoes, vehicle registration, and distinguishing marks.',
      'Report the incident to the Women Helpline (181) or Police (112). Record the event in your SAHAYA Incident Diary as evidence.'
    ]
  },
  {
    id: 'g3',
    category: 'Cyber Safety',
    title: 'Responding to Online Blackmail & Sextortion',
    summary: 'What to do if a scammer threatens to leak private photos or chats online.',
    steps: [
      'DO NOT PAY. Sending ransom never stops extortion—it only invites demands for even more money.',
      'Do not delete the messages or chat history. Take complete screenshots including phone numbers, profile links, and payment UPI handles.',
      'Block the extortionist on all communication channels immediately to sever emotional panic.',
      'Lock your social media profiles to private, hiding your friend/follower lists.',
      'File a complaint on cybercrime.gov.in or call 1930. The Cyber Cell has mechanisms to remove compromising material from social platforms.'
    ]
  },
  {
    id: 'g4',
    category: 'Bystander Action',
    title: 'The 5 Ds of Safe Bystander Intervention',
    summary: 'How to safely assist someone else experiencing harassment without endangering yourself.',
    steps: [
      '1. Distract: Interrupt the situation indirectly (ask for the time, drop a water bottle, ask for directions).',
      '2. Delegate: Find someone with authority to intervene (bus driver, metro guard, security officer).',
      '3. Document: If someone is already helping and you are safe, record video from a discreet distance.',
      '4. Delay: After the incident, check in with the person: "Are you okay? Can I sit with you or call someone for you?"',
      '5. Direct: Speak up firmly if safe: "That behavior is unacceptable. Leave them alone."'
    ]
  },
  {
    id: 'g5',
    category: 'Post-Incident Response',
    title: 'What to Do Immediately After an Incident or Assault',
    summary: 'Critical medical, legal, and emotional support steps in the aftermath.',
    steps: [
      'Get to a safe, secure location with people you trust or at a hospital/police station.',
      'Seek medical attention promptly: physical well-being and forensic documentation take precedence.',
      'Preserve evidence: do not wash clothing or delete call logs/messages.',
      'Record facts while fresh in your SAHAYA Incident Diary with exact timestamps and descriptions.',
      'Contact support counselors via National Commission for Women (7827170170) or 181 for legal assistance.'
    ]
  }
];

export const SafetyEducation: React.FC<SafetyEducationProps> = ({ language }) => {
  const t = translations[language];
  const [expandedId, setExpandedId] = useState<string | null>('g1');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t.learnSafety}</h2>
            <p className="text-xs text-slate-400">
              Clear, practical self-protection and emergency response guides.
            </p>
          </div>
        </div>
      </div>

      {/* Guide Accordions */}
      <div className="space-y-3">
        {SAFETY_GUIDES.map((guide) => {
          const isExpanded = expandedId === guide.id;
          return (
            <div
              key={guide.id}
              className={`rounded-2xl border transition overflow-hidden bg-slate-900 ${
                isExpanded ? 'border-indigo-500/60 shadow-lg shadow-indigo-950/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => toggleExpand(guide.id)}
                className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {guide.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-white">{guide.title}</h3>
                  <p className="text-xs text-slate-400">{guide.summary}</p>
                </div>
                <div className="p-1 rounded-lg bg-slate-800 text-slate-400 shrink-0 mt-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 space-y-3 text-xs text-slate-300">
                  <div className="space-y-2">
                    {guide.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/40">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
