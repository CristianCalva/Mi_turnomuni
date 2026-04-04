import { API_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  // Debug: persist raw login response for inspection (remove in production)
  try { await AsyncStorage.setItem('@debug_last_login_response', JSON.stringify(attempt.result)); } catch (e) { /* ignore */ }
  // Map backend `user` (role_id) to frontend shape { id, nombre, email, rol }
  if (data.user) {
    // Use profile endpoint as authoritative source when possible (backend may return incomplete role in login)
    let userData: any = data.user;
    // Normalize role fields from various backend shapes
    let roleNameRaw: any = undefined;
    let roleId: any = undefined;
    const normalizeFrom = (u: any) => {
      if (!u) return;
      // basic name fields (if role is a string)
      roleNameRaw = roleNameRaw || u.role_name || u.roleName || u.rol || (typeof u.role === 'string' ? u.role : undefined);
      // prefer explicit role_id/roleId; DO NOT use the user's `id` as role id fallback
      roleId = roleId ?? (u.role_id ?? u.roleId ?? (typeof u.role === 'number' ? u.role : undefined));

      // If roles is an array, try to find a role object indicating FUNCIONARIO (id===2 or name includes 'FUNCION')
      if (Array.isArray(u.roles) && u.roles.length > 0) {
        const objRole = u.roles.find((r: any) => r && typeof r === 'object' && (Number(r.id) === 2 || String(r.name || r.role_name || r.role || r.rol || '').toUpperCase().includes('FUNCION')));
        if (objRole) {
          roleNameRaw = roleNameRaw || objRole.name || objRole.role_name || objRole.role || objRole.rol;
          roleId = roleId ?? (objRole.id ?? objRole.role_id ?? objRole.roleId);
        } else {
          const r0 = u.roles[0];
          if (r0 && typeof r0 === 'object') {
            roleNameRaw = roleNameRaw || r0.name || r0.role_name || r0.role || r0.rol;
            roleId = roleId ?? (r0.id ?? r0.role_id ?? r0.roleId);
          } else if (typeof r0 === 'number') {
            roleId = roleId ?? r0;
          }
        }
      }

      // If role is an object, prefer its fields
      if (u.role && typeof u.role === 'object') {
        roleNameRaw = roleNameRaw || u.role.name || u.role.role_name || u.role.role || u.role.rol;
        roleId = roleId ?? (u.role.id ?? u.role.role_id ?? u.role.roleId);
      }
    };
    normalizeFrom(userData);

    if (data.token) {
      const profilePaths = [`${BASE}/api/auth/me`, `${BASE}/auth/me`, `${BASE}/me`];
      for (const p of profilePaths) {
        try {
          const res = await fetch(p, { headers: { Authorization: `Bearer ${data.token}` } });
          if (!res.ok) continue;
          const text = await res.text();
          let json: any = undefined;
          try { json = JSON.parse(text); } catch (e) { json = undefined; }
          const candidate = json?.user ?? json ?? undefined;
          if (candidate) {
            // overwrite userData with authoritative profile
            // eslint-disable-next-line no-console
            console.log('[DEBUG] profile candidate from', p, candidate);
            userData = candidate;
            normalizeFrom(candidate);
            break;
          }
        } catch (e) {
          // ignore and try next
        }
      }
    }
    // Default role when backend does not provide role info
    let resolvedRole = 'CIUDADANO';
    if (roleNameRaw) {
      const rn = String(roleNameRaw).trim().toUpperCase();
      if (rn.includes('FUNCION')) resolvedRole = 'FUNCIONARIO';
      else resolvedRole = rn === 'CIUDADANO' ? 'CIUDADANO' : rn;
    } else if (typeof roleId !== 'undefined' && roleId !== null) {
      // Convención en la base: role_id === 1 -> CIUDADANO, role_id === 2 -> FUNCIONARIO
      resolvedRole = Number(roleId) === 2 ? 'FUNCIONARIO' : 'CIUDADANO';
    }

    // Debug: show resolved role and raw candidates
    // eslint-disable-next-line no-console
    console.log('[DEBUG] role resolution (login):', { roleId, roleNameRaw, resolvedRole, userData });

    const mapped = {
      id: String(userData.id),
      nombre: userData.nombre,
      email: userData.email,
      telefono: userData.telefono || userData.phone || userData.celular || userData.telefono_celular || undefined,
      rol: resolvedRole,
    };
    return { token: data.token, user: mapped };
  }

  return data;
};

