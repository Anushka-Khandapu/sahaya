export type Language = 'en' | 'te';

export type ContactRelationship = 
  | 'Parent'
  | 'Sibling'
  | 'Friend'
  | 'Guardian'
  | 'Partner'
  | 'Teacher'
  | 'Colleague'
  | 'Doctor'
  | 'Other';

export type ContactPriority = 'primary' | 'secondary' | 'standard';

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: ContactRelationship;
  priority: ContactPriority;
  isGroupMember?: boolean;
  notes?: string;
  createdAt: number;
}

export interface EmergencyNumber {
  number: string;
  title: string;
  teluguTitle: string;
  description: string;
  teluguDescription: string;
  category: 'all' | 'police' | 'women' | 'child' | 'medical' | 'cyber' | 'elderly';
  isOfficial: boolean;
  badge?: string;
}

export type IncidentCategory =
  | 'Harassment'
  | 'Threat'
  | 'Stalking'
  | 'Online abuse'
  | 'Cyber fraud'
  | 'Suspicious activity'
  | 'Lost person'
  | 'Theft'
  | 'Other safety concern';

export interface IncidentEvidence {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
  timestamp: number;
}

export interface IncidentRecord {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  category: IncidentCategory;
  description: string;
  notes?: string;
  personsInvolved?: string; // Neutral language
  witnessInformation?: string;
  evidence: IncidentEvidence[];
  createdAt: number;
  synced?: boolean;
}

export interface SafeJourney {
  id: string;
  destination: string;
  startLocation?: string;
  startTime: number;
  expectedArrivalTime: number;
  trustedContactId?: string;
  transitMode: 'walking' | 'cab' | 'bus' | 'train' | 'personal_vehicle' | 'other';
  status: 'active' | 'completed' | 'delayed' | 'cancelled';
  lastCheckInTime?: number;
  notes?: string;
}

export interface UserProfile {
  name: string;
  phone?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  allergies?: string;
  emergencyNotes?: string;
  address?: string;
  passcodeEnabled?: boolean;
  passcode?: string;
}

export interface SafeZoneLocation {
  id: string;
  name: string;
  category: 'police' | 'hospital' | 'pharmacy' | 'transit' | 'women_safety';
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  isOpen24Hours: boolean;
  lastUpdated: string;
}

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number | null;
  error: string | null;
  isWatching: boolean;
}

export interface SOSEvent {
  id: string;
  timestamp: number;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  status: 'triggered' | 'cancelled' | 'resolved';
  pendingSync: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  isError?: boolean;
  isFallback?: boolean;
}

