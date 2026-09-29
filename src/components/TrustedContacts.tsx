import React, { useState } from 'react';
import { TrustedContact, ContactRelationship, ContactPriority, Language } from '../types';
import { translations } from '../utils/translations';
import { storage } from '../utils/storage';
import {
  Users,
  Plus,
  Phone,
  MessageSquare,
  Edit2,
  Trash2,
  Star,
  Check,
  X,
  Shield,
  HeartHandshake
} from 'lucide-react';

interface TrustedContactsProps {
  contacts: TrustedContact[];
  onContactsChange: (contacts: TrustedContact[]) => void;
  language: Language;
}

const RELATIONSHIPS: ContactRelationship[] = [
  'Parent',
  'Partner',
  'Sibling',
  'Guardian',
  'Friend',
  'Teacher',
  'Colleague',
  'Doctor',
  'Other',
];

export const TrustedContacts: React.FC<TrustedContactsProps> = ({
  contacts,
  onContactsChange,
  language,
}) => {
  const t = translations[language];
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState<ContactRelationship>('Parent');
  const [priority, setPriority] = useState<ContactPriority>('standard');
  const [isGroupMember, setIsGroupMember] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setPhone('');
    setRelationship('Parent');
    setPriority('standard');
    setIsGroupMember(true);
    setNotes('');
    setError('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (contact: TrustedContact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship);
    setPriority(contact.priority);
    setIsGroupMember(contact.isGroupMember ?? true);
    setNotes(contact.notes || '');
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please provide both name and phone number.');
      return;
    }

    // Clean phone number (strip whitespace)
    const cleanPhone = phone.replace(/[\s-]/g, '');

    if (editingId) {
      const updated = storage.updateContact(editingId, {
        name: name.trim(),
        phone: cleanPhone,
        relationship,
        priority,
        isGroupMember,
        notes: notes.trim(),
      });
      onContactsChange(updated);
    } else {
      storage.addContact({
        name: name.trim(),
        phone: cleanPhone,
        relationship,
        priority,
        isGroupMember,
        notes: notes.trim(),
      });
      onContactsChange(storage.getContacts());
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = storage.deleteContact(id);
    onContactsChange(updated);
  };

  const primaryContact = contacts.find((c) => c.priority === 'primary');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t.trustedContacts}</h2>
            <p className="text-xs text-slate-400">
              Notify loved ones instantly during distress. Stored securely on your device.
            </p>
          </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addContact}</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal or Card */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="bg-slate-900 border-2 border-rose-500/40 p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl text-white"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-rose-300">
              {editingId ? t.editContact : t.addContact}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.name} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.phoneNumber} *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.relationship}
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as ContactRelationship)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.priority}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ContactPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
              >
                <option value="primary">{t.primary}</option>
                <option value="secondary">{t.secondary}</option>
                <option value="standard">{t.standard}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lives nearby / Night contact"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="groupCheck"
              checked={isGroupMember}
              onChange={(e) => setIsGroupMember(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-rose-600 focus:ring-rose-500 w-4 h-4"
            />
            <label htmlFor="groupCheck" className="text-xs text-slate-300 cursor-pointer">
              Include in Emergency Group Broadcast
            </label>
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition"
            >
              <Check className="w-4 h-4" />
              <span>{t.saveContact}</span>
            </button>
          </div>
        </form>
      )}

      {/* Contacts List */}
      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <HeartHandshake className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400 max-w-sm mx-auto">{t.noContacts}</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 rounded-2xl bg-slate-900 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                contact.priority === 'primary'
                  ? 'border-rose-500/60 shadow-lg shadow-rose-950/20'
                  : contact.priority === 'secondary'
                  ? 'border-amber-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    contact.priority === 'primary'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                      : contact.priority === 'secondary'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {contact.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-base">{contact.name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {contact.relationship}
                    </span>
                    {contact.priority === 'primary' && (
                      <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                        <Star className="w-3 h-3 fill-rose-300 text-rose-300" />
                        Primary SOS
                      </span>
                    )}
                    {contact.priority === 'secondary' && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                        Secondary
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {contact.phone}
                    {contact.notes && (
                      <span className="text-slate-500 ml-2 italic">({contact.notes})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition"
                  title="Call contact immediately"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t.callNow}</span>
                </a>

                <a
                  href={`sms:${contact.phone}?body=${encodeURIComponent(
                    `SAHAYA Safety Check-In: I am updating you on my current safety status.`
                  )}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 text-xs font-bold transition"
                  title="Send prefilled SMS"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>SMS</span>
                </a>

                <button
                  onClick={() => handleStartEdit(contact)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Edit contact"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Delete contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Primary contact notice */}
      {primaryContact && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-300">Fast SOS Routing: </strong>
            During emergency SOS activation, <strong>{primaryContact.name}</strong> will be prioritized for immediate 1-tap dial and SMS broadcast along with national emergency services.
          </div>
        </div>
      )}
    </div>
  );
};
