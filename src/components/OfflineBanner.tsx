import React from 'react';
import { NetworkStatus } from '../hooks/useOnlineStatus';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { WifiOff, CheckCircle2, AlertTriangle } from 'lucide-react';

interface OfflineBannerProps {
  networkStatus: NetworkStatus;
  justRestored: boolean;
  onDismissRestored?: () => void;
  language: Language;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  networkStatus,
  justRestored,
  onDismissRestored,
  language,
}) => {
  const t = translations[language];

  if (justRestored) {
    return (
      <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-5xl mx-auto">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{t.connectionRestored}</span>
        </div>
        {onDismissRestored && (
          <button
            onClick={onDismissRestored}
            className="text-emerald-300 hover:text-white text-xs px-2 py-0.5 rounded ml-2"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  if (networkStatus === 'offline') {
    return (
      <div className="bg-rose-950/90 border-b border-rose-500/50 text-rose-200 px-4 py-2.5 text-xs shadow-md">
        <div className="max-w-5xl mx-auto flex items-start gap-2.5">
          <WifiOff className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="leading-snug">
            <span className="font-bold text-rose-300 mr-2 uppercase tracking-wide">
              {t.offlineMode}
            </span>
            <span className="text-slate-300">{t.offlineSubtext}</span>
          </div>
        </div>
      </div>
    );
  }

  if (networkStatus === 'limited') {
    return (
      <div className="bg-amber-950/80 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>{t.limitedConnection}:</strong> High latency or weak mobile data detected. Local offline features will be prioritized.
          </span>
        </div>
      </div>
    );
  }

  return null;
};
