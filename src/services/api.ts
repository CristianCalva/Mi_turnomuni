export const API_URL = 'https://api.miturnomuni.gob.ec';

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
    throw new Error('Error en la API');
  }

  return response.json();
};
