let Constants: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Constants = require('expo-constants');
} catch {
  Constants = undefined;
}

function fromConstants(path: string[]) {
  if (!Constants) return undefined;
  let obj = (Constants as any).manifest || (Constants as any).expoConfig || {};
  for (const p of path) {
    if (!obj) return undefined;
    obj = obj[p];
  }
  return obj;
}

const configuredApiUrl = fromConstants(['extra', 'API_URL']) || (global as any).API_URL;
const fallbackIp = 'http://192.168.0.102:3000';
export const API_URL = (configuredApiUrl || fallbackIp).toString().replace(/\/$/, '');

export const API_KEY = fromConstants(['extra', 'API_KEY']) || 'mi_clave_secreta_municipalidad_2024';

export default { API_URL, API_KEY };
