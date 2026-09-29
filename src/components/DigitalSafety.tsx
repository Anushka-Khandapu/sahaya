import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import {
  Laptop,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  KeyRound,
  ExternalLink,
  PhoneCall,
  Search,
  Lock,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

interface DigitalSafetyProps {
  language: Language;
}

export const DigitalSafety: React.FC<DigitalSafetyProps> = ({ language }) => {
  const t = translations[language];
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{
    riskLevel: 'high' | 'medium' | 'low' | null;
    flags: string[];
    advice: string[];
  } | null>(null);

  const [activeChecklist, setActiveChecklist] = useState<Record<string, boolean>>({
    chk1: true,
    chk2: false,
    chk3: false,
    chk4: true,
    chk5: false,
  });

  const toggleCheck = (id: string) => {
    setActiveChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAnalyzeText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const lower = inputText.toLowerCase();
    const flags: string[] = [];
    const advice: string[] = [];

    // Check high-risk fraud signals
    if (lower.includes('kyc') || lower.includes('pan card') || lower.includes('account blocked') || lower.includes('deactivated')) {
      flags.push('Urgent Banking / KYC Suspension Panic: Banks never threaten instant deactivation via SMS.');
      advice.push('Do NOT click links in the message. Call your bank branch directly or use the official mobile banking app.');
    }

    if (lower.includes('otp') || lower.includes('one time password') || lower.includes('pin') || lower.includes('cvv')) {
      flags.push('OTP / Security Credential Solicitation: Legitimate staff never ask for OTPs or PINs.');
      advice.push('Never share OTPs with anyone, even callers claiming to be police, bank managers, or electricity boards.');
    }

    if (lower.includes('lottery') || lower.includes('won') || lower.includes('kbc') || lower.includes('prize') || lower.includes('cashback')) {
      flags.push('Unsolicited Prize / Lottery Claim: Classic advance-fee fraud scheme.');
      advice.push('You cannot win a contest or lottery you never entered. Never pay "tax clearance" fees to claim prizes.');
    }

    if (lower.includes('apk') || lower.includes('.apk') || lower.includes('download') || lower.includes('anydesk') || lower.includes('teamviewer') || lower.includes('rustdesk')) {
      flags.push('Remote Screen-Sharing / Unofficial APK Installation request.');
      advice.push('Installing APKs or screen-share apps gives criminals full control over your phone and SMS OTPs.');
    }

    if (lower.includes('video call') || lower.includes('cbi') || lower.includes('customs') || lower.includes('arrest') || lower.includes('digital arrest') || lower.includes('narcotics')) {
      flags.push('Fake Law Enforcement "Digital Arrest" Extortion Scheme.');
      advice.push('Indian Police, CBI, and Customs NEVER conduct "digital arrests" or ask for financial deposits over WhatsApp or Skype.');
    }

    if (lower.includes('http://') || lower.includes('bit.ly') || lower.includes('tinyurl') || lower.includes('.xyz') || lower.includes('.top')) {
      flags.push('Shortened or Unverified Link: Often disguises credential theft phishing pages.');
      advice.push('Inspect the true destination domain carefully. Never enter passwords on unverified sites.');
    }

    let riskLevel: 'high' | 'medium' | 'low' = 'low';
    if (flags.length >= 2) {
      riskLevel = 'high';
    } else if (flags.length === 1) {
      riskLevel = 'medium';
    } else {
      flags.push('No obvious standard scam keywords detected.');
      advice.push('Always exercise caution: verify sender identity independently before sharing sensitive details or money.');
    }

    setAnalysisResult({ riskLevel, flags, advice });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t.digitalSafetyTitle}</h2>
            <p className="text-xs text-slate-400">
              Guidance against online fraud, phishing, digital blackmail, and account hacking.
            </p>
          </div>
        </div>
      </div>

      {/* 1930 Golden Hour Emergency Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-900 border-2 border-red-500/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
            <h3 className="font-extrabold text-sm sm:text-base text-red-300">
              Lost Money in an Online Fraud? Act Within The Golden Hour!
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Call <strong>1930</strong> immediately. The Citizen Financial Cyber Fraud Reporting System alerts the beneficiary bank to freeze fraudulent transfers before scammers withdraw the cash.
          </p>
        </div>

        <a
          href="tel:1930"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-black text-xs text-white shadow-lg transition active:scale-95 shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call 1930 Now</span>
        </a>
      </div>

      {/* Suspicious Message Analyzer */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4 shadow-md">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <span>{t.inspectMessage}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {t.pasteMessagePrompt}
          </p>
        </div>

        <form onSubmit={handleAnalyzeText} className="space-y-3">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. Dear customer, your SBI / HDFC account will be suspended today due to missing PAN. Click here http://bit.ly/update-kyc to verify..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Evaluated against verified pattern rules.
            </span>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition"
            >
              {t.checkMessageBtn}
            </button>
          </div>
        </form>

        {analysisResult && (
          <div
            className={`p-4 rounded-xl border space-y-3 mt-3 ${
              analysisResult.riskLevel === 'high'
                ? 'bg-rose-950/60 border-rose-500/50'
                : analysisResult.riskLevel === 'medium'
                ? 'bg-amber-950/60 border-amber-500/50'
                : 'bg-emerald-950/60 border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                {analysisResult.riskLevel === 'high' && (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-300">High Fraud Indicators Detected</span>
                  </>
                )}
                {analysisResult.riskLevel === 'medium' && (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300">Suspicious Risk Factors</span>
                  </>
                )}
                {analysisResult.riskLevel === 'low' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">No Explicit Scam Flags Found</span>
                  </>
                )}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <strong className="text-slate-300 block">Observed Pattern Flags:</strong>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {analysisResult.flags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5 text-xs pt-1 border-t border-slate-700/50">
              <strong className="text-slate-300 block">Safety Recommendations:</strong>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {analysisResult.advice.map((adv, i) => (
                  <li key={i}>{adv}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Account Security & 2FA Checklist */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">{t.twoFactorChecklist}</h3>
          </div>
          <span className="text-xs text-slate-400">Essential Protection</span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            {
              id: 'chk1',
              title: 'Enable Two-Factor Authentication (2FA) on WhatsApp',
              desc: 'Set a 6-digit PIN in WhatsApp > Settings > Account > Two-step verification to prevent SIM swap hijackings.',
            },
            {
              id: 'chk2',
              title: 'Use an Authenticator App (Google Authenticator / Aegis) for Emails',
              desc: 'SMS-based 2FA is vulnerable to SIM cloning; app-generated tokens are far more secure.',
            },
            {
              id: 'chk3',
              title: 'Set SIM Card Lock (PIN) in Mobile Settings',
              desc: 'If your phone is stolen, the SIM PIN prevents thieves from placing the SIM in another phone to receive your OTPs.',
            },
            {
              id: 'chk4',
              title: 'Turn Off Bluetooth & Wi-Fi Auto-Join in Public Spaces',
              desc: 'Avoid rogue Wi-Fi hotspots and Bluetooth sniffing at airports and transit stations.',
            },
            {
              id: 'chk5',
              title: 'Audit App Permissions Regularly',
              desc: 'Revoke background location, microphone, and contacts access for flashlight or calculator apps that do not need them.',
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                activeChecklist[item.id]
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-slate-200'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div
                className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                  activeChecklist[item.id]
                    ? 'bg-cyan-600 border-cyan-500 text-white'
                    : 'border-slate-600 bg-slate-800'
                }`}
              >
                {activeChecklist[item.id] && <Check className="w-3 h-3" />}
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-white block">{item.title}</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
