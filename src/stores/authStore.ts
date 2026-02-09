import { create } from 'zustand';

export type User = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string;
  ventanillaId?: string; // para funcionarios: ventanilla/oficina asignada
};

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: (token, user) =>
    set({ token, user, isAuthenticated: true }),

  logout: () =>
    set({ token: null, user: null, isAuthenticated: false }),
  updateProfile: (updates: Partial<User>) =>
    set((state) => ({ user: state.user ? { ...state.user, ...updates } : state.user })),
}));
