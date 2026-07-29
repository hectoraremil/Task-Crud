import { Router } from 'express';
import { createTask } from '../controllers/taskController.js';

const router = Router();

router.post('/', createTask);

export default router;
