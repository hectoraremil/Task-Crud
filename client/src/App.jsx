import { useEffect, useMemo, useState } from 'react';
import { getHealthStatus } from './api/health';
import StatusCard from './components/StatusCard';

const starterTasks = [
  {
    id: 1,
    title: 'Configurar entorno base',
    description: 'Cliente React, servidor Express y conexion inicial a SQL Server.',
    state: 'Listo',
  },
  {
    id: 2,
    title: 'Preparar siguientes features',
    description: 'Crear, listar, editar y eliminar tareas en iteraciones separadas.',
    state: 'En progreso',
  },
];

export default function App() {
  const [health, setHealth] = useState({
    loading: true,
    server: 'Verificando...',
    database: 'Verificando...',
    error: '',
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

  const databaseTone = useMemo(() => {
    if (health.loading) return 'neutral';
    return health.database === 'Conectada' ? 'success' : 'warning';
  }, [health.database, health.loading]);

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
              <span className="panel__kicker">Roadmap inicial</span>
              <h2>Funciones preparadas para construir el CRUD</h2>
            </div>

            <ul className="feature-list">
              <li>Conexion centralizada entre frontend y backend.</li>
              <li>Configuracion lista para trabajar con SQL Server.</li>
              <li>Endpoint de salud para validar servidor y base de datos.</li>
              <li>Estructura modular para controladores, rutas y servicios.</li>
            </ul>
          </article>

          <article className="panel">
            <div className="panel__header">
              <span className="panel__kicker">Vista previa</span>
              <h2>Tareas de ejemplo</h2>
            </div>

            <div className="task-preview">
              {starterTasks.map((task) => (
                <article key={task.id} className="task-card">
                  <div>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                  </div>
                  <span className="task-card__badge">{task.state}</span>
                </article>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
