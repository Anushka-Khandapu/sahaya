/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, TrustedContact, UserProfile, SafeJourney as ISafeJourney } from './types';
import { translations } from './utils/translations';
import { storage } from './utils/storage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useLocation } from './hooks/useLocation';

import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { SOSModal } from './components/SOSModal';
import { Dashboard } from './components/Dashboard';
import { TrustedContacts } from './components/TrustedContacts';
import { EmergencyNumbers } from './components/EmergencyNumbers';
import { SafeJourney } from './components/SafeJourney';
import { IncidentDiary } from './components/IncidentDiary';
import { QuickTools } from './components/QuickTools';
import { OfflineSafetyMap } from './components/OfflineSafetyMap';
import { DigitalSafety } from './components/DigitalSafety';
import { SafetyEducation } from './components/SafetyEducation';
import { FamilyCircle } from './components/FamilyCircle';
import { AIChatView } from './components/AIChatView';
import { FloatingChatButton } from './components/FloatingChatButton';
import { SettingsModal } from './components/SettingsModal';
import { TechnicalLimitationModal } from './components/TechnicalLimitationModal';

import {
  Home,
  Users,
  Navigation,
  Shield,
  FileText,
  MapPin,
  Laptop,
  PhoneCall,
  Radio,
  BookOpen,
  Bot
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('sahaya_lang');
      return saved === 'te' ? 'te' : 'en';
    } catch {
      return 'en';
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTechInfoOpen, setIsTechInfoOpen] = useState<boolean>(false);

  // Data states
  const [contacts, setContacts] = useState<TrustedContact[]>(() => storage.getContacts());
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [activeJourney, setActiveJourney] = useState<ISafeJourney | null>(() => storage.getActiveJourney());

  // Hardware hooks
  const { status: networkStatus, justRestored, dismissRestored } = useOnlineStatus();
  const { location, refreshLocation } = useLocation();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('sahaya_lang', lang);
    } catch {}
  };

  const handleClearAllData = () => {
    setContacts(storage.getContacts());
    setProfile(storage.getProfile());
    setActiveJourney(null);
  };

  const t = translations[language];

  // Primary bottom navigation items for mobile
  const bottomNavItems = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'chat', label: 'AI Chat', icon: Bot },
    { id: 'contacts', label: t.trustedContacts, icon: Users },
    { id: 'journey', label: t.safeJourney, icon: Navigation },
    { id: 'map', label: 'Map', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white pb-20 md:pb-6">
      {/* Top Navbar */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        networkStatus={networkStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTechInfo={() => setIsTechInfoOpen(true)}
      />

      {/* Offline / Connectivity Banner */}
      <OfflineBanner
        networkStatus={networkStatus}
        justRestored={justRestored}
        onDismissRestored={dismissRestored}
        language={language}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* Desktop / Tablet Sub-navigation pills */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-4 text-xs scrollbar-none border-b border-slate-800/80 mb-6">
          {[
            { id: 'dashboard', label: t.dashboard, icon: Home },
            { id: 'chat', label: 'Safety AI (n8n)', icon: Bot },
            { id: 'contacts', label: t.trustedContacts, icon: Users },
            { id: 'numbers', label: t.emergencyNumbers, icon: PhoneCall },
            { id: 'journey', label: t.safeJourney, icon: Navigation },
            { id: 'tools', label: t.quickTools, icon: Shield },
            { id: 'incidents', label: t.incidentRecord, icon: FileText },
            { id: 'map', label: t.safetyMap, icon: MapPin },
            { id: 'digital', label: t.digitalSafety, icon: Laptop },
            { id: 'education', label: t.learnSafety, icon: BookOpen },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <Dashboard
            onTriggerSOS={() => setIsSOSOpen(true)}
            location={location}
            refreshLocation={refreshLocation}
            contacts={contacts}
            profile={profile}
            activeJourney={activeJourney}
            onNavigateTab={setActiveTab}
            language={language}
          />
        )}

        {activeTab === 'chat' && (
          <AIChatView
            location={location}
            profile={profile}
            isOnline={networkStatus !== 'offline'}
            onTriggerSOS={() => setIsSOSOpen(true)}
            language={language}
          />
        )}

        {activeTab === 'contacts' && (
          <TrustedContacts
            contacts={contacts}
            onContactsChange={setContacts}
            language={language}
          />
        )}

        {activeTab === 'numbers' && (
          <EmergencyNumbers language={language} />
        )}

        {activeTab === 'journey' && (
          <SafeJourney
            contacts={contacts}
            location={location}
            onTriggerSOS={() => setIsSOSOpen(true)}
            language={language}
          />
        )}

        {activeTab === 'tools' && (
          <QuickTools
            location={location}
            refreshLocation={refreshLocation}
            contacts={contacts}
            onNavigateTab={setActiveTab}
            language={language}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentDiary
            location={location}
            language={language}
          />
        )}

        {activeTab === 'map' && (
          <OfflineSafetyMap
            location={location}
            language={language}
          />
        )}

        {activeTab === 'digital' && (
          <DigitalSafety language={language} />
        )}

        {activeTab === 'education' && (
          <SafetyEducation language={language} />
        )}

        {activeTab === 'family' && (
          <FamilyCircle
            contacts={contacts}
            onTriggerSOS={() => setIsSOSOpen(true)}
            language={language}
          />
        )}
      </main>

      {/* Mobile Floating SOS Trigger (Shown when not on dashboard tab) */}
      {activeTab !== 'dashboard' && (
        <button
          onClick={() => setIsSOSOpen(true)}
          className="fixed bottom-20 right-4 z-30 p-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl shadow-rose-950/60 flex items-center gap-2 border-2 border-white/30 animate-pulse md:hidden"
          title="Emergency SOS"
        >
          <Radio className="w-5 h-5" />
          <span className="font-black text-xs tracking-wider">SOS</span>
        </button>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                isActive ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Floating n8n Safety AI Assistant Button (Available on any tab) */}
      {activeTab !== 'chat' && (
        <FloatingChatButton
          location={location}
          profile={profile}
          isOnline={networkStatus !== 'offline'}
          onTriggerSOS={() => setIsSOSOpen(true)}
          language={language}
        />
      )}

      {/* SOS Modal */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        location={location}
        refreshLocation={refreshLocation}
        contacts={contacts}
        profile={profile}
        networkStatus={networkStatus}
        language={language}
      />

      {/* Settings & Profile Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
        onClearAllData={handleClearAllData}
        language={language}
      />

      {/* Technical Limitations Disclosure Modal */}
      <TechnicalLimitationModal
        isOpen={isTechInfoOpen}
        onClose={() => setIsTechInfoOpen(false)}
        language={language}
      />
    </div>
  );
}
