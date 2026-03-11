import { Router } from 'express';
import { getTasks, getTaskById, createTaskHandler, updateTaskHandler, deleteTaskHandler } from '../controllers/taskController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getTasks);
router.post('/', createTaskHandler);
router.get('/:id', getTaskById);
router.put('/:id', updateTaskHandler);
router.delete('/:id', deleteTaskHandler);

export default router;
