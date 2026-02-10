import { Router } from 'express';
import dataController from '../controllers/dataController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/calls', dataController.getCalls.bind(dataController));
router.get('/statistics/overview', dataController.getOverview.bind(dataController));
router.post('/quality-rating', dataController.addQualityRating.bind(dataController));
router.get('/quality-ratings', dataController.getQualityRatings.bind(dataController));
router.post('/export', dataController.exportReport.bind(dataController));

export default router;
