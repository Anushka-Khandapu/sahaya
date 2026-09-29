import React, { useState } from 'react';
import { LocationState, Language, TrustedContact } from '../types';
import { translations } from '../utils/translations';
import { audioService } from '../utils/audio';
import { torchService } from '../utils/torch';
import {
  Wrench,
  Flashlight,
  Volume2,
  VolumeX,
  MapPin,
  PhoneCall,
  Share2,
  Copy,
  Check,
  Compass,
  Sparkles,
  ShieldAlert,
  Sun,
  Flame,
  HelpCircle
} from 'lucide-react';

interface QuickToolsProps {
  location: LocationState;
  refreshLocation: () => Promise<LocationState>;
  contacts: TrustedContact[];
  onNavigateTab: (tab: string) => void;
  language: Language;
}

export const QuickTools: React.FC<QuickToolsProps> = ({
  location,
  refreshLocation,
  contacts,
  onNavigateTab,
  language,
}) => {
  const t = translations[language];
  const [isSirenOn, setIsSirenOn] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isScreenTorch, setIsScreenTorch] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  const toggleSiren = () => {
    if (isSirenOn) {
      audioService.stopSiren();
      setIsSirenOn(false);
    } else {
      audioService.startSiren();
      setIsSirenOn(true);
    }
  };

  const toggleTorch = async () => {
    if (isTorchOn) {
      await torchService.turnOff();
      setIsTorchOn(false);
    } else {
      const ok = await torchService.turnOn();
      setIsTorchOn(ok);
      if (!ok) {
        // Fallback to screen torch
        setIsScreenTorch(true);
      }
    }
  };

  const handleCopyCoords = () => {
    if (!location.latitude || !location.longitude) return;
    const str = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(str);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleShareCoords = async () => {
    if (!location.latitude || !location.longitude) return;
    const shareText = `SAHAYA My Location: Lat ${location.latitude.toFixed(6)}, Lng ${location.longitude.toFixed(6)}\nMaps: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Current Location - SAHAYA',
          text: shareText,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen Torch Fullscreen Overlay */}
      {isScreenTorch && (
        <div
          onClick={() => setIsScreenTorch(false)}
          className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-slate-900 cursor-pointer animate-in fade-in"
        >
          <Sun className="w-20 h-20 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
          <h2 className="text-2xl font-black mt-4">Screen Torch Active</h2>
          <p className="text-sm font-semibold text-slate-600 mt-1">
            Tap anywhere to turn off
          </p>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t.toolsTitle}</h2>
            <p className="text-xs text-slate-400">
              Immediate hardware and tactile utilities for distress and low-visibility conditions.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Hardware Tool Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Loud Siren Alarm */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                <Volume2 className="w-6 h-6" />
              </div>
              {isSirenOn && (
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                  Playing (110dB)
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white">{t.sirenAlarm}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Piercing high-decibel dual-frequency audio siren designed to attract immediate crowd attention and deter aggressors.
            </p>
          </div>

          <button
            onClick={toggleSiren}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
              isSirenOn
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isSirenOn ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-400" />}
            <span>{isSirenOn ? t.stopSiren : t.playSiren}</span>
          </button>
        </div>

        {/* Flashlight & Screen Torch */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Flashlight className="w-6 h-6" />
              </div>
              {isTorchOn && (
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                  Torch On
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white">{t.flashlight} & Bright Light</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Toggles device camera LED or high-lumen white display screen for dark streets, stairwells, and signalling.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleTorch}
              className={`py-3 px-3 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-1.5 ${
                isTorchOn
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Flashlight className="w-3.5 h-3.5" />
              <span>{isTorchOn ? 'Torch Off' : 'Camera Torch'}</span>
            </button>

            <button
              onClick={() => setIsScreenTorch(true)}
              className="py-3 px-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.screenTorch}</span>
            </button>
          </div>
        </div>

        {/* Live GPS Coordinates Hub */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                ±{location.accuracy || 15}m
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{t.myLocation}</h3>
            <p className="text-xs text-slate-400 font-mono select-all bg-slate-800/80 p-2 rounded-lg border border-slate-700">
              {location.latitude && location.longitude
                ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                : 'Acquiring GPS fix...'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyCoords}
              className="py-3 px-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
            >
              {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedCoords ? t.copied : t.copyCoords}</span>
            </button>

            <button
              onClick={handleShareCoords}
              className="py-3 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.shareLocation}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Guidance Instructions (Offline Available) */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-sm text-white">Emergency Response Protocols (Cached Offline)</h3>
          </div>
          <span className="text-[11px] text-slate-400">Available without internet</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Stalker protocol */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <h4 className="font-bold text-rose-300 flex items-center gap-1.5">
              <span>🚶 If You Are Being Followed or Stalked</span>
            </h4>
            <ul className="text-slate-300 space-y-1 list-disc list-inside">
              <li>Cross the street immediately to verify if the person follows.</li>
              <li>Do NOT head toward an empty home or isolated alleyway.</li>
              <li>Enter a crowded public place: store, pharmacy, bank ATM with guard, or restaurant.</li>
              <li>Pretend to be on a loud phone call naming your specific location.</li>
              <li>Call 112 directly if the pursuer persists.</li>
            </ul>
          </div>

          {/* Cab & Night Travel */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>🚕 Taxi / Auto / Ride Share Safety</span>
            </h4>
            <ul className="text-slate-300 space-y-1 list-disc list-inside">
              <li>Always verify driver face and license plate matches the app booking.</li>
              <li>Check child lock is disengaged so you can open doors from the inside.</li>
              <li>Keep live journey active in SAHAYA with your trusted guardian selected.</li>
              <li>If driver deviates from route, firmly ask why and demand to stop in a well-lit area.</li>
            </ul>
          </div>

          {/* Physical Threat / De-escalation */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <h4 className="font-bold text-sky-300 flex items-center gap-1.5">
              <span>🛡️ Confrontation & De-escalation</span>
            </h4>
            <ul className="text-slate-300 space-y-1 list-disc list-inside">
              <li>Create physical distance immediately; do not let anyone corner you.</li>
              <li>Shout specific commands loudly: "BACK AWAY" or "HELP, CALL POLICE" rather than screaming.</li>
              <li>Target vulnerable escape zones if forced: eyes, groin, throat, knee joint.</li>
              <li>Trigger SAHAYA Loud Alarm siren to disorient and draw witnesses.</li>
            </ul>
          </div>

          {/* Medical Trauma / First Aid */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>🩹 Urgent First Aid & Fainting</span>
            </h4>
            <ul className="text-slate-300 space-y-1 list-disc list-inside">
              <li>Unconscious person: Check breathing; place in lateral recovery position.</li>
              <li>Severe bleeding: Apply direct continuous pressure with clean cloth.</li>
              <li>Heat stroke: Move to shade, loosen tight clothing, hydrate with electrolytes.</li>
              <li>Call 108 / 112 immediately for trauma ambulance.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
