import { TrustedContact, IncidentRecord, SafeJourney, UserProfile, SOSEvent } from '../types';

const CONTACTS_KEY = 'sahaya_trusted_contacts';
const INCIDENTS_KEY = 'sahaya_incidents';
const JOURNEYS_KEY = 'sahaya_journeys';
const PROFILE_KEY = 'sahaya_profile';
const SOS_LOGS_KEY = 'sahaya_sos_logs';
const SETTINGS_KEY = 'sahaya_settings';

// Default emergency contacts to get the user started if empty
export const DEFAULT_CONTACTS: TrustedContact[] = [
  {
    id: 'sample-1',
    name: 'Primary Family Guardian',
    phone: '9876543210',
    relationship: 'Parent',
    priority: 'primary',
    isGroupMember: true,
    notes: 'Home Landline & Mobile',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'sample-2',
    name: 'Emergency Friend / Partner',
    phone: '9123456789',
    relationship: 'Friend',
    priority: 'secondary',
    isGroupMember: true,
    notes: 'Lives in the same city',
    createdAt: Date.now() - 86400000,
  }
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Citizen',
  bloodGroup: 'O+',
  medicalConditions: 'None',
  emergencyNotes: 'Carries inhaler in bag',
  passcodeEnabled: false,
};

export const storage = {
  // Contacts
  getContacts: (): TrustedContact[] => {
    try {
      const data = localStorage.getItem(CONTACTS_KEY);
      if (!data) {
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(DEFAULT_CONTACTS));
        return DEFAULT_CONTACTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CONTACTS;
    }
  },

  saveContacts: (contacts: TrustedContact[]) => {
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to save contacts', e);
    }
  },

  addContact: (contact: Omit<TrustedContact, 'id' | 'createdAt'>): TrustedContact => {
    const contacts = storage.getContacts();
    const newContact: TrustedContact = {
      ...contact,
      id: 'contact_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
    };
    // If set as primary, demote any other existing primary
    let updated = contacts;
    if (newContact.priority === 'primary') {
      updated = updated.map(c => c.priority === 'primary' ? { ...c, priority: 'secondary' as const } : c);
    }
    updated.push(newContact);
    storage.saveContacts(updated);
    return newContact;
  },

  updateContact: (id: string, updates: Partial<TrustedContact>) => {
    let contacts = storage.getContacts();
    if (updates.priority === 'primary') {
      contacts = contacts.map(c => c.id !== id && c.priority === 'primary' ? { ...c, priority: 'secondary' as const } : c);
    }
    contacts = contacts.map(c => c.id === id ? { ...c, ...updates } : c);
    storage.saveContacts(contacts);
    return contacts;
  },

  deleteContact: (id: string) => {
    const contacts = storage.getContacts().filter(c => c.id !== id);
    storage.saveContacts(contacts);
    return contacts;
  },

  // Incidents
  getIncidents: (): IncidentRecord[] => {
    try {
      const data = localStorage.getItem(INCIDENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveIncident: (incident: Omit<IncidentRecord, 'id' | 'createdAt'>): IncidentRecord => {
    const incidents = storage.getIncidents();
    const record: IncidentRecord = {
      ...incident,
      id: 'inc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
      synced: false
    };
    incidents.unshift(record);
    try {
      localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));
    } catch (e) {
      console.error('Failed to save incident', e);
    }
    return record;
  },

  deleteIncident: (id: string) => {
    const incidents = storage.getIncidents().filter(i => i.id !== id);
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));
    return incidents;
  },

  // Journeys
  getActiveJourney: (): SafeJourney | null => {
    try {
      const data = localStorage.getItem(JOURNEYS_KEY);
      if (!data) return null;
      const journeys: SafeJourney[] = JSON.parse(data);
      const active = journeys.find(j => j.status === 'active' || j.status === 'delayed');
      return active || null;
    } catch {
      return null;
    }
  },

  saveJourney: (journey: SafeJourney) => {
    try {
      const data = localStorage.getItem(JOURNEYS_KEY);
      const journeys: SafeJourney[] = data ? JSON.parse(data) : [];
      const index = journeys.findIndex(j => j.id === journey.id);
      if (index >= 0) {
        journeys[index] = journey;
      } else {
        journeys.unshift(journey);
      }
      localStorage.setItem(JOURNEYS_KEY, JSON.stringify(journeys));
    } catch (e) {
      console.error('Failed to save journey', e);
    }
  },

  getAllJourneys: (): SafeJourney[] => {
    try {
      const data = localStorage.getItem(JOURNEYS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // SOS logs
  logSOSEvent: (event: Omit<SOSEvent, 'id'>): SOSEvent => {
    try {
      const data = localStorage.getItem(SOS_LOGS_KEY);
      const logs: SOSEvent[] = data ? JSON.parse(data) : [];
      const newEvent: SOSEvent = {
        ...event,
        id: 'sos_' + Date.now()
      };
      logs.unshift(newEvent);
      localStorage.setItem(SOS_LOGS_KEY, JSON.stringify(logs));
      return newEvent;
    } catch {
      return { ...event, id: 'sos_' + Date.now() };
    }
  },

  getSOSLogs: (): SOSEvent[] => {
    try {
      const data = localStorage.getItem(SOS_LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  markSOSLogsSynced: () => {
    try {
      const logs = storage.getSOSLogs().map(l => ({ ...l, pendingSync: false }));
      localStorage.setItem(SOS_LOGS_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  },

  // User Profile
  getProfile: (): UserProfile => {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile: (profile: Partial<UserProfile>) => {
    try {
      const current = storage.getProfile();
      const updated = { ...current, ...profile };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save profile', e);
      return DEFAULT_PROFILE;
    }
  },

  // Clear all data (emergency wipe)
  clearAllData: () => {
    localStorage.removeItem(CONTACTS_KEY);
    localStorage.removeItem(INCIDENTS_KEY);
    localStorage.removeItem(JOURNEYS_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(SOS_LOGS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  }
};
