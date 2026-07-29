const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function getTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron cargar las tareas.');
  }

  return data;
}

export async function createTask(taskData) {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo crear la tarea.');
  }

  return data;
}

export async function updateTask(taskId, taskData) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo actualizar la tarea.');
  }

  return data;
}
