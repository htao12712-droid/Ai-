import { Router } from 'express';
import strategyController from '../controllers/strategyController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', strategyController.createStrategy.bind(strategyController));
router.get('/', strategyController.getStrategies.bind(strategyController));
router.get('/:id', strategyController.getStrategyById.bind(strategyController));
router.put('/:id', strategyController.updateStrategy.bind(strategyController));
router.delete('/:id', strategyController.deleteStrategy.bind(strategyController));

export default router;
