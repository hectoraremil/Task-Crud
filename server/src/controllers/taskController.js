import { db, runQuery } from '../config/database.js';
import { env } from '../config/env.js';

function normalizeTaskPayload(body) {
  return {
    titulo: body.titulo?.trim() || '',
    descripcion: body.descripcion?.trim() || '',
    estado: body.estado?.trim() || 'Pendiente',
    fechaLimite: body.fechaLimite || null,
  };
}

function validateTaskPayload(task) {
  const validStates = ['Pendiente', 'En progreso', 'Completada'];

  if (!task.titulo) {
    return 'El titulo es obligatorio.';
  }

  if (task.titulo.length > 100) {
    return 'El titulo no puede superar los 100 caracteres.';
  }

  if (task.descripcion.length > 255) {
    return 'La descripcion no puede superar los 255 caracteres.';
  }

  if (!validStates.includes(task.estado)) {
    return 'El estado enviado no es valido.';
  }

  if (task.fechaLimite && Number.isNaN(Date.parse(task.fechaLimite))) {
    return 'La fecha limite no tiene un formato valido.';
  }

  return null;
}

export async function createTask(request, response) {
  const task = normalizeTaskPayload(request.body);
  const validationError = validateTaskPayload(task);

  if (validationError) {
    return response.status(400).json({
      message: validationError,
    });
  }

  try {
    const queryText = env.dbTrustedConnection
      ? `
        INSERT INTO dbo.tareas (titulo, descripcion, estado, fecha_limite)
        OUTPUT
          INSERTED.id,
          INSERTED.titulo,
          INSERTED.descripcion,
          INSERTED.estado,
          INSERTED.fecha_limite,
          INSERTED.fecha_creacion
        VALUES (?, ?, ?, ?);
      `
      : `
        INSERT INTO dbo.tareas (titulo, descripcion, estado, fecha_limite)
        OUTPUT
          INSERTED.id,
          INSERTED.titulo,
          INSERTED.descripcion,
          INSERTED.estado,
          INSERTED.fecha_limite,
          INSERTED.fecha_creacion
        VALUES (@titulo, @descripcion, @estado, @fecha_limite);
      `;

    const result = await runQuery(queryText, [
      { name: 'titulo', type: db.NVarChar(100), value: task.titulo },
      { name: 'descripcion', type: db.NVarChar(255), value: task.descripcion || null },
      { name: 'estado', type: db.NVarChar(20), value: task.estado },
      { name: 'fecha_limite', type: db.Date, value: task.fechaLimite || null },
    ]);

    return response.status(201).json({
      message: 'Tarea creada correctamente.',
      task: result[0],
    });
  } catch (error) {
    return response.status(500).json({
      message: 'No se pudo crear la tarea.',
      error: error.message,
    });
  }
}
