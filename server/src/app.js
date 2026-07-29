import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();

const allowedOrigins = new Set([env.clientUrl, 'http://localhost:5173', 'http://localhost:5174']);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origen no permitido por CORS.'));
    },
  })
);
app.use(express.json());

app.get('/', (_request, response) => {
  response.json({
    message: 'Task CRUD API lista para trabajar.',
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/tasks', taskRoutes);

export default app;