// Fetch profile using token and map to frontend user shape
export const fetchProfile = async (token: string) => {
  const profilePaths = [`${BASE}/api/auth/me`, `${BASE}/auth/me`, `${BASE}/me`];
  for (const p of profilePaths) {
    try {
      const res = await fetch(p, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) continue;
      const text = await res.text();
      let json: any = undefined;
      try { json = JSON.parse(text); } catch (e) { json = undefined; }
      const userData = json?.user ?? json ?? undefined;
      if (!userData) continue;

      // Normalize role fields from various backend shapes
      let roleNameRaw: any = undefined;
      let roleId: any = undefined;
      const normalizeFrom = (u: any) => {
        if (!u) return;
        // basic name fields (if role is a string)
        roleNameRaw = roleNameRaw || u.role_name || u.roleName || u.rol || (typeof u.role === 'string' ? u.role : undefined);
        // prefer explicit role_id/roleId; DO NOT use the user's `id` as role id fallback
        roleId = roleId ?? (u.role_id ?? u.roleId ?? (typeof u.role === 'number' ? u.role : undefined));

        // If roles is an array, try to find a role object indicating FUNCIONARIO (id===2 or name includes 'FUNCION')
        if (Array.isArray(u.roles) && u.roles.length > 0) {
          const objRole = u.roles.find((r: any) => r && typeof r === 'object' && (Number(r.id) === 2 || String(r.name || r.role_name || r.role || r.rol || '').toUpperCase().includes('FUNCION')));
          if (objRole) {
            roleNameRaw = roleNameRaw || objRole.name || objRole.role_name || objRole.role || objRole.rol;
            roleId = roleId ?? (objRole.id ?? objRole.role_id ?? objRole.roleId);
          } else {
            const r0 = u.roles[0];
            if (r0 && typeof r0 === 'object') {
              roleNameRaw = roleNameRaw || r0.name || r0.role_name || r0.role || r0.rol;
              roleId = roleId ?? (r0.id ?? r0.role_id ?? r0.roleId);
            } else if (typeof r0 === 'number') {
              roleId = roleId ?? r0;
            }
          }
        }

        // If role is an object, prefer its fields
        if (u.role && typeof u.role === 'object') {
          roleNameRaw = roleNameRaw || u.role.name || u.role.role_name || u.role.role || u.role.rol;
          roleId = roleId ?? (u.role.id ?? u.role.role_id ?? u.role.roleId);
        }
      };
      normalizeFrom(userData);
      // Prefer numeric role id when available; otherwise use role name heuristics
      let resolvedRole = 'CIUDADANO';
      if (typeof roleId !== 'undefined' && roleId !== null) {
        resolvedRole = Number(roleId) === 2 ? 'FUNCIONARIO' : 'CIUDADANO';
      } else if (roleNameRaw) {
        const rn = String(roleNameRaw).trim().toUpperCase();
        if (rn.includes('FUNCION')) resolvedRole = 'FUNCIONARIO';
        else resolvedRole = rn === 'CIUDADANO' ? 'CIUDADANO' : rn;
      }
      // Debug
      // eslint-disable-next-line no-console
      console.log('[DEBUG] role resolution:', { roleId, roleNameRaw, resolvedRole });

      return {
        id: String(userData.id),
        nombre: userData.nombre,
        email: userData.email,
        telefono: userData.telefono || userData.phone || userData.celular || userData.telefono_celular || undefined,
        rol: resolvedRole,
      };
    } catch (e) {
      // continue
    }
  }
  return null;
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
  // No enviar `role_id` por defecto: el backend debe resolver/crear el role
  // a partir del nombre `role`. Enviar `role_id` puede forzar un id
  // incorrecto si la numeración difiere entre ambientes.

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
  // Debug: persist raw register response for inspection (remove in production)
  try { await AsyncStorage.setItem('@debug_last_register_response', JSON.stringify(attempt.result)); } catch (e) { /* ignore */ }
  if (data.user) {
    // Normalize role fields from various backend shapes
    const ud = data.user;
    let roleNameRaw: any = undefined;
    let roleId: any = undefined;
    const normalizeFrom = (u: any) => {
      if (!u) return;
      // basic name fields (if role is a string)
      roleNameRaw = roleNameRaw || u.role_name || u.roleName || u.rol || (typeof u.role === 'string' ? u.role : undefined);
      // prefer explicit role_id/roleId; DO NOT use the user's `id` as role id fallback
      roleId = roleId ?? (u.role_id ?? u.roleId ?? (typeof u.role === 'number' ? u.role : undefined));

      // If roles is an array, try to find a role object indicating FUNCIONARIO (id===2 or name includes 'FUNCION')
      if (Array.isArray(u.roles) && u.roles.length > 0) {
        const objRole = u.roles.find((r: any) => r && typeof r === 'object' && (Number(r.id) === 2 || String(r.name || r.role_name || r.role || r.rol || '').toUpperCase().includes('FUNCION')));
        if (objRole) {
          roleNameRaw = roleNameRaw || objRole.name || objRole.role_name || objRole.role || objRole.rol;
          roleId = roleId ?? (objRole.id ?? objRole.role_id ?? objRole.roleId);
        } else {
          const r0 = u.roles[0];
          if (r0 && typeof r0 === 'object') {
            roleNameRaw = roleNameRaw || r0.name || r0.role_name || r0.role || r0.rol;
            roleId = roleId ?? (r0.id ?? r0.role_id ?? r0.roleId);
          } else if (typeof r0 === 'number') {
            roleId = roleId ?? r0;
          }
        }
      }

      // If role is an object, prefer its fields
      if (u.role && typeof u.role === 'object') {
        roleNameRaw = roleNameRaw || u.role.name || u.role.role_name || u.role.role || u.role.rol;
        roleId = roleId ?? (u.role.id ?? u.role.role_id ?? u.role.roleId);
      }
    };
    normalizeFrom(ud);
    // Start with the role selected by the caller as the default
    let resolvedRole = rol || 'CIUDADANO';
    if (roleNameRaw) {
      const rn = String(roleNameRaw).trim().toUpperCase();
      if (rn.includes('FUNCION')) resolvedRole = 'FUNCIONARIO';
      else resolvedRole = rn === 'CIUDADANO' ? 'CIUDADANO' : rn;
    } else if (typeof roleId !== 'undefined' && roleId !== null) {
      resolvedRole = Number(roleId) === 2 ? 'FUNCIONARIO' : 'CIUDADANO';
    }

    const mapped = {
      id: String(data.user.id),
      nombre: data.user.nombre,
      email: data.user.email,
      telefono: data.user.telefono || data.user.phone || data.user.celular || data.user.telefono_celular || undefined,
      rol: resolvedRole,
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
