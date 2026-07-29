import { Router } from 'express';
import { createTask, getTasks, updateTask } from '../controllers/taskController.js';

const router = Router();

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);

export default router;
