// C:\Mi_TurnoMuni\src\services\documentosService.ts
import api from '../config/api'; // ✅ Importa desde tu api.ts existente

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    turnoId: string;
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
  };
  responseTime: string;
}

export const uploadDocumento = async (
  turnoId: string,
  uri: string,
  token?: string
): Promise<UploadResponse> => {
  try {
    // Convertir URI local a blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Crear FormData
    const formData = new FormData();
    formData.append('documento', {
      uri,
      type: blob.type,
      name: `documento-${turnoId}.jpg`,
    } as any);
    
    // Enviar al backend usando API_URL de tu config
    const res = await fetch(`${api.API_URL}/turnos/${turnoId}/documento`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al subir el documento');
    }
    
    return await res.json();
  } catch (error: any) {
    console.error('Error en uploadDocumento:', error);
    throw error;
  }
};