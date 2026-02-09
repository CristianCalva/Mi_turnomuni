import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

/* =======================
   TIPOS
======================= */

export type Turno = {
  id: string;
  tramite: string;
  fecha: string;
  hora: string;
  numero?: number;
  estado?: 'PENDIENTE' | 'CONFIRMADO' | 'COMPLETADO' | 'CANCELADO';
  propietarioId?: string; // id del ciudadano propietario del turno
  ventanillaId?: string; // id de la ventanilla/oficina asignada (si aplica)
};

/* =======================
   ESTADO
======================= */

type TurnosState = {
  turnos: Turno[];
  agregarTurno: (turno: Turno) => void;
  cancelarTurno: (id: string) => void;
  actualizarTurno: (id: string, patch: Partial<Turno>) => void;
  setTurnos: (turnos: Turno[]) => void;
};

/* =======================
   STORE
======================= */

export const useTurnosStore = create<TurnosState>()(
  persist(
    (set) => ({
      turnos: [],
      agregarTurno: (turno) =>
        set((state) => ({
          turnos: [...state.turnos, turno],
        })),
      cancelarTurno: (id) =>
        set((state) => ({
          turnos: state.turnos.map((t) => (t.id === id ? { ...t, estado: 'CANCELADO' } : t)),
        })),
      actualizarTurno: (id, patch) =>
        set((state) => ({
          turnos: state.turnos.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      setTurnos: (turnos) => set(() => ({ turnos })),
    }),
    {
      name: 'turnos-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
