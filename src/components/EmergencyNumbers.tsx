import React, { useState } from 'react';
import { EmergencyNumber, Language } from '../types';
import { translations } from '../utils/translations';
import {
  PhoneCall,
  Shield,
  Heart,
  Baby,
  Activity,
  Laptop,
  Users,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface EmergencyNumbersProps {
  language: Language;
}

const OFFICIAL_EMERGENCY_NUMBERS: EmergencyNumber[] = [
  {
    number: '112',
    title: 'National Emergency Support (ERSS)',
    teluguTitle: 'జాతీయ అత్యవసర సహాయ వ్యవస్థ (ERSS)',
    description: 'Unified 24x7 emergency response for Police, Fire, and Ambulance across all Indian States and UTs.',
    teluguDescription: 'పోలీస్, ఫైర్, మరియు అంబులెన్స్ కోసం అన్ని రాష్ట్రాలలో 24 గంటల ఏకీకృత అత్యవసర సేవ.',
    category: 'police',
    isOfficial: true,
    badge: 'National Single Number'
  },
  {
    number: '181',
    title: 'Women Helpline (Domestic Abuse & Distress)',
    teluguTitle: 'మహిళా హెల్ప్‌లైన్',
    description: '24/7 emergency response for women affected by violence, stalking, domestic harassment, and distress.',
    teluguDescription: 'హింస, గృహ హింస మరియు వేధింపులకు గురైన మహిళల కోసం 24 గంటల సహాయం.',
    category: 'women',
    isOfficial: true,
    badge: 'Toll-Free 24x7'
  },
  {
    number: '1090',
    title: 'Women Power Line',
    teluguTitle: 'మహిళా పవర్ లైన్',
    description: 'Confidential reporting and immediate counseling for cyber harassment, obscene calls, and stalking.',
    teluguDescription: 'సైబర్ వేధింపులు మరియు అసభ్యకర కాల్స్ పై తక్షణ రహస్య ఫిర్యాదుల విభాగం.',
    category: 'women',
    isOfficial: true,
    badge: 'Confidential'
  },
  {
    number: '1930',
    title: 'National Cyber Financial Fraud Helpline',
    teluguTitle: 'జాతీయ సైబర్ ఫైనాన్షియల్ ఫ్రాడ్ హెల్ప్‌లైన్',
    description: 'Citizen Financial Cyber Fraud Reporting System to freeze fraudulent bank transactions immediately within the Golden Hour.',
    teluguDescription: 'ఆన్‌లైన్ బ్యాంకింగ్ మోసాలు జరిగిన వెంటనే ఖాతాల్లోని డబ్బును ఫ్రీజ్ చేయడానికి సహాయం.',
    category: 'cyber',
    isOfficial: true,
    badge: 'Golden Hour Freeze'
  },
  {
    number: '108',
    title: 'Emergency Medical & Disaster Ambulance',
    teluguTitle: 'అత్యవసర వైద్య అంబులెన్స్ సేవ',
    description: '24/7 free ambulance dispatch for trauma, heart attacks, road accidents, and maternity emergencies.',
    teluguDescription: 'ప్రమాదాలు, తీవ్ర అనారోగ్యం మరియు ప్రసవ అత్యవసర సేవల కోసం ఉచిత అంబులెన్స్.',
    category: 'medical',
    isOfficial: true,
    badge: 'Trauma & Medical'
  },
  {
    number: '1098',
    title: 'Childline India Foundation',
    teluguTitle: 'చైల్డ్‌లైన్ (పిల్లల రక్షణ హెల్ప్‌లైన్)',
    description: 'Emergency assistance for children in distress, abuse, trafficking, child labor, or abandonment.',
    teluguDescription: 'ఆపదలో ఉన్న పిల్లల రక్షణ, దుర్వినియోగం మరియు రక్షణ సహాయం.',
    category: 'child',
    isOfficial: true,
    badge: 'Ministry of WCD'
  },
  {
    number: '14567',
    title: 'National Helpline for Senior Citizens (Elder Line)',
    teluguTitle: 'వృద్ధుల జాతీయ హెల్ప్‌లైన్ (ఎల్డర్ లైన్)',
    description: 'Support against elder abuse, abandonment, emotional distress, and legal guidance for seniors.',
    teluguDescription: 'వృద్ధుల రక్షణ, వేధింపుల నివారణ మరియు సంరక్షణ మార్గదర్శకత్వం.',
    category: 'elderly',
    isOfficial: true,
    badge: 'Elder Line'
  },
  {
    number: '100',
    title: 'Police Emergency Direct',
    teluguTitle: 'పోలీస్ కంట్రోల్ రూమ్',
    description: 'Direct legacy police dispatch control room (integrated into 112 in most areas).',
    teluguDescription: 'ప్రత్యక్ష పోలీస్ కంట్రోల్ రూమ్ సహాయం.',
    category: 'police',
    isOfficial: true
  }
];

export const EmergencyNumbers: React.FC<EmergencyNumbersProps> = ({ language }) => {
  const t = translations[language];
  const [filter, setFilter] = useState<'all' | 'police' | 'women' | 'cyber' | 'medical' | 'child' | 'elderly'>('all');

  const filteredNumbers = filter === 'all' 
    ? OFFICIAL_EMERGENCY_NUMBERS 
    : OFFICIAL_EMERGENCY_NUMBERS.filter(n => n.category === filter);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t.emergencyNumbers}</h2>
            <p className="text-xs text-slate-400">
              Verified official public helpline numbers. Tap to open your phone dialer.
            </p>
          </div>
        </div>

        {/* Clear External Disclaimer */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-2 text-xs text-slate-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Official External Services:</strong> These numbers connect directly to government authorities, police departments, and medical responders via your cellular operator. SAHAYA does not operate or dispatch these emergency services.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
            filter === 'all'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Helplines ({OFFICIAL_EMERGENCY_NUMBERS.length})
        </button>
        <button
          onClick={() => setFilter('women')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            filter === 'women'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Women (181, 1090)</span>
        </button>
        <button
          onClick={() => setFilter('police')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            filter === 'police'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>ERSS / Police (112)</span>
        </button>
        <button
          onClick={() => setFilter('cyber')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            filter === 'cyber'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Cyber Fraud (1930)</span>
        </button>
        <button
          onClick={() => setFilter('medical')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            filter === 'medical'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Ambulance (108)</span>
        </button>
        <button
          onClick={() => setFilter('child')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            filter === 'child'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Baby className="w-3.5 h-3.5" />
          <span>Childline (1098)</span>
        </button>
        <button
          onClick={() => setFilter('elderly')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            filter === 'elderly'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Elderly (14567)</span>
        </button>
      </div>

      {/* Numbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNumbers.map((item) => (
          <div
            key={item.number}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl font-black text-rose-400 font-mono tracking-wider">
                      {item.number}
                    </span>
                    {item.badge && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {language === 'te' ? item.teluguTitle : item.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'te' ? item.teluguDescription : item.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-medium">Free 24x7 Cellular Line</span>
              <a
                href={`tel:${item.number}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-bold text-xs text-white shadow-md shadow-rose-950/40 transition active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call {item.number}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Official Government Portals Resource Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h4 className="text-sm font-bold text-slate-200">Official Government Portals & Online Reporting</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <a
            href="https://112.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <span>ERSS 112 India Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
          </a>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <span>National Cyber Crime Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
          </a>
          <a
            href="https://ncw.nic.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <span>National Commission for Women</span>
            <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
