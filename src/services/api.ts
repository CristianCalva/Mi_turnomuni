let Constants: any;
try {
  // Use require to avoid TypeScript/ES import errors when not running inside Expo
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Constants = require('expo-constants');
} catch (e) {
  Constants = null;
}

function detectHostFromExpo() {
  try {
    if (!Constants) return null;
    const manifest: any = (Constants as any).manifest || (Constants as any).expoConfig;
    const debuggerHost = manifest && (manifest.debuggerHost || manifest.packagerOpts?.host);
    if (debuggerHost) return debuggerHost.split(':')[0];
  } catch (e) {
    // ignore
  }
  return null;
}

const envUrl = (process.env as any)?.API_URL || (global as any)?.API_URL;
const detected = detectHostFromExpo();
// Fallbacks comunes para desarrollo
const FALLBACKS = [
  // Android emulator
  'http://10.0.2.2:3000',
  // localhost (simuladores iOS / web)
  'http://localhost:3000',
  // common LAN IP placeholder (user should override if different)
  'http://192.168.0.103:3000',
];

function chooseFallback() {
  // prefer detected host when available
  if (detected) return `http://${detected}:3000`;
  // prefer env override
  if (envUrl) return envUrl;
  // otherwise return first reachable fallback (we can't probe here reliably), so pick emulator then localhost
  return FALLBACKS[0] || FALLBACKS[1];
}

export const API_URL =  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.102:3000';
// Log the chosen API_URL to aid debugging in development
try {
  // eslint-disable-next-line no-console
  console.log('[MiTurnoMuni] API_URL =', API_URL);
} catch (e) {
  // ignore
}

export const apiFetch = async (
  endpoint: string,
  options?: RequestInit
) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => null);
    throw new Error(text || 'Error en la API');
  }

  return response.json();
};
