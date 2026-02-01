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
};

/* =======================
   ESTADO
======================= */

type TurnosState = {
  turnos: Turno[];
  agregarTurno: (turno: Turno) => void;
  cancelarTurno: (id: string) => void;
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
          turnos: state.turnos.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'turnos-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
