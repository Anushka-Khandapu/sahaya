import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { NetworkStatus } from '../hooks/useOnlineStatus';
import { Shield, Wifi, WifiOff, Globe, Download, Settings as SettingsIcon, Info } from 'lucide-react';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  networkStatus: NetworkStatus;
  onOpenSettings: () => void;
  onOpenTechInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  networkStatus,
  onOpenSettings,
  onOpenTechInfo,
}) => {
  const t = translations[language];
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 shadow-md shadow-rose-900/40 text-white font-bold text-xl">
            <Shield className="w-5 h-5 fill-white/20 stroke-white stroke-2" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active Protection" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-xl text-white">SAHAYA</span>
              <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xs:block">{t.appTagline}</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
              networkStatus === 'online'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : networkStatus === 'limited'
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse'
            }`}
            title={
              networkStatus === 'online'
                ? 'Internet available'
                : networkStatus === 'limited'
                ? 'Weak or slow network'
                : 'Offline - Core tools active'
            }
          >
            {networkStatus === 'online' ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className="hidden md:inline">
              {networkStatus === 'online' ? t.onlineMode : networkStatus === 'limited' ? t.limitedConnection : t.offlineMode}
            </span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'te' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
            title="Switch Language (English / తెలుగు)"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-rose-400" />
            <span>{language === 'en' ? 'తెలుగు' : 'EN'}</span>
          </button>

          {/* PWA Install Button */}
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-sm transition"
              title="Install SAHAYA for offline use"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.installApp}</span>
            </button>
          )}

          {!isInstalled && isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              <Download className="w-3 h-3 text-rose-400" />
              <span>iOS App</span>
            </button>
          )}

          {/* Tech Limits Info */}
          <button
            onClick={onOpenTechInfo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Technical capabilities & limitations"
            aria-label="Technical capabilities"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Profile & Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title={t.settings}
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold text-rose-400">Install SAHAYA on iPhone / iPad</h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              1. Tap the <strong className="text-white">Share</strong> button at the bottom of Safari.<br />
              2. Scroll down and select <strong className="text-white">Add to Home Screen</strong>.<br />
              3. Tap <strong className="text-white">Add</strong> in the top-right corner.
            </p>
            <p className="mt-3 text-xs text-slate-400">
              This allows SAHAYA to open instantly without internet access.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
