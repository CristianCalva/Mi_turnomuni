import AsyncStorage from '@react-native-async-storage/async-storage';

// ========================================
// 🔹 URL BASE DE TU BACKEND
// ⚠️ CAMBIA ESTA IP POR LA QUE TE SALE EN ipconfig
// ========================================
export const API_URL = "http://192.168.100.24:3000";


// ========================================
// 🔹 FUNCIÓN AUXILIAR PARA PETICIONES HTTP
// ========================================
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status} - ${text}`);
    }

    return response.json();
  } catch (error: any) {
    console.error("❌ Error en apiFetch:", error.message);
    throw error;
  }
};


// ========================================
// 🔹 INTERFACES PARA FERIADOS
// ========================================
export interface Holiday {
  id: string;
  fecha: string;           // YYYY-MM-DD
  nombreLocal: string;
  nombreIngles: string;
  esNacional: boolean;
  tipo: string;
  afectaAgendamientos: boolean;
}

interface FeriadosResponse {
  success: boolean;
  data: Holiday[];
  meta: {
    total: number;
    anio: string;
    pais: string;
    actualizado: string;
  };
  error?: string;
}


// ========================================
// 🔹 SERVICIO DE FERIADOS
// ========================================
export const HolidayService = {

  getHolidays: async (): Promise<Holiday[]> => {
    try {
      // 1️⃣ Intentar obtener desde caché
      const cached = await AsyncStorage.getItem('@feriados_2026');

      if (cached) {
        const { data, timestamp } = JSON.parse(cached);

        if (Date.now() - timestamp < 3600000) {
          console.log('📦 Usando feriados desde caché');
          return data as Holiday[];
        }
      }

      // 2️⃣ Petición a TU backend
      const response = await apiFetch('/api/feriados', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'mi_clave_secreta_municipalidad_2024'
        }
      });

      const feriadosResponse = response as FeriadosResponse;

      if (!feriadosResponse.success) {
        throw new Error(feriadosResponse.error || 'Error en respuesta del servidor');
      }

      // 3️⃣ Guardar en caché
      await AsyncStorage.setItem('@feriados_2026', JSON.stringify({
        data: feriadosResponse.data,
        timestamp: Date.now()
      }));

      return feriadosResponse.data;

    } catch (error: any) {
      console.error('❌ Error obteniendo feriados:', error.message);
      throw error;
    }
  },

  getHolidaysAffectingAppointments: (holidays: Holiday[]): Holiday[] => {
    return holidays.filter(h => h.afectaAgendamientos);
  },

  isHoliday: (holidays: Holiday[], fecha: string | Date): boolean => {
    const fechaStr = fecha instanceof Date
      ? fecha.toISOString().split('T')[0]
      : fecha;

    return holidays.some(h => h.fecha === fechaStr);
  }
};