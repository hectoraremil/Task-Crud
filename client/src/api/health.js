const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function getHealthStatus() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error('No se pudo conectar con la API.');
  }

  return response.json();
}
