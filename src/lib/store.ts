import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { User, Preference } from './supabase';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  dbUser: User | null;
  preferences: Preference[];
  loading: boolean;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setDbUser: (user: User | null) => void;
  setPreferences: (preferences: Preference[]) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  dbUser: null,
  preferences: [],
  loading: true,
  setFirebaseUser: (user) => set({ firebaseUser: user }),
  setDbUser: (user) => set({ dbUser: user }),
  setPreferences: (preferences) => set({ preferences }),
  setLoading: (loading) => set({ loading }),
  clearAuth: () => set({ firebaseUser: null, dbUser: null, preferences: [], loading: false }),
}));
