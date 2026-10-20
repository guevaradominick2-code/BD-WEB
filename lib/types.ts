export type Role = "admin" | "girlfriend";
export type RevealStatus = "locked" | "revealed" | "completed";

export interface Viewer {
  id: string;
  role: Role;
  displayName: string;
  demo: boolean;
}

export interface AppSettings {
  celebrationId: string;
  girlfriendName: string;
  birthday: string;
  timezone: string;
  heroMessage: string;
  welcomeMessage: string;
  palette: {
    burgundy: string;
    blush: string;
    ivory: string;
    champagne: string;
    charcoal: string;
  };
}

export interface ExperienceEvent {
  id: string;
  title: string;
  teaser: string;
  category: string;
  startsAt: string;
  endsAt?: string | null;
  revealAt: string;
  status: RevealStatus;
  effectiveStatus: RevealStatus;
  clue?: string | null;
  location?: string | null;
  meetingTime?: string | null;
  dressCode?: string | null;
  bring?: string | null;
  details?: string | null;
  gratitude?: string | null;
  orderIndex: number;
}

export interface Surprise {
  id: string;
  name: string;
  label: string;
  revealAt: string;
  eventDate?: string | null;
  status: RevealStatus;
  effectiveStatus: RevealStatus;
  hint?: string | null;
  message?: string | null;
  imageUrl?: string | null;
  orderIndex: number;
}

export interface Memory {
  id: string;
  title: string;
  date?: string | null;
  place?: string | null;
  description: string;
  romanticNote: string;
  category: string;
  imageUrl: string;
  featured: boolean;
}

export interface LoveLetter {
  id: string;
  title: string;
  excerpt: string;
  body?: string | null;
  revealAt: string;
  status: "draft" | "published";
  unlocked: boolean;
  read: boolean;
  orderIndex: number;
}

export interface Mission {
  id: string;
  title: string;
  prompt: string;
  kind: "choice" | "guess" | "action";
  options?: string[];
  successMessage: string;
  completed: boolean;
}

export interface ExperienceData {
  settings: AppSettings;
  events: ExperienceEvent[];
  surprises: Surprise[];
  memories: Memory[];
  letters: LoveLetter[];
  missions: Mission[];
  reasons: string[];
}

export interface AdminData extends ExperienceData {
  stats: {
    events: number;
    pendingReveals: number;
    memories: number;
    publishedLetters: number;
  };
}
