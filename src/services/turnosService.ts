import { API_URL } from './api';

async function post(url: string, payload: any, token?: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text().catch(() => null);

  return {
    ok: res.ok,
    status: res.status,
    contentType,
    text,
  };
}

export const crearTurno = async (payload: any, token?: string) => {
  const candidates = [`${API_URL}/api/turnos`, `${API_URL}/turnos`, `${API_URL}/v1/turnos`];
  const attempts: any[] = [];

  for (const url of candidates) {
    try {
      const result = await post(url, payload, token);
      attempts.push({ url, ...result });
      if (result.ok) {
        // Try to parse JSON when possible
        if (result.contentType.includes('application/json')) {
          try {
            return JSON.parse(result.text || '{}');
          } catch {
            return result.text;
          }
        }
        return result.text;
      }
    } catch (e: any) {
      attempts.push({ url, error: e?.message || String(e) });
    }
  }

  const err: any = new Error('No se pudo crear turno. Revisa los intentos.');
  err.attempts = attempts;
  throw err;
};

export const getTurnos = async (token?: string) => {
  const candidates = [`${API_URL}/api/turnos`, `${API_URL}/turnos`, `${API_URL}/v1/turnos`];
  const attempts: any[] = [];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
      const text = await res.text().catch(() => null);
      const contentType = res.headers.get('content-type') || '';
      attempts.push({ url, ok: res.ok, status: res.status, contentType, textPreview: (text || '').slice(0, 300) });
      if (res.ok) {
        if (contentType.includes('application/json')) return JSON.parse(text || '[]');
        try { return JSON.parse(text || '[]'); } catch { return []; }
      }
    } catch (e: any) {
      attempts.push({ url, error: String(e) });
    }
  }

  const err: any = new Error('No se pudieron obtener los turnos desde el servidor');
  err.attempts = attempts;
  throw err;
};

export const cancelarTurnoApi = async (id: string, token?: string) => {
  const patchCandidates = [
    { method: 'PATCH', url: `${API_URL}/api/turnos/${id}`, body: { estado: 'CANCELADO' } },
    { method: 'PATCH', url: `${API_URL}/turnos/${id}`, body: { estado: 'CANCELADO' } },
    { method: 'POST', url: `${API_URL}/api/turnos/${id}/cancel`, body: {} },
    { method: 'DELETE', url: `${API_URL}/api/turnos/${id}` },
  ];
  const attempts: any[] = [];

  for (const c of patchCandidates) {
    try {
      const res = await fetch(c.url, {
        method: c.method as any,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: c.body ? JSON.stringify(c.body) : undefined,
      });
      const text = await res.text().catch(() => null);
      attempts.push({ url: c.url, method: c.method, ok: res.ok, status: res.status, textPreview: (text || '').slice(0, 300) });
      if (res.ok) return true;
    } catch (e: any) {
      attempts.push({ url: c.url, method: c.method, error: String(e) });
    }
  }

  const err: any = new Error('No se pudo cancelar el turno en el servidor');
  err.attempts = attempts;
  throw err;
};

export const updateTurnoApi = async (id: string, payload: any, token?: string) => {
  const candidates = [
    { method: 'PATCH', url: `${API_URL}/api/turnos/${id}` },
    { method: 'PUT', url: `${API_URL}/api/turnos/${id}` },
    { method: 'PATCH', url: `${API_URL}/turnos/${id}` },
    { method: 'PUT', url: `${API_URL}/turnos/${id}` },
    { method: 'PATCH', url: `${API_URL}/v1/turnos/${id}` },
  ];
  const attempts: any[] = [];
  for (const c of candidates) {
    try {
      const res = await fetch(c.url, {
        method: c.method as any,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      const text = await res.text().catch(() => null);
      const ct = res.headers.get('content-type') || '';
      attempts.push({ url: c.url, method: c.method, ok: res.ok, status: res.status, contentType: ct, textPreview: (text || '').slice(0, 300) });
      if (res.ok) {
        if (ct.includes('application/json')) return JSON.parse(text || '{}');
        try { return JSON.parse(text || '{}'); } catch { return text; }
      }
    } catch (e: any) {
      attempts.push({ url: c.url, method: c.method, error: String(e) });
    }
  }

  const err: any = new Error('No se pudo actualizar el turno en el servidor');
  err.attempts = attempts;
  throw err;
};
