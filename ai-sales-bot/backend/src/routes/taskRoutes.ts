import { Router } from 'express';
import taskController from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', taskController.createTask.bind(taskController));
router.get('/', taskController.getTasks.bind(taskController));
router.get('/:id', taskController.getTaskById.bind(taskController));
router.put('/:id', taskController.updateTask.bind(taskController));
router.delete('/:id', taskController.deleteTask.bind(taskController));
router.post('/:id/start', taskController.startTask.bind(taskController));
router.post('/:id/pause', taskController.pauseTask.bind(taskController));
router.get('/:id/statistics', taskController.getTaskStatistics.bind(taskController));

export default router;
