import { useEffect, useMemo, useState } from 'react';
import { getHealthStatus } from './api/health';
import { createTask } from './api/tasks';
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
  const [createdTasks, setCreatedTasks] = useState([]);

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

  async function handleSubmit(event) {
    event.preventDefault();
    setFormStatus({ loading: true, type: '', message: '' });

    try {
      const result = await createTask(formData);

      setCreatedTasks((current) => [result.task, ...current].slice(0, 4));
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
              <span className="panel__kicker">Resultado</span>
              <h2>Tareas creadas recientemente</h2>
            </div>

            <div className="task-preview">
              {createdTasks.length === 0 ? (
                <div className="empty-state">
                  <h3>Aun no has creado tareas</h3>
                  <p>Usa el formulario para registrar la primera tarea del sistema.</p>
                </div>
              ) : (
                createdTasks.map((task) => (
                  <article key={task.id} className="task-card">
                    <div>
                      <h3>{task.titulo}</h3>
                      <p>{task.descripcion || 'Sin descripcion'}</p>
                      <small className="task-card__meta">
                        Fecha limite: {task.fecha_limite ? task.fecha_limite.slice(0, 10) : 'No definida'}
                      </small>
                    </div>
                    <span className="task-card__badge">{task.estado}</span>
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
