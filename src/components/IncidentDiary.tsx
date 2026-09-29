import React, { useState } from 'react';
import { IncidentRecord, IncidentCategory, IncidentEvidence, Language, LocationState } from '../types';
import { translations } from '../utils/translations';
import { storage } from '../utils/storage';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  Download,
  Trash2,
  X,
  Lock,
  Eye,
  AlertTriangle,
  Share2,
  ShieldCheck
} from 'lucide-react';

interface IncidentDiaryProps {
  location: LocationState;
  language: Language;
}

const CATEGORIES: IncidentCategory[] = [
  'Harassment',
  'Threat',
  'Stalking',
  'Online abuse',
  'Cyber fraud',
  'Suspicious activity',
  'Lost person',
  'Theft',
  'Other safety concern',
];

export const IncidentDiary: React.FC<IncidentDiaryProps> = ({ location, language }) => {
  const t = translations[language];
  const [incidents, setIncidents] = useState<IncidentRecord[]>(() => storage.getIncidents());
  const [isAdding, setIsAdding] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);

  // Form inputs
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [locationText, setLocationText] = useState(() => {
    if (location.latitude && location.longitude) {
      return `Lat: ${location.latitude.toFixed(5)}, Lng: ${location.longitude.toFixed(5)}`;
    }
    return '';
  });
  const [category, setCategory] = useState<IncidentCategory>('Harassment');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [personsInvolved, setPersonsInvolved] = useState('');
  const [witnessInformation, setWitnessInformation] = useState('');
  const [evidenceList, setEvidenceList] = useState<IncidentEvidence[]>([]);
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setLocationText(
      location.latitude && location.longitude
        ? `Lat: ${location.latitude.toFixed(5)}, Lng: ${location.longitude.toFixed(5)}`
        : ''
    );
    setCategory('Harassment');
    setDescription('');
    setNotes('');
    setPersonsInvolved('');
    setWitnessInformation('');
    setEvidenceList([]);
    setError('');
    setIsAdding(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const item: IncidentEvidence = {
            id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: file.name,
            type: file.type,
            dataUrl,
            timestamp: Date.now(),
          };
          setEvidenceList((prev) => [...prev, item]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and incident description.');
      return;
    }

    const saved = storage.saveIncident({
      title: title.trim(),
      date,
      time,
      location: locationText.trim() || 'Unspecified location',
      latitude: location.latitude || undefined,
      longitude: location.longitude || undefined,
      category,
      description: description.trim(),
      notes: notes.trim() || undefined,
      personsInvolved: personsInvolved.trim() || undefined,
      witnessInformation: witnessInformation.trim() || undefined,
      evidence: evidenceList,
    });

    setIncidents(storage.getIncidents());
    resetForm();
    setSelectedIncident(saved);
  };

  const handleDelete = (id: string) => {
    const updated = storage.deleteIncident(id);
    setIncidents(updated);
    if (selectedIncident?.id === id) {
      setSelectedIncident(null);
    }
  };

  // Export structured incident report as downloadable text/docket
  const handleExportIncident = (rec: IncidentRecord) => {
    const docketText = `================================================
SAHAYA OFFICIAL INCIDENT RECORD DOCKET
Generated: ${new Date().toLocaleString()}
Document ID: ${rec.id}
================================================

TITLE: ${rec.title}
CATEGORY: ${rec.category}
DATE & TIME: ${rec.date} at ${rec.time}
LOCATION: ${rec.location}
${rec.latitude && rec.longitude ? `GPS COORDINATES: ${rec.latitude}, ${rec.longitude}` : ''}

INCIDENT SUMMARY & DESCRIPTION:
${rec.description}

DETAILS OF PERSON(S) INVOLVED:
${rec.personsInvolved || 'None stated'}

WITNESS INFORMATION:
${rec.witnessInformation || 'None recorded'}

ADDITIONAL NOTES:
${rec.notes || 'None'}

ATTACHED EVIDENCE PIECES: ${rec.evidence.length} item(s)
${rec.evidence.map((ev, i) => `[${i + 1}] ${ev.name} (${ev.type})`).join('\n')}

================================================
LEGAL & SAFETY NOTICE:
This record was logged voluntarily on the user's personal device using the SAHAYA Offline Safety Platform. It contains neutral documentation maintained for personal safety, reporting to police (112), cybercrime authorities (1930), or legal counsel.
================================================`;

    const blob = new Blob([docketText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SAHAYA_Incident_${rec.date}_${rec.id.slice(-6)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t.myIncidents}</h2>
            <p className="text-xs text-slate-400">
              {t.recordVoluntarily}
            </p>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newIncident}</span>
          </button>
        )}
      </div>

      {/* Neutral Language Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <p>
          {t.neutralDisclosure} Entries are kept private on this device and are never automatically shared with any server.
        </p>
      </div>

      {/* Record Creation Form */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="bg-slate-900 border-2 border-purple-500/40 p-5 sm:p-6 rounded-3xl space-y-4 shadow-2xl text-white"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-purple-300">{t.newIncident}</h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Incident Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unsolicited stalking near metro gate"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.date}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.time}
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.location}
              </label>
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="Bus Stop / Address"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.description} *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the facts neutrally: what happened, sequence of events, verbatim words spoken..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.personsInvolved} (Neutral)
              </label>
              <input
                type="text"
                value={personsInvolved}
                onChange={(e) => setPersonsInvolved(e.target.value)}
                placeholder="Physical descriptors, clothing, vehicle plate if seen"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.witnessInfo}
              </label>
              <input
                type="text"
                value={witnessInformation}
                onChange={(e) => setWitnessInformation(e.target.value)}
                placeholder="Shopkeeper, co-passenger, security personnel"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Evidence Attachments */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-slate-300">
              {t.evidence} (Stored locally only)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-purple-300 cursor-pointer transition">
                <ImageIcon className="w-4 h-4" />
                <span>{t.addPhoto}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-400">
                {evidenceList.length} evidence file(s) attached
              </span>
            </div>

            {evidenceList.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {evidenceList.map((ev) => (
                  <div key={ev.id} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-800 h-24">
                    <img src={ev.dataUrl} alt={ev.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(ev.id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition"
            >
              Save Incident Record
            </button>
          </div>
        </form>
      )}

      {/* Incidents List */}
      <div className="space-y-3">
        {incidents.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="font-bold text-sm text-slate-300">No Incidents Recorded</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your diary is currently empty. Any entries recorded here stay completely confidential on your device.
            </p>
          </div>
        ) : (
          incidents.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-base">{item.title}</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {item.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {item.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportIncident(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition"
                    title="Export text docket"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>Export Docket</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                {item.description}
              </p>

              {(item.personsInvolved || item.witnessInformation) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                  {item.personsInvolved && (
                    <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <strong className="text-slate-300 block mb-0.5">Person(s) Involved:</strong>
                      {item.personsInvolved}
                    </div>
                  )}
                  {item.witnessInformation && (
                    <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <strong className="text-slate-300 block mb-0.5">Witness Details:</strong>
                      {item.witnessInformation}
                    </div>
                  )}
                </div>
              )}

              {item.evidence && item.evidence.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Attached Evidence ({item.evidence.length}):
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {item.evidence.map((ev) => (
                      <img
                        key={ev.id}
                        src={ev.dataUrl}
                        alt={ev.name}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
