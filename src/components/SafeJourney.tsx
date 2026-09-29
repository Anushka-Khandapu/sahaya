import React, { useState, useEffect } from 'react';
import { SafeJourney as ISafeJourney, TrustedContact, Language, LocationState } from '../types';
import { translations } from '../utils/translations';
import { storage } from '../utils/storage';
import { audioService } from '../utils/audio';
import {
  Navigation,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Send,
  Share2,
  XCircle,
  Car,
  Footprints,
  Bus,
  Train,
  Shield,
  PhoneCall
} from 'lucide-react';

interface SafeJourneyProps {
  contacts: TrustedContact[];
  location: LocationState;
  onTriggerSOS: () => void;
  language: Language;
}

export const SafeJourney: React.FC<SafeJourneyProps> = ({
  contacts,
  location,
  onTriggerSOS,
  language,
}) => {
  const t = translations[language];
  const [activeJourney, setActiveJourney] = useState<ISafeJourney | null>(() => storage.getActiveJourney());
  const [destination, setDestination] = useState('');
  const [minutesDuration, setMinutesDuration] = useState<number>(30);
  const [trustedContactId, setTrustedContactId] = useState<string>(
    contacts.find((c) => c.priority === 'primary')?.id || contacts[0]?.id || ''
  );
  const [transitMode, setTransitMode] = useState<ISafeJourney['transitMode']>('cab');
  const [notes, setNotes] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [showOverdueAlert, setShowOverdueAlert] = useState<boolean>(false);
  const [arrivedBanner, setArrivedBanner] = useState<boolean>(false);

  // Sync remaining time
  useEffect(() => {
    if (!activeJourney) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.floor((activeJourney.expectedArrivalTime - now) / 1000);
      setRemainingSeconds(diff);

      if (diff <= 0 && activeJourney.status === 'active') {
        setShowOverdueAlert(true);
      }
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeJourney]);

  const handleStartJourney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    const now = Date.now();
    const expectedTime = now + minutesDuration * 60 * 1000;

    const journey: ISafeJourney = {
      id: 'journey_' + now,
      destination: destination.trim(),
      startLocation: location.latitude && location.longitude 
        ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` 
        : 'Current GPS',
      startTime: now,
      expectedArrivalTime: expectedTime,
      trustedContactId: trustedContactId || undefined,
      transitMode,
      status: 'active',
      notes: notes.trim(),
      lastCheckInTime: now,
    };

    storage.saveJourney(journey);
    setActiveJourney(journey);
    setShowOverdueAlert(false);
    setArrivedBanner(false);
  };

  const handleArrival = () => {
    if (!activeJourney) return;
    const completed: ISafeJourney = {
      ...activeJourney,
      status: 'completed',
    };
    storage.saveJourney(completed);
    setActiveJourney(null);
    setShowOverdueAlert(false);
    setArrivedBanner(true);
    audioService.playSuccessChime();
  };

  const handleCancelJourney = () => {
    if (!activeJourney) return;
    const cancelled: ISafeJourney = {
      ...activeJourney,
      status: 'cancelled',
    };
    storage.saveJourney(cancelled);
    setActiveJourney(null);
    setShowOverdueAlert(false);
  };

  const handleCheckInNow = () => {
    if (!activeJourney) return;
    const updated: ISafeJourney = {
      ...activeJourney,
      lastCheckInTime: Date.now(),
      status: 'active',
    };
    storage.saveJourney(updated);
    setActiveJourney(updated);
    setShowOverdueAlert(false);
    audioService.playBeep(880, 0.15);
  };

  const handleExtendJourney = (extraMinutes = 15) => {
    if (!activeJourney) return;
    const updated: ISafeJourney = {
      ...activeJourney,
      expectedArrivalTime: activeJourney.expectedArrivalTime + extraMinutes * 60 * 1000,
      status: 'active',
    };
    storage.saveJourney(updated);
    setActiveJourney(updated);
    setShowOverdueAlert(false);
  };

  const assignedContact = contacts.find((c) => c.id === activeJourney?.trustedContactId);

  const formatCountdown = (secs: number) => {
    const isNegative = secs < 0;
    const abs = Math.abs(secs);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    return `${isNegative ? '-' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Safe arrival SMS body
  const arrivalSMSBody = activeJourney
    ? `SAHAYA Update: I have arrived safely at ${activeJourney.destination}. All good!`
    : 'I have arrived safely!';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t.safeJourney} & Check-In</h2>
            <p className="text-xs text-slate-400">
              Track your transit, notify guardians, and confirm arrival with 1 tap.
            </p>
          </div>
        </div>
      </div>

      {/* Arrived Safely Confirmation Banner */}
      {arrivedBanner && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-emerald-300">Journey Completed!</h4>
              <p className="text-xs text-emerald-100">
                You marked yourself as arrived safely. You can notify your contacts now.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {assignedContact && (
              <a
                href={`sms:${assignedContact.phone}?body=${encodeURIComponent(arrivalSMSBody)}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Text {assignedContact.name}</span>
              </a>
            )}
            <button
              onClick={() => setArrivedBanner(false)}
              className="text-xs text-emerald-400 hover:text-white px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Active Journey View */}
      {activeJourney ? (
        <div className="bg-slate-900 border-2 border-sky-500/50 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Top Active Beacon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-400 animate-ping" />
              <span className="text-xs font-extrabold tracking-widest text-sky-400 uppercase">
                {t.journeyActive}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Started {new Date(activeJourney.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Overdue Warning */}
          {showOverdueAlert && (
            <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/60 text-amber-200 flex items-start gap-3 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-amber-300">{t.overdueWarning}</div>
                <p>
                  Your expected arrival time has passed. Are you safe or delayed in traffic?
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleExtendJourney(15)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-500"
                  >
                    +15 Min (Traffic/Delay)
                  </button>
                  <button
                    onClick={handleArrival}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500"
                  >
                    {t.arrivedSafely}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Journey Destination & Countdown */}
          <div className="text-center py-2 space-y-2">
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <MapPin className="w-5 h-5 text-sky-400" />
              <span className="text-xl font-black text-white">{activeJourney.destination}</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">
                ETA: {new Date(activeJourney.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="pt-2">
              <div
                className={`text-4xl sm:text-5xl font-mono font-black ${
                  remainingSeconds < 0 ? 'text-amber-400' : 'text-sky-400'
                }`}
              >
                {formatCountdown(remainingSeconds)}
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-widest mt-1">
                {remainingSeconds < 0 ? 'Minutes Overdue' : 'Estimated Time Remaining'}
              </div>
            </div>
          </div>

          {/* Guardian & Transit Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Trusted Guardian</span>
                <span className="font-semibold text-white">
                  {assignedContact ? assignedContact.name : 'None selected'}
                </span>
              </div>
              {assignedContact && (
                <a
                  href={`tel:${assignedContact.phone}`}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-400"
                  title="Call Guardian"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Transit Mode</span>
                <span className="font-semibold text-white capitalize">{activeJourney.transitMode}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-700 text-sky-400">
                {activeJourney.transitMode === 'cab' && <Car className="w-4 h-4" />}
                {activeJourney.transitMode === 'walking' && <Footprints className="w-4 h-4" />}
                {activeJourney.transitMode === 'bus' && <Bus className="w-4 h-4" />}
                {activeJourney.transitMode === 'train' && <Train className="w-4 h-4" />}
                {activeJourney.transitMode === 'personal_vehicle' && <Car className="w-4 h-4" />}
                {activeJourney.transitMode === 'other' && <Navigation className="w-4 h-4" />}
              </div>
            </div>
          </div>

          {activeJourney.notes && (
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300">
              <span className="text-slate-500 font-semibold block mb-0.5">Notes / Vehicle Details:</span>
              {activeJourney.notes}
            </div>
          )}

          {/* Primary Journey Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleArrival}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-black text-white text-base shadow-xl shadow-emerald-950/40 transition flex items-center justify-center gap-2 active:scale-98"
            >
              <CheckCircle className="w-6 h-6" />
              <span>{t.arrivedSafely}</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCheckInNow}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-sky-300 transition flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>{t.imSafe} (Check In)</span>
              </button>

              <button
                onClick={onTriggerSOS}
                className="py-3 px-4 rounded-xl bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/60 text-xs font-bold text-rose-300 transition flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4 text-rose-400" />
                <span>Emergency SOS</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleExtendJourney(15)}
                className="text-xs text-slate-400 hover:text-white"
              >
                +15 Min Delay
              </button>
              <button
                onClick={handleCancelJourney}
                className="text-xs text-slate-500 hover:text-rose-400"
              >
                Cancel Journey
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Journey Setup Form */
        <form
          onSubmit={handleStartJourney}
          className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl"
        >
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white">{t.startSafeJourney}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set your target location and ETA. The app will monitor your arrival locally without cloud tracking.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.destination} *
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. University Campus, Railway Station, Home"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Transit Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinutesDuration(m)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      minutesDuration === m
                        ? 'bg-sky-600 text-white border-sky-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.transitMode}
              </label>
              <select
                value={transitMode}
                onChange={(e) => setTransitMode(e.target.value as ISafeJourney['transitMode'])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="cab">Taxi / Cab / Auto</option>
                <option value="walking">Walking</option>
                <option value="bus">Public Bus</option>
                <option value="train">Metro / Train</option>
                <option value="personal_vehicle">Personal Vehicle</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notify Trusted Contact (Optional)
              </label>
              <select
                value={trustedContactId}
                onChange={(e) => setTrustedContactId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="">None (Self monitor only)</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.relationship})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Vehicle # / Driver / Route Info (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Cab AP-09-AB-1234, White Sedan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-white text-sm shadow-md transition flex items-center justify-center gap-2 mt-2"
          >
            <Navigation className="w-4 h-4" />
            <span>Start Safe Journey Tracking</span>
          </button>
        </form>
      )}
    </div>
  );
};
