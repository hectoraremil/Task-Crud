import { useEffect, useMemo, useState } from 'react';
import { getHealthStatus } from './api/health';
import { createTask, deleteTask, getTasks, updateTask } from './api/tasks';
import StatusCard from './components/StatusCard';

const initialForm = {
  titulo: '',
  descripcion: '',
  estado: 'Pendiente',
  fechaLimite: '',
};

export default function App() {
  const [health, setHealth] = useState({
    loading: true,
    server: 'Verificando...',
    database: 'Verificando...',
    error: '',
  });
  const [formData, setFormData] = useState(initialForm);
  const [formStatus, setFormStatus] = useState({
    loading: false,
    type: '',
    message: '',
  });
  const [taskList, setTaskList] = useState([]);
  const [taskListStatus, setTaskListStatus] = useState({
    loading: true,
    error: '',
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editFormData, setEditFormData] = useState(initialForm);
  const [editStatus, setEditStatus] = useState({
    loading: false,
    type: '',
    message: '',
  });
  const [deleteStatus, setDeleteStatus] = useState({
    loadingTaskId: null,
    type: '',
    message: '',
  });

  useEffect(() => {
    async function loadHealth() {
      try {
        const data = await getHealthStatus();

        setHealth({
          loading: false,
          server: data.status,
          database: data.database,
          error: '',
        });
      } catch (error) {
        setHealth({
          loading: false,
          server: 'No disponible',
          database: 'Sin verificar',
          error: error.message,
        });
      }
    }

    loadHealth();
  }, []);

  useEffect(() => {
    async function loadTasks() {
      setTaskListStatus({ loading: true, error: '' });

      try {
        const data = await getTasks();
        setTaskList(data.tasks);
        setTaskListStatus({ loading: false, error: '' });
      } catch (error) {
        setTaskListStatus({ loading: false, error: error.message });
      }
    }

    loadTasks();
  }, []);

  const databaseTone = useMemo(() => {
    if (health.loading) return 'neutral';
    return health.database === 'Conectada' ? 'success' : 'warning';
  }, [health.database, health.loading]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function formatDateForInput(dateValue) {
    return dateValue ? dateValue.slice(0, 10) : '';
  }

  function startEditing(task) {
    setEditingTaskId(task.id);
    setEditFormData({
      titulo: task.titulo,
      descripcion: task.descripcion || '',
      estado: task.estado,
      fechaLimite: formatDateForInput(task.fecha_limite),
    });
    setEditStatus({ loading: false, type: '', message: '' });
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setEditFormData(initialForm);
    setEditStatus({ loading: false, type: '', message: '' });
  }

  async function handleDelete(taskId) {
    setDeleteStatus({ loadingTaskId: taskId, type: '', message: '' });

    try {
      const result = await deleteTask(taskId);

      setTaskList((current) => current.filter((task) => task.id !== taskId));
      if (editingTaskId === taskId) {
        cancelEditing();
      }
      setDeleteStatus({
        loadingTaskId: null,
        type: 'success',
        message: result.message,
      });
    } catch (error) {
      setDeleteStatus({
        loadingTaskId: null,
        type: 'warning',
        message: error.message,
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormStatus({ loading: true, type: '', message: '' });

    try {
      const result = await createTask(formData);

      setTaskList((current) => [result.task, ...current]);
      setFormData(initialForm);
      setFormStatus({
        loading: false,
        type: 'success',
        message: result.message,
      });
    } catch (error) {
      setFormStatus({
        loading: false,
        type: 'warning',
        message: error.message,
      });
    }
  }

  async function handleEditSubmit(event) {
    event.preventDefault();

    if (!editingTaskId) {
      return;
    }

    setEditStatus({ loading: true, type: '', message: '' });

    try {
      const result = await updateTask(editingTaskId, editFormData);

      setTaskList((current) =>
        current.map((task) => (task.id === editingTaskId ? result.task : task))
      );
      setEditStatus({
        loading: false,
        type: 'success',
        message: result.message,
      });
      setEditingTaskId(null);
      setEditFormData(initialForm);
    } catch (error) {
      setEditStatus({
        loading: false,
        type: 'warning',
        message: error.message,
      });
    }
  }

  return (
    <div className="page-shell">
      <main className="app-container">
        <section className="hero-panel">
          <div className="hero-panel__copy">
            <span className="eyebrow">Task manager setup</span>
            <h1>Organiza tus tareas con una base solida desde el inicio.</h1>
            <p>
              Esta primera entrega deja lista la arquitectura del proyecto para trabajar
              las siguientes features del CRUD con React, Express y SQL Server.
            </p>
          </div>

          <div className="hero-panel__status-grid">
            <StatusCard title="API" value={health.server} tone={health.error ? 'warning' : 'success'} />
            <StatusCard title="Base de datos" value={health.database} tone={databaseTone} />
          </div>

          {health.error ? <p className="message message--warning">{health.error}</p> : null}
        </section>

        <section className="content-grid">
          <article className="panel">
            <div className="panel__header">
              <span className="panel__kicker">Crear tarea</span>
              <h2>Registra una nueva tarea en la base de datos</h2>
            </div>

            <form className="task-form" onSubmit={handleSubmit}>
              <label className="field">
                <span>Titulo</span>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  maxLength="100"
                  placeholder="Ej. Preparar informe semanal"
                  required
                />
              </label>

              <label className="field">
                <span>Descripcion</span>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  maxLength="255"
                  rows="4"
                  placeholder="Describe la tarea de forma breve"
                />
              </label>

              <div className="field-row">
                <label className="field">
                  <span>Estado</span>
                  <select name="estado" value={formData.estado} onChange={handleChange}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En progreso">En progreso</option>
                    <option value="Completada">Completada</option>
                  </select>
                </label>

                <label className="field">
                  <span>Fecha limite</span>
                  <input
                    type="date"
                    name="fechaLimite"
                    value={formData.fechaLimite}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <button className="primary-button" type="submit" disabled={formStatus.loading}>
                {formStatus.loading ? 'Guardando...' : 'Guardar tarea'}
              </button>

              {formStatus.message ? (
                <p className={`message message--${formStatus.type}`}>{formStatus.message}</p>
              ) : null}
            </form>
          </article>

          <article className="panel">
            <div className="panel__header">
              <span className="panel__kicker">Listado</span>
              <h2>Tareas registradas en el sistema</h2>
            </div>

            {deleteStatus.message ? (
              <p className={`message message--${deleteStatus.type}`}>{deleteStatus.message}</p>
            ) : null}

            <div className="task-preview">
              {taskListStatus.loading ? (
                <div className="empty-state">
                  <h3>Cargando tareas</h3>
                  <p>Estamos consultando la informacion guardada en SQL Server.</p>
                </div>
              ) : taskListStatus.error ? (
                <p className="message message--warning">{taskListStatus.error}</p>
              ) : taskList.length === 0 ? (
                <div className="empty-state">
                  <h3>Aun no hay tareas registradas</h3>
                  <p>Usa el formulario para guardar la primera tarea del sistema.</p>
                </div>
              ) : (
                taskList.map((task) => (
                  <article key={task.id} className="task-card">
                    {editingTaskId === task.id ? (
                      <form className="task-form task-form--compact" onSubmit={handleEditSubmit}>
                        <label className="field">
                          <span>Titulo</span>
                          <input
                            type="text"
                            name="titulo"
                            value={editFormData.titulo}
                            onChange={handleEditChange}
                            maxLength="100"
                            required
                          />
                        </label>

                        <label className="field">
                          <span>Descripcion</span>
                          <textarea
                            name="descripcion"
                            value={editFormData.descripcion}
                            onChange={handleEditChange}
                            maxLength="255"
                            rows="3"
                          />
                        </label>

                        <div className="field-row">
                          <label className="field">
                            <span>Estado</span>
                            <select name="estado" value={editFormData.estado} onChange={handleEditChange}>
                              <option value="Pendiente">Pendiente</option>
                              <option value="En progreso">En progreso</option>
                              <option value="Completada">Completada</option>
                            </select>
                          </label>

                          <label className="field">
                            <span>Fecha limite</span>
                            <input
                              type="date"
                              name="fechaLimite"
                              value={editFormData.fechaLimite}
                              onChange={handleEditChange}
                            />
                          </label>
                        </div>

                        {editStatus.message ? (
                          <p className={`message message--${editStatus.type}`}>{editStatus.message}</p>
                        ) : null}

                        <div className="task-card__actions">
                          <button className="primary-button" type="submit" disabled={editStatus.loading}>
                            {editStatus.loading ? 'Actualizando...' : 'Guardar cambios'}
                          </button>
                          <button className="secondary-button" type="button" onClick={cancelEditing}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div>
                          <h3>{task.titulo}</h3>
                          <p>{task.descripcion || 'Sin descripcion'}</p>
                          <small className="task-card__meta">
                            Fecha limite: {task.fecha_limite ? task.fecha_limite.slice(0, 10) : 'No definida'}
                          </small>
                        </div>
                        <div className="task-card__side">
                          <span className="task-card__badge">{task.estado}</span>
                          <div className="task-card__actions task-card__actions--stacked">
                            <button className="secondary-button" type="button" onClick={() => startEditing(task)}>
                              Editar
                            </button>
                            <button
                              className="danger-button"
                              type="button"
                              onClick={() => handleDelete(task.id)}
                              disabled={deleteStatus.loadingTaskId === task.id}
                            >
                              {deleteStatus.loadingTaskId === task.id ? 'Eliminando...' : 'Eliminar'}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </article>
                ))
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
