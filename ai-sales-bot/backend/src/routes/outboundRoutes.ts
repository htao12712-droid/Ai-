import { Router } from 'express';
import outboundController from '../controllers/outboundController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/calls', outboundController.createCall.bind(outboundController));
router.get('/calls/:id', outboundController.getCall.bind(outboundController));
router.get('/calls', outboundController.getCalls.bind(outboundController));
router.put('/calls/:id/status', outboundController.updateCallStatus.bind(outboundController));
router.post('/calls/:id/transcript', outboundController.addTranscript.bind(outboundController));
router.post('/nlp/intent', outboundController.recognizeIntent.bind(outboundController));
router.post('/nlp/response', outboundController.generateResponse.bind(outboundController));
router.post('/calls/:id/analyze-intent', outboundController.analyzeCustomerIntent.bind(outboundController));
router.post('/nlp/extract-feedback', outboundController.extractFeedback.bind(outboundController));

export default router;
