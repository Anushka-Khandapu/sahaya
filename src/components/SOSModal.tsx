import React, { useState, useEffect, useRef } from 'react';
import { Language, TrustedContact, LocationState, UserProfile } from '../types';
import { translations } from '../utils/translations';
import { audioService } from '../utils/audio';
import { torchService } from '../utils/torch';
import { storage } from '../utils/storage';
import { NetworkStatus } from '../hooks/useOnlineStatus';
import {
  AlertTriangle,
  PhoneCall,
  MessageSquare,
  Share2,
  Volume2,
  VolumeX,
  Flashlight,
  MapPin,
  CheckCircle,
  Copy,
  Clock,
  ShieldAlert,
  Radio,
  X
} from 'lucide-react';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationState;
  refreshLocation: () => Promise<LocationState>;
  contacts: TrustedContact[];
  profile: UserProfile;
  networkStatus: NetworkStatus;
  language: Language;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  location,
  refreshLocation,
  contacts,
  profile,
  networkStatus,
  language,
}) => {
  const t = translations[language];
  const [countdown, setCountdown] = useState<number>(5);
  const [isBeaconActive, setIsBeaconActive] = useState<boolean>(false);
  const [isSirenOn, setIsSirenOn] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [screenStrobe, setScreenStrobe] = useState<boolean>(false);
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);
  const [sosTimestamp, setSosTimestamp] = useState<number | null>(null);

  const countdownIntervalRef = useRef<number | null>(null);
  const strobeIntervalRef = useRef<number | null>(null);

  // Identify Primary and Secondary Contacts
  const primaryContact = contacts.find((c) => c.priority === 'primary') || contacts[0];
  const secondaryContact = contacts.find((c) => c.priority === 'secondary') || contacts[1];

  // Prepared Emergency Text
  const formatLocationString = () => {
    if (location.latitude && location.longitude) {
      return `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)} (Accuracy: ±${location.accuracy || 15}m)\nMaps: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    }
    return 'Location: GPS Satellite coordinates acquiring/unavailable.';
  };

  const emergencyMessage = `🚨 EMERGENCY ALERT FROM SAHAYA SAFETY APP\n\nI need immediate assistance! I may be in danger.\n\nName: ${profile.name || 'Citizen'}\nBlood Group: ${profile.bloodGroup || 'Unknown'}\nTime: ${new Date(sosTimestamp || Date.now()).toLocaleTimeString()}\n${formatLocationString()}\n\n*Please call emergency services (112) or reach my location if you cannot contact me.*`;

  // Start countdown on modal open
  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setIsBeaconActive(false);
      setIsSirenOn(false);
      setIsTorchOn(false);
      setSosTimestamp(null);

      // Force instant GPS refresh
      refreshLocation();

      // Countdown loop
      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            triggerActiveEmergency();
            return 0;
          }
          audioService.playBeep(650, 0.1);
          return prev - 1;
        });
      }, 1000);
    } else {
      cleanupEmergency();
    }

    return () => {
      cleanupEmergency();
    };
  }, [isOpen]);

  const cleanupEmergency = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (strobeIntervalRef.current) {
      clearInterval(strobeIntervalRef.current);
      strobeIntervalRef.current = null;
    }
    audioService.stopSiren();
    torchService.turnOff();
    setIsSirenOn(false);
    setIsTorchOn(false);
    setScreenStrobe(false);
  };

  const triggerActiveEmergency = () => {
    const time = Date.now();
    setSosTimestamp(time);
    setIsBeaconActive(true);

    // Save SOS log locally
    storage.logSOSEvent({
      timestamp: time,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      status: 'triggered',
      pendingSync: networkStatus === 'offline',
    });

    // Start siren by default to deter attackers / signal distress
    audioService.startSiren();
    setIsSirenOn(true);

    // Try starting physical torch
    torchService.turnOn().then((ok) => {
      if (ok) setIsTorchOn(true);
      else setScreenStrobe(true);
    });

    // Vibrate device if supported
    if (navigator.vibrate) {
      navigator.vibrate([400, 200, 400, 200, 800]);
    }
  };

  const handleCancel = () => {
    cleanupEmergency();
    if (isBeaconActive) {
      storage.logSOSEvent({
        timestamp: Date.now(),
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        status: 'cancelled',
        pendingSync: networkStatus === 'offline',
      });
    }
    onClose();
  };

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
        setScreenStrobe((prev) => !prev);
      }
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(emergencyMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '🚨 EMERGENCY ALERT - SAHAYA',
          text: emergencyMessage,
        });
      } catch {}
    } else {
      handleCopyMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto ${
      screenStrobe ? 'bg-red-700 animate-pulse' : 'bg-black/85 backdrop-blur-md'
    }`}>
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-rose-600 rounded-3xl shadow-2xl text-white overflow-hidden my-auto">
        {/* Top Emergency Beacon Bar */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 px-6 py-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2">
            <Radio className="w-6 h-6 animate-pulse text-amber-300" />
            <div>
              <h2 className="font-black text-lg tracking-wider uppercase">
                {isBeaconActive ? t.sosTriggered : t.sosCountingDown}
              </h2>
              <p className="text-[11px] text-rose-100 font-medium">
                {isBeaconActive ? t.emergencyBeaconActive : 'Accidental touch? Cancel immediately.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Countdown State */}
          {!isBeaconActive ? (
            <div className="text-center py-4 space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-rose-500/30 flex items-center justify-center animate-ping absolute" />
                <div className="w-28 h-28 rounded-full bg-rose-600/20 border-4 border-rose-500 flex flex-col items-center justify-center text-rose-400">
                  <span className="text-5xl font-black">{countdown}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">Seconds</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-rose-300">
                  Acquiring GPS Satellite coordinates & preparing alert...
                </p>
                <p className="text-xs text-slate-400">
                  Tap below to cancel immediately if safe.
                </p>
              </div>

              <button
                onClick={handleCancel}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-lg shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-6 h-6" />
                <span>{t.cancelSos}</span>
              </button>
            </div>
          ) : (
            /* Active Beacon State */
            <div className="space-y-5">
              {/* Emergency Status Notice */}
              <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-rose-300 uppercase">Emergency Active</div>
                  <div className="text-slate-300">
                    {networkStatus === 'offline' ? (
                      <span className="text-amber-300 font-medium">
                        Offline: Cellular phone dialer and direct SMS remain operable. Web sync queued until network restores.
                      </span>
                    ) : (
                      'High priority alert prepared with your current coordinates.'
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Audible / Visual Deterrents */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={toggleSiren}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold border transition ${
                    isSirenOn
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isSirenOn ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4" />}
                  <span>{isSirenOn ? t.stopAlarm : t.playSiren}</span>
                </button>

                <button
                  onClick={toggleTorch}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold border transition ${
                    isTorchOn || screenStrobe
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Flashlight className="w-4 h-4" />
                  <span>{isTorchOn || screenStrobe ? 'Flashlight On' : t.flashlight}</span>
                </button>
              </div>

              {/* Direct Emergency Call Actions */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Direct Emergency Calls (Works over Cellular Network)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="tel:112"
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-md transition font-bold text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4" />
                      <span>{t.call112}</span>
                    </div>
                    <span className="text-xs bg-black/25 px-2 py-0.5 rounded">ERSS</span>
                  </a>

                  {primaryContact && (
                    <a
                      href={`tel:${primaryContact.phone}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white shadow-sm transition font-bold text-sm"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">{primaryContact.name}</span>
                      </div>
                      <span className="text-xs text-rose-300 shrink-0">{primaryContact.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Direct SMS and Sharing */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pre-filled SMS & Location Dispatch
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {primaryContact ? (
                    <a
                      href={`sms:${primaryContact.phone}?body=${encodeURIComponent(emergencyMessage)}`}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition"
                    >
                      <MessageSquare className="w-4 h-4 text-sky-400" />
                      <span>SMS Primary ({primaryContact.name})</span>
                    </a>
                  ) : null}

                  {secondaryContact && (
                    <a
                      href={`sms:${secondaryContact.phone}?body=${encodeURIComponent(emergencyMessage)}`}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition"
                    >
                      <MessageSquare className="w-4 h-4 text-sky-400" />
                      <span>SMS Secondary ({secondaryContact.name})</span>
                    </a>
                  )}

                  <button
                    onClick={handleShareApp}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition"
                  >
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.shareViaApp}</span>
                  </button>

                  <button
                    onClick={handleCopyMessage}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition"
                  >
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>{copiedMsg ? t.copied : 'Copy Emergency Text'}</span>
                  </button>
                </div>
              </div>

              {/* Location Card */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>Current GPS Position</span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {location.timestamp ? new Date(location.timestamp).toLocaleTimeString() : 'Acquiring...'}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-200 bg-slate-900/90 p-2.5 rounded-lg select-all break-all">
                  {location.latitude && location.longitude
                    ? `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)} (±${location.accuracy || 10}m)`
                    : 'Locating via satellite/cellular...'}
                </div>
                {location.latitude && location.longitude && (
                  <a
                    href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[11px] font-semibold text-rose-400 hover:underline"
                  >
                    Open in Google Maps ↗
                  </a>
                )}
              </div>

              {/* Resolve Emergency Button */}
              <button
                onClick={handleCancel}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>I AM NOW SAFE - RESOLVE EMERGENCY</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
