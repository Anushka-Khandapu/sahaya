import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { translations } from '../utils/translations';
import { storage } from '../utils/storage';
import {
  Settings,
  User,
  HeartPulse,
  Trash2,
  Download,
  X,
  Check,
  Shield,
  AlertTriangle,
  Lock
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdate: (p: UserProfile) => void;
  onClearAllData: () => void;
  language: Language;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
  onClearAllData,
  language,
}) => {
  const t = translations[language];
  const [name, setName] = useState(profile.name || '');
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup || 'O+');
  const [medicalConditions, setMedicalConditions] = useState(profile.medicalConditions || '');
  const [allergies, setAllergies] = useState(profile.allergies || '');
  const [emergencyNotes, setEmergencyNotes] = useState(profile.emergencyNotes || '');
  const [address, setAddress] = useState(profile.address || '');
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storage.saveProfile({
      name: name.trim(),
      bloodGroup,
      medicalConditions: medicalConditions.trim(),
      allergies: allergies.trim(),
      emergencyNotes: emergencyNotes.trim(),
      address: address.trim(),
    });
    onProfileUpdate(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleExportAll = () => {
    const backup = {
      profile: storage.getProfile(),
      contacts: storage.getContacts(),
      incidents: storage.getIncidents(),
      journeys: storage.getAllJourneys(),
      sosLogs: storage.getSOSLogs(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAHAYA_Safety_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExecuteWipe = () => {
    storage.clearAllData();
    onClearAllData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-rose-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Personal Profile & Privacy Settings
              </h3>
              <p className="text-xs text-slate-400">Stored strictly on your local device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Profile settings successfully saved!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Citizen Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Blood Group (For Medics)
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Allergies / Critical Medications
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Asthma, Diabetes"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Home Address / Landmark
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Residential area or city"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Emergency Responder Notes
            </label>
            <textarea
              rows={2}
              value={emergencyNotes}
              onChange={(e) => setEmergencyNotes(e.target.value)}
              placeholder="e.g. Wears hearing aid; emergency contacts speak English and Telugu."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-md transition"
          >
            Save Emergency Profile
          </button>
        </form>

        {/* Data Export & Wipe Section */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Data Privacy & Local Storage
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportAll}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export Full JSON Backup</span>
            </button>

            {!confirmWipe ? (
              <button
                onClick={() => setConfirmWipe(true)}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-xs font-bold text-rose-300 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete All Device Data</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-900/80 border border-rose-500 text-xs space-y-2">
                <span className="font-bold text-white block">Permanently erase everything?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExecuteWipe}
                    className="px-3 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-500"
                  >
                    Confirm Wipe
                  </button>
                  <button
                    onClick={() => setConfirmWipe(false)}
                    className="px-3 py-1 rounded bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
