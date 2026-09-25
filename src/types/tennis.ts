export type SlotTime = string;

export type PlayerStatus = 
  | 'confirmed'     // Zusage / Dabei
  | 'pending'       // Noch unbestätigt
  | 'declined'      // Hat abgesagt
  | 'substitute'    // Ist als Springer eingesprungen
  | 'swapped';      // Hat den Slot getauscht

export type RoleInWeek = 
  | 'slot_18_19' 
  | 'slot_19_20' 
  | 'slot_20_21' 
  | 'springer_1' 
  | 'springer_2' 
  | 'frei';

export interface Player {
  id: string;
  name: string;
  shortName: string;
  avatarColor?: string;
  email?: string;
  phone?: string;
  pin?: string;
  isAdmin?: boolean;
  accessToken?: string;
}

export interface SlotAssignment {
  playerId: string;
  originalPlayerId?: string; // If substituted or swapped
  status: PlayerStatus;
  declineReason?: string;
  updatedAt?: string;
  isGuest?: boolean;
  guestName?: string;
}

export interface TrainingWeek {
  id: string; // e.g. "2026-10-05"
  dateString: string; // e.g. "05.10.2026"
  date: string; // ISO date string YYYY-MM-DD
  isCancelled?: boolean;
  cancelReason?: string; // e.g. "Ostermontag"
  startTime?: string; // e.g. "18:00"
  slotDurationMinutes?: number; // e.g. 60
  customDurations?: number[]; // Array of durations for each slot
  slots: Record<string, SlotAssignment[]>;
  springer1: {
    playerId: string;
    status: 'idle' | 'offered' | 'accepted' | 'declined';
  };
  springer2: {
    playerId: string;
    status: 'idle' | 'offered' | 'accepted' | 'declined';
  };
  frei: {
    playerId: string;
    status: 'idle' | 'offered' | 'accepted' | 'declined';
  };
  notes?: string;
  originalState?: {
    slots: Record<string, SlotAssignment[]>;
    springer1: { playerId: string; status: 'idle' | 'offered' | 'accepted' | 'declined' };
    springer2: { playerId: string; status: 'idle' | 'offered' | 'accepted' | 'declined' };
    frei: { playerId: string; status: 'idle' | 'offered' | 'accepted' | 'declined' };
  };
}

export interface Absence {
  id: string;
  playerId: string;
  date: string; // ISO date
  reason: string;
  createdAt: string;
}

export interface SwapRequest {
  id: string;
  weekId: string;
  fromPlayerId: string;
  fromSlot: SlotTime;
  targetSlot: SlotTime;
  targetPlayerId?: string; // Optional specific player or open to anyone in that slot
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
}

export interface ClubTheme {
  name: string;
  id: string;
  primary: string; // Hex e.g. "#1e40af"
  primaryContainer: string; // Hex e.g. "#dbeafe"
  onPrimary: string; // Hex e.g. "#ffffff"
  secondary: string;
  accent: string;
  clubName: string;
  logoText: string;
}
