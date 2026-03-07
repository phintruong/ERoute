import { create } from 'zustand';
import { VitalsPayload, TriageResponse, UserProfile } from '../../../shared/types';

interface AppState {
  // Auth
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Vitals (current session)
  vitals: VitalsPayload | null;
  setVitals: (vitals: VitalsPayload) => void;

  // Triage result (current session)
  triageResult: TriageResponse | null;
  setTriageResult: (result: TriageResponse) => void;

  // Settings
  language: string;
  setLanguage: (lang: string) => void;

  // Reset session
  resetSession: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  vitals: null,
  setVitals: (vitals) => set({ vitals }),

  triageResult: null,
  setTriageResult: (triageResult) => set({ triageResult }),

  language: 'en',
  setLanguage: (language) => set({ language }),

  resetSession: () => set({ vitals: null, triageResult: null }),
}));
