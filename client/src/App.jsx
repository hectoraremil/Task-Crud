import { useEffect, useMemo, useState } from 'react';
import { createTask, deleteTask, getTasks, updateTask } from './api/tasks';

const initialForm = {
  titulo: '',
  descripcion: '',
  estado: 'Pendiente',
  fechaLimite: '',
};

export default function App() {
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
  const [statusUpdateId, setStatusUpdateId] = useState(null);

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

  const dashboardStats = useMemo(() => {
    const total = taskList.length;
    const completed = taskList.filter((task) => task.estado === 'Completada').length;
    const inProgress = taskList.filter((task) => task.estado === 'En progreso').length;
    const pending = taskList.filter((task) => task.estado === 'Pendiente').length;

    return { total, completed, inProgress, pending };
  }, [taskList]);

  const latestTasks = useMemo(() => taskList.slice(0, 6), [taskList]);

  const completionRate = useMemo(() => {
    if (!dashboardStats.total) {
      return 0;
    }

    return Math.round((dashboardStats.completed / dashboardStats.total) * 100);
  }, [dashboardStats]);

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

  function formatDateLabel(dateValue) {
    if (!dateValue) {
      return 'Sin fecha límite';
    }

    return new Date(dateValue).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function getBadgeClass(status) {
    if (status === 'Completada') return 'status-pill status-pill--success';
    if (status === 'En progreso') return 'status-pill status-pill--info';
    return 'status-pill status-pill--warning';
  }

  function buildTaskPayload(task, estado) {
    return {
      titulo: task.titulo,
      descripcion: task.descripcion || '',
      estado,
      fechaLimite: formatDateForInput(task.fecha_limite),
    };
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

  async function handleQuickStatusChange(task, estado) {
    setStatusUpdateId(task.id);
    setDeleteStatus({ loadingTaskId: null, type: '', message: '' });

    try {
      const result = await updateTask(task.id, buildTaskPayload(task, estado));

      setTaskList((current) => current.map((item) => (item.id === task.id ? result.task : item)));
      setDeleteStatus({
        loadingTaskId: null,
        type: 'success',
        message: `Estado cambiado a ${estado.toLowerCase()}.`,
      });
    } catch (error) {
      setDeleteStatus({
        loadingTaskId: null,
        type: 'warning',
        message: error.message,
      });
    } finally {
      setStatusUpdateId(null);
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
    <div className="dashboard-shell py-4 py-lg-5">
      <main className="container">
        <section className="dashboard-hero card border-0 shadow-lg overflow-hidden mb-4">
          <div className="card-body p-4 p-lg-5">
            <div className="row align-items-center g-4">
              <div className="col-lg-7">
                <span className="hero-kicker">Task Dashboard</span>
                <h1 className="display-5 fw-bold text-white mb-3">Gestiona tus tareas en un solo panel.</h1>
                <p className="hero-copy mb-4">
                  Crea, actualiza y organiza pendientes con una interfaz más limpia,
                  rápida y enfocada en productividad.
                </p>

                <div className="row g-3">
                  <div className="col-sm-6 col-xl-3">
                    <div className="stats-tile">
                      <span>Total</span>
                      <strong>{dashboardStats.total}</strong>
                    </div>
                  </div>
                  <div className="col-sm-6 col-xl-3">
                    <div className="stats-tile stats-tile--sky">
                      <span>En progreso</span>
                      <strong>{dashboardStats.inProgress}</strong>
                    </div>
                  </div>
                  <div className="col-sm-6 col-xl-3">
                    <div className="stats-tile stats-tile--amber">
                      <span>Pendientes</span>
                      <strong>{dashboardStats.pending}</strong>
                    </div>
                  </div>
                  <div className="col-sm-6 col-xl-3">
                    <div className="stats-tile stats-tile--mint">
                      <span>Completadas</span>
                      <strong>{dashboardStats.completed}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="progress-card">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                    <span className="panel-eyebrow">Resumen semanal</span>
                      <h2 className="h4 text-white mb-1">Rendimiento del tablero</h2>
                    </div>
                    <span className="completion-ring">{completionRate}%</span>
                  </div>

                  <div className="progress soft-progress mb-3">
                    <div
                      className="progress-bar soft-progress__bar"
                      role="progressbar"
                      style={{ width: `${completionRate}%` }}
                      aria-valuenow={completionRate}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>

                    <p className="text-light-emphasis mb-0">
                      {dashboardStats.completed} de {dashboardStats.total || 0} tareas están marcadas como completadas.
                    </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="row g-4">
          <div className="col-xl-4">
            <div className="card dashboard-card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <span className="panel-eyebrow">Nueva tarea</span>
                    <h2 className="h4 mb-1">Registrar actividad</h2>
                  </div>
                  <div className="mini-icon">+</div>
                </div>

                <form className="task-form" onSubmit={handleSubmit}>
                  <div>
                      <label className="form-label field-label">Título</label>
                    <input
                      className="form-control form-control-lg dashboard-input"
                      type="text"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      maxLength="100"
                      placeholder="Ej. Preparar informe semanal"
                      required
                    />
                  </div>

                  <div>
                      <label className="form-label field-label">Descripción</label>
                    <textarea
                      className="form-control dashboard-input dashboard-textarea"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      maxLength="255"
                      rows="4"
                      placeholder="Describe la tarea de forma breve"
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6 col-xl-12 col-xxl-6">
                      <label className="form-label field-label">Estado</label>
                      <select
                        className="form-select dashboard-input"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En progreso">En progreso</option>
                        <option value="Completada">Completada</option>
                      </select>
                    </div>

                    <div className="col-md-6 col-xl-12 col-xxl-6">
                      <label className="form-label field-label">Fecha límite</label>
                      <input
                        className="form-control dashboard-input"
                        type="date"
                        name="fechaLimite"
                        value={formData.fechaLimite}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <button className="btn btn-brand btn-lg w-100 mt-2" type="submit" disabled={formStatus.loading}>
                    {formStatus.loading ? 'Guardando...' : 'Guardar tarea'}
                  </button>

                  {formStatus.message ? (
                    <p className={`message message--${formStatus.type}`}>{formStatus.message}</p>
                  ) : null}
                </form>
              </div>
            </div>
          </div>

          <div className="col-xl-8">
            <div className="card dashboard-card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <div>
                    <span className="panel-eyebrow">Vista general</span>
                    <h2 className="h4 mb-1">Listado de tareas</h2>
                    <p className="section-copy mb-0">Tus tareas más recientes aparecen en formato dashboard.</p>
                  </div>
                  <span className="tasks-counter">{dashboardStats.total} registradas</span>
                </div>

                {deleteStatus.message ? (
                  <p className={`message message--${deleteStatus.type}`}>{deleteStatus.message}</p>
                ) : null}

                {taskListStatus.loading ? (
                  <div className="empty-panel text-center py-5">
                    <div className="spinner-border text-info mb-3" role="status" />
                    <h3 className="h5 text-white">Cargando tareas</h3>
                    <p className="mb-0 text-light-emphasis">Estamos preparando tu dashboard.</p>
                  </div>
                ) : taskListStatus.error ? (
                  <p className="message message--warning">{taskListStatus.error}</p>
                ) : latestTasks.length === 0 ? (
                  <div className="empty-panel text-center py-5">
                    <h3 className="h5 text-white">Aún no hay tareas registradas</h3>
                    <p className="mb-0 text-light-emphasis">Crea la primera tarea para llenar el tablero.</p>
                  </div>
                ) : (
                  <div className="d-grid gap-3">
                    {latestTasks.map((task) => (
                      <article key={task.id} className="task-board-card">
                        {editingTaskId === task.id ? (
                          <form className="task-form" onSubmit={handleEditSubmit}>
                            <div className="row g-3">
                              <div className="col-12">
                                <label className="form-label field-label">Título</label>
                                <input
                                  className="form-control dashboard-input"
                                  type="text"
                                  name="titulo"
                                  value={editFormData.titulo}
                                  onChange={handleEditChange}
                                  maxLength="100"
                                  required
                                />
                              </div>

                              <div className="col-12">
                                <label className="form-label field-label">Descripción</label>
                                <textarea
                                  className="form-control dashboard-input dashboard-textarea"
                                  name="descripcion"
                                  value={editFormData.descripcion}
                                  onChange={handleEditChange}
                                  maxLength="255"
                                  rows="3"
                                />
                              </div>

                              <div className="col-md-6">
                                <label className="form-label field-label">Estado</label>
                                <select
                                  className="form-select dashboard-input"
                                  name="estado"
                                  value={editFormData.estado}
                                  onChange={handleEditChange}
                                >
                                  <option value="Pendiente">Pendiente</option>
                                  <option value="En progreso">En progreso</option>
                                  <option value="Completada">Completada</option>
                                </select>
                              </div>

                              <div className="col-md-6">
                                <label className="form-label field-label">Fecha límite</label>
                                <input
                                  className="form-control dashboard-input"
                                  type="date"
                                  name="fechaLimite"
                                  value={editFormData.fechaLimite}
                                  onChange={handleEditChange}
                                />
                              </div>
                            </div>

                            {editStatus.message ? (
                              <p className={`message message--${editStatus.type}`}>{editStatus.message}</p>
                            ) : null}

                            <div className="d-flex flex-wrap gap-2 mt-3">
                              <button className="btn btn-brand" type="submit" disabled={editStatus.loading}>
                                {editStatus.loading ? 'Actualizando...' : 'Guardar cambios'}
                              </button>
                              <button className="btn btn-soft" type="button" onClick={cancelEditing}>
                                Cancelar
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="row g-3 align-items-start">
                            <div className="col-lg-7">
                              <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                                <h3 className="h5 text-white mb-0">{task.titulo}</h3>
                                <span className={getBadgeClass(task.estado)}>{task.estado}</span>
                              </div>

                              <p className="task-copy mb-3">{task.descripcion || 'Sin descripción registrada.'}</p>

                              <div className="d-flex flex-wrap gap-3 task-meta">
                                <span>Entrega: {formatDateLabel(task.fecha_limite)}</span>
                                <span>#{task.id}</span>
                              </div>
                            </div>

                            <div className="col-lg-5">
                              <div className="task-toolbar">
                                <div className="task-toolbar__group">
                                  <label className="form-label field-label field-label--small mb-1">Estado</label>
                                  <select
                                    className="form-select dashboard-input dashboard-input--compact task-status-select"
                                    value={task.estado}
                                    onChange={(event) => handleQuickStatusChange(task, event.target.value)}
                                    disabled={statusUpdateId === task.id}
                                  >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="En progreso">En progreso</option>
                                    <option value="Completada">Completada</option>
                                  </select>
                                </div>

                                <div className="task-toolbar__group task-toolbar__group--actions">
                                  <button className="btn btn-soft btn-sm px-3" type="button" onClick={() => startEditing(task)}>
                                    Editar
                                  </button>
                                  <button
                                    className="btn btn-danger-soft btn-sm px-3"
                                    type="button"
                                    onClick={() => handleDelete(task.id)}
                                    disabled={deleteStatus.loadingTaskId === task.id || statusUpdateId === task.id}
                                  >
                                    {deleteStatus.loadingTaskId === task.id ? '...' : 'Eliminar'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
