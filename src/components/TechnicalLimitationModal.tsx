import React from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import {
  ShieldAlert,
  WifiOff,
  Radio,
  CheckCircle2,
  XCircle,
  PhoneCall,
  X,
  AlertTriangle
} from 'lucide-react';

interface TechnicalLimitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const TechnicalLimitationModal: React.FC<TechnicalLimitationModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-5 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Technical Capabilities & Limitations
              </h3>
              <p className="text-xs text-slate-400">Honest disclosure of how SAHAYA works</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200">
            <strong>Important Safety Notice:</strong> No mobile application can bypass physical laws of physics. If your mobile device has no cellular reception, standard phone calls or SMS cannot physically reach external cell towers.
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>What Works 100% Offline (No Internet / No Mobile Data)</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300 pl-1">
              <li><strong>Local Siren Alarm:</strong> Piercing 110dB audio alarm generates directly from browser Web Audio API.</li>
              <li><strong>Flashlight & Screen Torch:</strong> Camera LED and high-intensity display lighting operate locally.</li>
              <li><strong>Hardware GPS Coordinates:</strong> Many smartphones acquire satellite coordinates (Lat/Lng) without mobile data.</li>
              <li><strong>Private Incident Diary:</strong> Stores photos and documentation locally in encrypted device memory.</li>
              <li><strong>Emergency Guidance:</strong> First aid protocols, self-defense strategies, and cached safe zones map.</li>
              <li><strong>Safe Journey Local Timer:</strong> Counts down expected transit and reminds you to check in.</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="font-bold text-sm text-rose-400 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>What Requires Mobile Carrier / Network Signal</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300 pl-1">
              <li><strong>Calling 112 or Trusted Contacts:</strong> Uses your phone’s SIM card and cellular network towers.</li>
              <li><strong>Sending Emergency SMS:</strong> Requires cellular carrier tower connection.</li>
              <li><strong>Remote Cloud Relay:</strong> If offline, SAHAYA queues the alert and dispatches it once data is restored.</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-400">
            <strong>External Services:</strong> 112, 181, 108, and 1930 are operated by government agencies and emergency personnel, not SAHAYA.
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white transition"
        >
          Understood & Acknowledged
        </button>
      </div>
    </div>
  );
};
