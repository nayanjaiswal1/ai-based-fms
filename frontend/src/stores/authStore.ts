import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  subscriptionTier: string;
  twoFactorEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: User) => void;
  setUser: (user: User | null) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => void;
}

// Store is now in-memory only - tokens are stored in httpOnly cookies
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  setAuth: (user) =>
    set({ user, isAuthenticated: true, isInitialized: true }),
  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isInitialized: true }),
  setInitialized: (initialized) =>
    set({ isInitialized: initialized }),
  logout: () =>
    set({ user: null, isAuthenticated: false }),
}));
