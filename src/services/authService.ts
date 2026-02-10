import { API_URL } from './api';
const BASE = API_URL;

async function tryPostPaths(paths: string[], body: any) {
  const results: Array<{ path: string; ok: boolean; status?: number; bodyText?: string; json?: any; error?: string }> = [];

  for (const p of paths) {
    try {
      const res = await fetch(p, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let json: any = undefined;
      try {
        json = JSON.parse(text);
      } catch (e) {
        // not JSON
      }

      results.push({ path: p, ok: res.ok, status: res.status, bodyText: text, json });
      if (res.ok) return { success: true, result: results[results.length - 1] };
    } catch (err: any) {
      results.push({ path: p, ok: false, error: String(err) });
    }
  }

  return { success: false, result: results };
}

export const login = async (email: string, password: string) => {
  const candidatePaths = [
    `${BASE}/api/auth/login`,
    `${BASE}/auth/login`,
    `${BASE}/login`,
  ];

  const attempt = await tryPostPaths(candidatePaths, { email, password });

  if (!attempt.success) {
    const summary = (attempt.result as any[])
      .map((r) => `${r.path} -> ${r.ok ? r.status : r.error || 'ERR'}`)
      .join(' | ');
    throw new Error(`Login fallido. Intentos: ${summary}`);
  }

  const data = (attempt.result as any).json ?? JSON.parse((attempt.result as any).bodyText || '{}');
  // Map backend `user` (role_id) to frontend shape { id, nombre, email, rol }
  if (data.user) {
    const mapped = {
      id: String(data.user.id),
      nombre: data.user.nombre,
      email: data.user.email,
      telefono: data.user.telefono || data.user.phone || data.user.celular || data.user.telefono_celular || undefined,
      rol: data.user.role_name
        ? data.user.role_name
        : data.user.role_id
        ? 'FUNCIONARIO'
        : 'CIUDADANO',
    };
    return { token: data.token, user: mapped };
  }

  return data;
};

export const register = async (
  cedula: string,
  nombre: string,
  email: string,
  password: string,
  rol: 'CIUDADANO' | 'FUNCIONARIO' = 'CIUDADANO',
  telefono?: string
) => {
  // role_id left null by default; backend may map role later
  const payload: any = { cedula, nombre, email, password, role: rol, telefono };
  // opcional: si prefieres enviar role_id en lugar de `role`, descomenta y ajusta:
  // if (rol === 'FUNCIONARIO') payload.role_id = 1;

  // Try register on the common paths as well
  const paths = [`${BASE}/api/auth/register`, `${BASE}/auth/register`, `${BASE}/register`];
  const attempt = await tryPostPaths(paths, payload);
  if (!attempt.success) {
    const summary = (attempt.result as any[])
      .map((r) => `${r.path} -> ${r.ok ? r.status : r.error || 'ERR'}`)
      .join(' | ');
    throw new Error(`Registro fallido. Intentos: ${summary}`);
  }

  const data = (attempt.result as any).json ?? JSON.parse((attempt.result as any).bodyText || '{}');
  if (data.user) {
    const mapped = {
      id: String(data.user.id),
      nombre: data.user.nombre,
      email: data.user.email,
      telefono: data.user.telefono || data.user.phone || data.user.celular || data.user.telefono_celular || undefined,
      rol: data.user.role_name
        ? data.user.role_name
        : data.user.role_id
        ? 'FUNCIONARIO'
        : 'CIUDADANO',
    };
    return { token: data.token, user: mapped };
  }

  return data;
};

export const recoverRequest = async (email: string) => {
  const paths = [`${BASE}/api/auth/recover-request`, `${BASE}/auth/recover-request`, `${BASE}/recover-request`];
  const attempt = await tryPostPaths(paths, { email });
  if (!attempt.success) {
    const summary = (attempt.result as any[])
      .map((r) => `${r.path} -> ${r.ok ? r.status : r.error || 'ERR'}`)
      .join(' | ');
    throw new Error(`Error al solicitar recuperación. Intentos: ${summary}`);
  }

  return (attempt.result as any).json ?? JSON.parse((attempt.result as any).bodyText || '{}');
};

export const recoverReset = async (token: string, newPassword: string) => {
  const paths = [`${BASE}/api/auth/recover-reset`, `${BASE}/auth/recover-reset`, `${BASE}/recover-reset`];
  const attempt = await tryPostPaths(paths, { token, newPassword });
  if (!attempt.success) {
    const summary = (attempt.result as any[])
      .map((r) => `${r.path} -> ${r.ok ? r.status : r.error || 'ERR'}`)
      .join(' | ');
    throw new Error(`Error al restablecer contraseña. Intentos: ${summary}`);
  }

  return (attempt.result as any).json ?? JSON.parse((attempt.result as any).bodyText || '{}');
};

export const checkEmailExists = async (email: string) => {
  const paths = [`${BASE}/api/auth/check-email`, `${BASE}/auth/check-email`, `${BASE}/check-email`];
  try {
    const attempt = await tryPostPaths(paths, { email });
    if (!attempt.success) return false;
    const data = (attempt.result as any).json ?? JSON.parse((attempt.result as any).bodyText || '{}');
    // backend may return { exists: true } or user object
    if (data && (data.exists === true || data.user)) return true;
    return false;
  } catch (e) {
    return false;
  }
};
