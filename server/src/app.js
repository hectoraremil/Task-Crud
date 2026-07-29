import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
  })
);
app.use(express.json());

app.get('/', (_request, response) => {
  response.json({
    message: 'Task CRUD API lista para trabajar.',
  });
});

app.use('/api/health', healthRoutes);

export default app;
