import React, { useState } from 'react';
import {
  Language,
  TrustedContact,
  LocationState,
  UserProfile,
  SafeJourney as ISafeJourney,
} from '../types';
import { translations } from '../utils/translations';
import { audioService } from '../utils/audio';
import { torchService } from '../utils/torch';
import {
  AlertTriangle,
  Users,
  Navigation,
  PhoneCall,
  FileText,
  MapPin,
  Laptop,
  BookOpen,
  Heart,
  Volume2,
  VolumeX,
  Flashlight,
  Share2,
  Clock,
  Shield,
  Radio,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Copy,
  Bot,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  onTriggerSOS: () => void;
  location: LocationState;
  refreshLocation: () => Promise<LocationState>;
  contacts: TrustedContact[];
  profile: UserProfile;
  activeJourney: ISafeJourney | null;
  onNavigateTab: (tab: string) => void;
  language: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onTriggerSOS,
  location,
  refreshLocation,
  contacts,
  profile,
  activeJourney,
  onNavigateTab,
  language,
}) => {
  const t = translations[language];
  const [isSirenOn, setIsSirenOn] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  const primaryContact = contacts.find((c) => c.priority === 'primary') || contacts[0];

  const handleToggleSiren = () => {
    if (isSirenOn) {
      audioService.stopSiren();
      setIsSirenOn(false);
    } else {
      audioService.startSiren();
      setIsSirenOn(true);
    }
  };

  const handleToggleTorch = async () => {
    if (isTorchOn) {
      await torchService.turnOff();
      setIsTorchOn(false);
    } else {
      const ok = await torchService.turnOn();
      setIsTorchOn(ok);
      if (!ok) {
        onNavigateTab('tools');
      }
    }
  };

  const handleCopyLocation = () => {
    if (location.latitude && location.longitude) {
      const text = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      navigator.clipboard.writeText(text);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

  const menuItems = [
    {
      id: 'chat',
      title: 'Safety AI (n8n)',
      desc: 'Smart 24/7 emergency & guidance assistant',
      icon: Bot,
      color: 'from-pink-600 via-rose-600 to-red-600',
      badge: 'n8n Live',
    },
    {
      id: 'contacts',
      title: t.trustedContacts,
      desc: `${contacts.length} registered contacts`,
      icon: Users,
      color: 'from-blue-600 to-indigo-700',
      badge: contacts.length === 0 ? 'Action Needed' : undefined,
    },
    {
      id: 'numbers',
      title: t.emergencyNumbers,
      desc: '112, 181, 108, 1930',
      icon: PhoneCall,
      color: 'from-red-600 to-rose-700',
    },
    {
      id: 'journey',
      title: t.safeJourney,
      desc: activeJourney ? 'Journey in progress' : 'Transit tracker & check-in',
      icon: Navigation,
      color: 'from-sky-600 to-cyan-700',
      active: !!activeJourney,
    },
    {
      id: 'tools',
      title: t.quickTools,
      desc: 'Siren, torch, compass, coordinates',
      icon: Shield,
      color: 'from-amber-600 to-orange-700',
    },
    {
      id: 'incidents',
      title: t.incidentRecord,
      desc: 'Private encrypted logbook',
      icon: FileText,
      color: 'from-purple-600 to-violet-700',
    },
    {
      id: 'map',
      title: t.safetyMap,
      desc: 'Verified hospitals & police',
      icon: MapPin,
      color: 'from-emerald-600 to-teal-700',
    },
    {
      id: 'digital',
      title: t.digitalSafety,
      desc: 'Scam analyzer & 1930 guide',
      icon: Laptop,
      color: 'from-cyan-600 to-blue-700',
    },
    {
      id: 'education',
      title: t.learnSafety,
      desc: 'Emergency response tips',
      icon: BookOpen,
      color: 'from-indigo-600 to-purple-700',
    },
    {
      id: 'family',
      title: t.familySafety,
      desc: 'Coordinated family circle',
      icon: Heart,
      color: 'from-pink-600 to-rose-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Active Journey Card Banner (If active) */}
      {activeJourney && (
        <div
          onClick={() => onNavigateTab('journey')}
          className="p-4 rounded-2xl bg-sky-950/80 border-2 border-sky-500/60 shadow-lg cursor-pointer hover:border-sky-400 transition flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-sky-400">
                  Safe Journey Active
                </span>
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              </div>
              <h4 className="font-bold text-sm text-white">To: {activeJourney.destination}</h4>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-sky-400">
            <span>View Tracker</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Main SOS Panic Action Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 text-center space-y-6 shadow-2xl overflow-hidden">
        {/* Subtle background radar circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-72 h-72 rounded-full border border-rose-500 animate-ping" style={{ animationDuration: '4s' }} />
          <div className="w-96 h-96 rounded-full border border-rose-500/50 absolute" />
        </div>

        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {t.appTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            {t.appTagline}
          </p>
        </div>

        {/* Large SOS Button */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-2 pb-2">
          <div className="relative group">
            {/* Outer pulsating glow rings */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-red-600 to-rose-600 opacity-60 blur-xl group-hover:opacity-100 transition duration-500 animate-pulse" />

            <button
              onClick={onTriggerSOS}
              className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-b from-red-500 via-rose-600 to-red-700 text-white shadow-2xl shadow-rose-950 flex flex-col items-center justify-center border-4 border-white/20 active:scale-95 transition transform duration-150 select-none cursor-pointer focus:outline-none"
              aria-label="Activate Emergency SOS"
            >
              <Radio className="w-9 h-9 sm:w-11 sm:h-11 mb-1 animate-pulse" />
              <span className="text-3xl sm:text-4xl font-black tracking-widest uppercase text-white drop-shadow-md">
                SOS
              </span>
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-rose-100 mt-0.5">
                Press for Help
              </span>
            </button>
          </div>
          <span className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            5-second cancel countdown on tap
          </span>
        </div>

        {/* Quick Hardware Action Bar */}
        <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3 max-w-lg mx-auto pt-2">
          <button
            onClick={handleToggleSiren}
            className={`py-3 px-2 sm:px-4 rounded-2xl border text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              isSirenOn
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {isSirenOn ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-400" />}
            <span>{isSirenOn ? t.stopSiren : t.sirenAlarm}</span>
          </button>

          <button
            onClick={handleToggleTorch}
            className={`py-3 px-2 sm:px-4 rounded-2xl border text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              isTorchOn
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Flashlight className="w-4 h-4 text-amber-400" />
            <span>{isTorchOn ? 'Torch Off' : t.flashlight}</span>
          </button>

          <button
            onClick={() => onNavigateTab('numbers')}
            className="py-3 px-2 sm:px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md transition flex flex-col sm:flex-row items-center justify-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 112</span>
          </button>
        </div>

        {/* Live GPS Coordinates Card */}
        <div className="relative z-10 p-3 sm:p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 max-w-lg mx-auto flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">GPS Satellite Location</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                  ±{location.accuracy || 15}m
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                {location.latitude && location.longitude
                  ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                  : 'Acquiring satellite lock...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyLocation}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
              title="Copy GPS coordinates"
            >
              {copiedCoords ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => refreshLocation()}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
              title="Refresh Location"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Emergency Contact Banner (if exists) */}
      {primaryContact && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center">
              {primaryContact.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                Primary Emergency Contact
              </span>
              <h4 className="font-bold text-sm text-white">{primaryContact.name}</h4>
              <p className="text-xs text-slate-400 font-mono">{primaryContact.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${primaryContact.phone}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Grid Navigation */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Safety Hub & Services
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigateTab(item.id)}
                className={`p-4 rounded-2xl bg-slate-900 border transition cursor-pointer flex items-center justify-between gap-3 group ${
                  item.active
                    ? 'border-sky-500 shadow-lg shadow-sky-950/30'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md shrink-0`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm group-hover:text-rose-400 transition">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
